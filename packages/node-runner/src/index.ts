import { TestGroup, TestCase } from 'testious';
import { performance } from 'perf_hooks';

export interface TestCaseResultDetail {
  time: number;
  status: 'success' | 'failed';
  error: Error | null;
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
      const statusEmoji = c.status === 'success' ? '✅' : '❌';
      console.log(
        `  Case #${i + 1}: ${statusEmoji} Time: ${c.time.toFixed(2)} ms`,
      );
      if (c.error) {
        console.log(`    Error:`);
        console.error(c.error);
      }
    });
  }
}

export class NodeRunner {
  static totalSuccess = 0;
  static totalFail = 0;

  private static runCase(testCase: TestCase, report: TestReport) {
    let start = performance.now();
    let success = false;
    let error: Error | null = null;

    try {
      testCase.fn();
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
      error,
    });
  }

  static run(groups: TestGroup[]) {
    let start = performance.now();
    for (let i = 0; i < groups.length; i++) {
      let cases = groups[i].cases;
      let report = new TestReport(groups[i]);
      report.markStart();
      for (let j = 0; j < cases.length; j++) {
        this.runCase(cases[j], report);
      }
      report.markEnd();
      report.show();
    }
    let end = performance.now();
    let time = end - start;
    console.log(`All test run in ${time}ms`);
  }
}
