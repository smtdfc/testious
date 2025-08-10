import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import {
  TestReportPrinter,
  FullReport,
  renderTemplateFromFile,
  readJSON,
  writeFileJSON,
  readFile,
} from '../helpers/index.js';
import { Config } from '../types/index.js';
import http from 'http';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cwd = process.cwd();

interface RunOptions {
  bundle ? : boolean;
  browser ? : boolean;
}

function runCommand(
  cmd: string,
  args: string[] = [],
  options: { cwd ? : string } = {},
): Promise < void > {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });
    
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(0);
    });
  });
}

async function createBrowserBundle(config: Config) {
  const browserTempEntry = resolve(path.join(cwd, '.testious/browser.js'));
  fs.mkdirSync(path.dirname(browserTempEntry), { recursive: true });
  const entryPath = path
    .relative(
      path.join(cwd, '.testious'),
      path.join(cwd, config.browserTestEntry ?? 'browser'),
    )
    .replace(/\\/g, '/');
  fs.writeFileSync(
    browserTempEntry,
    `${ config.browserTestEntry ? `import "${entryPath}";` : ""}
      import { allGroup } from 'testious';
      import { BrowserRunner } from 'testious-browser-runner';
      function runTest() {
        BrowserRunner.run(allGroup());
      }
      runTest();
    `.split('\n').map(line => line.trimStart()).join('\n'),
  );
}

async function createNodeBundle(config: Config) {
  const nodeTempEntry = resolve(path.join(cwd, '.testious/node.js'));
  fs.mkdirSync(path.dirname(nodeTempEntry), { recursive: true });
  
  const entryPath = path
    .relative(
      path.join(cwd, '.testious'),
      path.join(cwd, config.nodeTestEntry ?? 'node'),
    )
    .replace(/\\/g, '/');
  
  fs.writeFileSync(
    nodeTempEntry,
    `${config.nodeTestEntry ? `import "${entryPath}";` : ""}
      import { allGroup } from 'testious';
      import { NodeRunner } from 'testious-node-runner';
      function runTest() {
        NodeRunner.run(allGroup());
      }
      runTest();
    `.split('\n').map(line => line.trimStart()).join('\n')
  );
  
}

export async function run(options: RunOptions): Promise < void > {
  console.log('[Testious CLI]: Running test ...');
  const config = readJSON < Config > (path.join(cwd, './testious.config.json'));
  
  let nodeBundleDist = path.join(cwd, '.testious/dist/node.runner.js');
  let browserBundleDist = path.join(cwd, '.testious/dist/browser.runner.js');
  
  if (options.bundle) {
    console.log('[Testious CLI]: Preparing assets ...');
    await createBrowserBundle(config);
    await createNodeBundle(config);
    await runCommand(`rollup -c`, [], {
      cwd: path.join(cwd, '.'),
    });
  }
  
  console.clear();
  console.log('[Testious CLI]: Testing ...');
  
  try {
    console.log('[Testious CLI]: Running Node-runner ...');
    await runCommand(`node ${nodeBundleDist}`, [], {
      cwd: path.join(cwd, '.'),
    });
  } catch (error: any) {
    console.error(`[Testious CLI] Error when running test`);
  }
  
  if (options.browser) {
    console.log('\n[Testious CLI]: Running Browser-runner...');
    const source = readFile(browserBundleDist);
    const server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          let data = JSON.parse(body) as FullReport;
          new TestReportPrinter(data).show();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({}));
          server.close(() => {});
        });
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        renderTemplateFromFile(
          path.join(__dirname, '../data/client/runner.html.tmpl'), { source },
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