import { ALL_GROUP, TestGroup, TestRecord, TestReport } from 'testious';

declare global {
  interface Window {
    TESTIOUS: {
      onDone: (results: TestReport[]) => void;
    };
  }
}

export class BrowserRunner {
  static async runGroup(group: TestGroup): Promise<TestReport> {
    let report = new TestReport(group.id, group.description);
    for (let i = 0; i < group.cases.length; i++) {
      let caseInfo = group.cases[i]!;

      let record: TestRecord = {
        id: caseInfo.id,
        case: caseInfo,
        description: caseInfo.description,
        time: 0,
        status: 'skip',
      };

      try {
        const start = performance.now();
        await caseInfo.cb();
        const end = performance.now();
        record.status = 'pass';
        record.time = end - start;
      } catch (error: any) {
        record.status = 'fail';
        record.error = {
          message: error.message,
          stack: error.stack,
        };
        ``;
      }

      report.addRecord(record);
    }

    return report;
  }

  static async runAll(): Promise<TestReport[]> {
    let reports: TestReport[] = [];
    for (let i = 0; i < ALL_GROUP.length; i++) {
      reports.push(await this.runGroup(ALL_GROUP[i]));
    }
    window.TESTIOUS.onDone(reports);
    const json = `[${reports.map((v) => v.toJson()).join(',')}]`;
    fetch('/submit', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        result: json,
      }),
    });
    return reports;
  }
}
