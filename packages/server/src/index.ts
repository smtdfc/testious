import http, { IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

interface TestCaseTarget {
  description: string;
}

interface TestCaseError {
  message: string;
  stack ? : string;
}

interface TestCase {
  time: number;
  status: 'passed' | 'failed';
  error: TestCaseError | null;
  target: TestCaseTarget;
}

interface TestGroup {
  description: string;
  cases: TestCaseTarget[];
  beforeEachFns: any[];
  afterEachFns: any[];
}

interface Report {
  group: TestGroup;
  cases: TestCase[];
  start: number;
  end: number;
  time: number;
  id: string;
}

class TestGroupReporter {
  constructor(
    private group: TestGroup,
    private cases: TestCase[],
    private time: number
  ) {}
  
  show(): void {
    const successCount = this.cases.filter((c) => c.status === 'passed').length;
    const failedCount = this.cases.length - successCount;
    
    console.log('');
    console.log(chalk.bgCyan.black.bold('  Test Report  '));
    console.log(chalk.white(' Group: ') + chalk.yellow(this.group.description));
    console.log(chalk.gray('──────────────────────────────────────────────'));
    
    console.log(chalk.white(' Total Cases : ') + chalk.yellow(`${this.cases.length}`));
    console.log(chalk.white(' Passed     : ') + chalk.green(`${successCount}`));
    console.log(
      chalk.white(' Failed      : ') +
      (failedCount > 0 ? chalk.red(`${failedCount}`) : chalk.gray(`${failedCount}`))
    );
    console.log(
      chalk.white(' Total Time  : ') + chalk.magenta(`${this.time.toFixed(2)} ms`)
    );
    
    console.log(chalk.gray('──────────────────────────────────────────────'));
    console.log(chalk.white.bold(' Details:'));
    
    this.cases.forEach((c, i) => {
      const statusColor = c.status === 'passed' ? chalk.green : chalk.red;
      const statusIcon = c.status === 'passed' ? '✅' : '❌';
      const shortDesc =
        c.target.description.length > 50 ?
        c.target.description.slice(0, 47) + '...' :
        c.target.description;
      
      console.log(
        `  ${chalk.gray(`#${i + 1}`)} ${statusIcon} ${chalk.white(shortDesc)} ` +
        chalk.gray(`(Time: ${c.time.toFixed(2)} ms)`) +
        ` → ` +
        statusColor(c.status.toUpperCase())
      );
      
      if (c.error) {
        console.log(chalk.red('      Error:'));
        console.error(c.error);
      }
    });
    
    console.log(chalk.gray('──────────────────────────────────────────────'));
    console.log('');
  }
}

export class TestReporter {
  constructor(private reports: Report[]) {}
  
  showAll(): void {
    this.reports.forEach((r) => {
      const groupReporter = new TestGroupReporter(r.group, r.cases, r.time);
      groupReporter.show();
    });
    
    const totalCases = this.reports.reduce((sum, r) => sum + r.cases.length, 0);
    const totalPassed = this.reports.reduce(
      (sum, r) => sum + r.cases.filter((c) => c.status === 'passed').length,
      0
    );
    const totalFailed = totalCases - totalPassed;
    const totalTime = this.reports.reduce((sum, r) => sum + r.time, 0);
    
    console.log(chalk.bgBlue.white.bold('  Summary  '));
    console.log(chalk.white(' Total Cases : ') + chalk.yellow(totalCases));
    console.log(chalk.white(' Passed     : ') + chalk.green(totalPassed));
    console.log(
      chalk.white(' Failed      : ') +
      (totalFailed > 0 ? chalk.red(totalFailed) : chalk.gray(totalFailed))
    );
    console.log(chalk.white(' Total Time  : ') + chalk.magenta(`${totalTime.toFixed(2)} ms`));
    console.log('');
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Server {
  private server: http.Server;
  private folder: string;
  private indexFile: string;

  constructor(folder: string) {
    this.folder = folder;
    this.indexFile = path.resolve(__dirname, '../data/client/index.html');

    this.server = http.createServer(this.requestHandler.bind(this));
  }

  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    try {
      if (req.method === 'POST' && req.url === '/') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          let data = JSON.parse(body);
          new TestReporter(data.reports).showAll();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        });
        return;
      }

      let filePath: string;

      if (req.url === '/') {
        filePath = this.indexFile;
      } else {
        filePath = path.join(this.folder, req.url || '');
      }

      const data = await fs.readFile(filePath);
      const contentType = this.getContentType(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('File not found');
    }
  }

  private getContentType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.html':
        return 'text/html; charset=utf-8';
      case '.js':
        return 'text/javascript; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.ico':
        return 'image/x-icon';
      default:
        return 'application/octet-stream';
    }
  }

  public listen(port: number, callback?: () => void) {
    this.server.listen(port, callback);
  }

  public close(callback?: () => void) {
    this.server.close(callback);
  }
}
