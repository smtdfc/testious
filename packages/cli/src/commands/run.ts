import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { rollup } from 'rollup';
import {
  renderTemplateFromFile,
  readJSON,
  writeFileJSON,
  readFile,
} from '../helpers/index.js';
import { Config } from '../types/index.js';
import resolvePlugin from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import http from 'http';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cwd = process.cwd();

interface RunOptions {
  bundle?: boolean;
  browser?: boolean;
}

function runCommand(
  cmd: string,
  args: string[] = [],
  options: { cwd?: string } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    let errorOutput = '';
    const child = spawn(cmd, args, {
      shell: true,
      ...options,
    });

    child.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${errorOutput}`));
    });

    child.on('error', (err) => {
      reject(err); // Reject immediately if spawn failed
    });
  });
}

async function createBrowserBundle(config: Config) {
  const browserTempEntry = resolve(path.join(cwd, '.testious/browser.js'));
  fs.mkdirSync(path.dirname(browserTempEntry), { recursive: true });

  fs.writeFileSync(
    browserTempEntry,
    `
      import "${path.join(cwd, config.browserTestEntry ?? 'browser').replace(/\\/g, '/')}";
      import {runTest} from "${path.join(__dirname, '../data/runner/browser.js').replace(/\\/g, '/')}";
      runTest();
  `,
  );

  const browserBundle = await rollup({
    input: browserTempEntry,
    external: [],
    plugins: [resolvePlugin(), commonjs()],
  });

  await browserBundle.write({
    dir: path.join(cwd, 'dist/browser'),
    entryFileNames: 'runner.js',
    chunkFileNames: 'chunks/[name].js',
    format: 'iife',
    paths: {},
  });

  await browserBundle.close();
}

async function createNodeBundle(config: Config) {
  const nodeTempEntry = resolve(path.join(cwd, '.testious/node.js'));
  fs.mkdirSync(path.dirname(nodeTempEntry), { recursive: true });

  fs.writeFileSync(
    nodeTempEntry,
    `
      import "${path.join(cwd, config.nodeTestEntry ?? 'node/index.js').replace(/\\/g, '/')}";
      import {runTest} from "${path.join(__dirname, '../data/runner/node.js').replace(/\\/g, '/')}";
      runTest();
    `,
  );

  const nodeBundle = await rollup({
    input: nodeTempEntry,
    external: ['testious', 'testious-node-runner'],
    plugins: [resolvePlugin(), commonjs()],
  });

  await nodeBundle.write({
    dir: path.join(cwd, 'dist/node'),
    entryFileNames: 'runner.js',
    chunkFileNames: 'chunks/[name].js',
    format: 'esm',
    paths: {},
  });

  await nodeBundle.close();
}

export async function run(options: RunOptions): Promise<void> {
  console.log('[Testious CLI]: Running test ...');
  const config = readJSON<Config>(path.join(cwd, './testious.config.json'));

  let nodeBundleDist = path.join(cwd, 'dist/node/runner.js');
  let browserBundleDist = path.join(cwd, 'dist/browser/runner.js');

  if (options.bundle) {
    console.log('[Testious CLI]: Preparing assets ...');
    if (config.browserTestEntry) {
      await createBrowserBundle(config);
    }

    if (config.nodeTestEntry) {
      await createNodeBundle(config);
    }
  }

  console.clear();
  console.log('[Testious CLI]: Testing ...');

  try {
    console.log('[Testious CLI]: Running Node-runner ...');
    await runCommand(`node ${nodeBundleDist}`, [], {
      cwd: path.join(cwd, '.'),
    });
  } catch (error: any) {
    console.error(error);
  }

  if (options.browser) {
    console.log('[Testious CLI]: Running Browser-runner...');
    const source = readFile(browserBundleDist);
    const server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          console.log('[Testious CLI]: Client test run:', body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
        });
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        renderTemplateFromFile(
          path.join(__dirname, '../data/client/runner.html.tmpl'),
          { source },
        ),
      );
    });

    server.listen(3030, () => {
      console.log(
        '[Testious CLI]: Client test running in http://localhost:3030',
      );
      open('http://localhost:3030');
    });
  }
}
