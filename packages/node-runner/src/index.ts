import { ALL_GROUP, TestGroup, TestRecord, TestReport } from 'testious';

export class NodeRunner {
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
        const start = process.hrtime.bigint();
        await caseInfo.cb();
        const end = process.hrtime.bigint();
        record.status = 'pass';
        record.time = Number(end - start) / 1_000_000; // ns -> ms
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

    return reports;
  }
}
