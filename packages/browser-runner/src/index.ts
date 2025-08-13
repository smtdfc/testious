import { TestGroup, TestCase } from 'testious';

declare global {
  interface Window {
    TESTIOUS_DISPLAY_HELPER?: any;
  }
}

const HELPER = window.TESTIOUS_DISPLAY_HELPER as any;
export interface TestError {
  message: string;
  stack?: string;
}

export interface TestCaseResultDetail {
  time: number;
  status: 'passed' | 'failed';
  error: TestError | null;
  target: TestCase;
}

export class TestReport {
  public cases: TestCaseResultDetail[] = [];
  private start: number = 0;
  private end: number = 0;
  public time: number = 0;
  public id: string = (Math.floor(Math.random() * 1000) * Date.now()).toString(
    32,
  );
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
    const passedCount = this.cases.filter((c) => c.status === 'passed').length;
    const failedCount = this.cases.length - passedCount;
    console.log(`Passed: ${passedCount} | Failed: ${failedCount}`);
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
  static totalPassed = 0;
  static totalFail = 0;

  private static async runCase(testCase: TestCase, report: TestReport) {
    let start = performance.now();
    let passed = false;
    let error: Error | null = null;
    let caseID = (Math.floor(Math.random() * 1000) * Date.now()).toString(32);
    HELPER.addCase(report.id, caseID, testCase.description, 'RUNNING');
    try {
      await testCase.fn();
      passed = true;
    } catch (e: any) {
      error = e as Error;
      passed = false;
    }

    let end = performance.now();
    let time = end - start;
    HELPER.updateCaseStatus(report.id, caseID, passed ? 'passed' : 'failed');

    report.cases.push({
      time,
      status: passed ? 'passed' : 'failed',
      error: error && {
        message: error?.message ?? 'Unknown Error',
        stack: error?.stack ?? '{}',
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
      HELPER.addGroup(report.id, groups[i].description);
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
