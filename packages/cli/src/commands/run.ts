import { RunCommandOption } from '../types/index.js';
import {
  Logger,
  readConfig,
  renderTemplateToFile,
  dedent,
  __dirname,
} from '../helpers/index.js';
import path, { resolve } from 'path';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { Server } from 'testious-server';
import open from 'open';

const cwd = process.cwd();

function startRollup(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('rollup -c', {
      shell: true,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Rollup process exited with code ${code}`));
    });
  });
}

function startNodeRunner(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(`node --enable-source-maps ${filePath}`, {
      shell: true,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Node process exited with code ${code}`));
    });
  });
}

export async function run(options: RunCommandOption) {
  const logger = new Logger('Testious CLI');

  logger.info('Reading configuration ...');
  const config = await readConfig(cwd);

  const runnerFile: Record<string, string> = {
    browser: path.join(cwd, '.testious/browser.js'),
    node: path.join(cwd, '.testious/node.js'),
  };

  if (options.bundle) {
    logger.info('Preparing assets ...');

    if (
      config.runners &&
      config.runners.includes('browser') &&
      config?.entry?.browser
    ) {
      const browserEntry = path.join(cwd, config.entry.browser);
      const relativePath = path.relative(
        path.join(cwd, '.testious'),
        browserEntry,
      );

      const dir = path.dirname(runnerFile.browser);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(
        runnerFile.browser,
        dedent(`import "${relativePath}";
         import {allGroup} from 'testious';
         import {BrowserRunner} from 'testious-browser-runner';
         BrowserRunner.run(allGroup());
        `),
        'utf-8',
      );
    } else {
      const dir = path.dirname(runnerFile.browser);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(runnerFile.browser, dedent(''), 'utf-8');
    }

    if (
      config.runners &&
      config.runners.includes('node') &&
      config?.entry?.node
    ) {
      const nodeEntry = path.join(cwd, config.entry.node);
      const relativePath = path.relative(
        path.join(cwd, '.testious'),
        nodeEntry,
      );

      const dir = path.dirname(runnerFile.node);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(
        runnerFile.node,
        dedent(`import "${relativePath}";
         import {allGroup} from 'testious';
         import {NodeRunner} from 'testious-node-runner';
         NodeRunner.run(allGroup());
        `),
        'utf-8',
      );
    } else {
      const dir = path.dirname(runnerFile.node);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(runnerFile.node, dedent(''), 'utf-8');
    }

    await startRollup();
    logger.success('Assets created successfully. ');
  }

  console.clear();
  logger.info('Starting Runners ...');
  try {
    if (config.runners && config.runners.includes('node')) {
      logger.info('Starting Node runner ...');
      await startNodeRunner(path.join(cwd, '.testious/dist/node.runner.js'));
    }
  } catch (e) {}

  if (config.runners && config.runners.includes('browser')) {
    const port = config?.server?.port ?? 3030;
    const addr = `http://localhost:${port}`;
    const server = new Server(path.join(cwd, '.testious/dist'));
    logger.info('Starting Testious server ...');
    server.listen(port, () => {
      logger.info(`Testious server listening on ${addr}`);
      open(addr);
    });
  }
}
