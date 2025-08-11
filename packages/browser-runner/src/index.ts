import { TestGroup, TestCase } from 'testious';

export interface TestError {
  message: string;
  stack ? : string;
}

export interface TestCaseResultDetail {
  time: number;
  status: 'success' | 'failed';
  error: TestError | null;
  target: TestCase;
}

export class TestReport {
  public cases: TestCaseResultDetail[] = [];
  private start: number = 0;
  private end: number = 0;
  public time: number = 0;
  
  constructor(public group: TestGroup) {}
  
  markStart() {
    this.start = performance.now();
  }
  
  markEnd() {
    this.end = performance.now();
    this.time = this.end - this.start;
  }
  
  show() {
    console.log(`Test Group: ${this.group.description}`);
    console.log(`Total Cases: ${this.cases.length}`);
    const successCount = this.cases.filter(
      (c) => c.status === 'success',
    ).length;
    const failedCount = this.cases.length - successCount;
    console.log(`Success: ${successCount} | Failed: ${failedCount}`);
    console.log(`Total Time: ${this.time.toFixed(2)} ms`);
    console.log('Details:');
    this.cases.forEach((c, i) => {
      console.log(
        `  Case #${i + 1}: ${c.target.description} -> ${status.toUpperCase()} (Time: ${c.time.toFixed(2)} ms)`,
      );
      if (c.error) {
        console.log(`    Error:`);
        console.error(c.error.message + `\n` + c.error.stack);
      }
    });
  }
}

export class BrowserRunner {
  static totalSuccess = 0;
  static totalFail = 0;
  
  private static async runCase(testCase: TestCase, report: TestReport) {
    let start = performance.now();
    let success = false;
    let error: Error | null = null;
    
    try {
      await testCase.fn();
      success = true;
    } catch (e: any) {
      error = e as Error;
      success = false;
    }
    
    let end = performance.now();
    let time = end - start;
    report.cases.push({
      time,
      status: success ? 'success' : 'failed',
      error: error && {
        message: error?.message ?? "Unknown Error",
        stack: error?.stack ?? "{}"
      },
      target: testCase,
    });
  }
  
  static async run(groups: TestGroup[]) {
    let reports: TestReport[] = [];
    let start = performance.now();
    for (let i = 0; i < groups.length; i++) {
      let cases = groups[i].cases;
      let report = new TestReport(groups[i]);
      report.markStart();
      for (let j = 0; j < cases.length; j++) {
        await this.runCase(cases[j], report);
      }
      report.markEnd();
      report.show();
      reports.push(report);
    }
    let end = performance.now();
    let time = end - start;
    console.log(`[Browser Runner]: All test run in ${time}ms`);
    await fetch(`./`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reports,
        time,
      }),
    });
    console.log(`[Browser Runner]: Report sent `);
  }
}