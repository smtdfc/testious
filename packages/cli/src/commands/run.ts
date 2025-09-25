import { readConfig } from 'testious-config';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  ensureRollupConfig,
  findFiles,
  writeFile,
  run as runCommand,
} from '../helpers';
import { Server } from 'testious-server';
import open from 'open';
import { TestReport, TestReportPrinter } from 'testious';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function generateNodeTestTemplate(entries: string[]): string {
  const entryPath = path.join(cwd, '.testious/node.entry.js');
  return `
${entries
  .map((v) => {
    let rel = path.relative(path.dirname(entryPath), v);
    if (!rel.startsWith('.')) {
      rel = './' + rel;
    }
    return `import sourceMapSupport from 'source-map-support';\nimport {NodeRunner} from 'testious-node-runner';\nimport {printReports} from 'testious';\nimport "${rel.replace(
      /\\/g,
      '/',
    )}";\nsourceMapSupport.install();\nlet report = await NodeRunner.runAll();\nnew printReports(report);`;
  })
  .join('\n')}
  `;
}

export function generateBrowserTestTemplate(entries: string[]): string {
  const entryPath = path.join(cwd, '.testious/browser.entry.js');
  return `
${entries
  .map((v) => {
    let rel = path.relative(path.dirname(entryPath), v);
    if (!rel.startsWith('.')) {
      rel = './' + rel;
    }
    return `import {BrowserRunner} from 'testious-browser-runner';\nimport {printReports} from 'testious';\nimport "${rel.replace(
      /\\/g,
      '/',
    )}";\nlet report = await BrowserRunner.runAll();\nnew printReports(report); `;
  })
  .join('\n')}
  `;
}

export async function run(options: any) {
  const configFilePath = path.join(cwd, './testious.config.json');
  const config = readConfig(configFilePath);
  ensureRollupConfig(path.join(cwd, '.testious'));

  if (options.node) {
    console.log('[Testious CLI]: Scanning test files ... ');
    const nodeTestFilePattern = config.node;
    const files = findFiles(cwd, [nodeTestFilePattern]);

    writeFile(
      generateNodeTestTemplate(files),
      path.join(cwd, '.testious/node.entry.js'),
    );

    console.log('[Testious CLI]: Bundling ... ');
    await runCommand('rollup', ['-c', '.testious/testious.rollup.config.js'], {
      env: {
        ...process.env,
        TESTIOUS_ENTRY_POINT: path.join(cwd, '.testious/node.entry.js'),
        TESTIOUS_OUTDIR: path.join(cwd, '.testious/node/index.js'),
      },
      stdio: 'inherit',
      shell: true,
    });

    console.log('[Testious CLI]: Running ... ');
    await runCommand('node', ['.testious/node/index.js'], {
      env: {
        ...process.env,
      },
      stdio: 'inherit',
      shell: true,
    });
  }

  if (options.browser) {
    console.log('[Testious CLI]: Scanning test files ... ');
    const browserTestFilePattern = config.browser;
    const files = findFiles(cwd, [browserTestFilePattern]);

    writeFile(
      generateBrowserTestTemplate(files),
      path.join(cwd, '.testious/browser.entry.js'),
    );

    console.log('[Testious CLI]: Bundling ... ');
    await runCommand('rollup', ['-c', '.testious/testious.rollup.config.js'], {
      env: {
        ...process.env,
        TESTIOUS_ENTRY_POINT: path.join(cwd, '.testious/browser.entry.js'),
        TESTIOUS_OUTDIR: path.join(cwd, '.testious/browser/index.js'),
        TESTIOUS_BROWSER: true,
      },
      stdio: 'inherit',
      shell: true,
    });

    console.log('[Testious CLI]: Preparing server ... ');
    const port = config?.server?.port ?? 5000;
    const server = new Server({
      port,
      assetsPath: path.join(cwd, '.testious/browser'),
    });

    console.log('[Testious CLI]: Running ... ');
    server.onTest = (data: string) => {
      let reports = JSON.parse(data);
      reports.forEach((report: any) => {
        let testReport = TestReport.fromJson(JSON.stringify(report));
        new TestReportPrinter(testReport).printAll();
      });
    };

    server.listen();

    await open(`http://localhost:${port}`);
  }
}
