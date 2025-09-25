import { TestCase, TestGroup } from '../group';
import { generateID } from '../utils';

export type TestRecord = {
  id: string;
  description: string;
  case: TestCase;
  time: number;
  status: 'pass' | 'fail' | 'skip';
  error?: {
    message: string;
    stack: any;
  };
};

export class TestReport {
  public id: string;
  public records: TestRecord[] = [];
  constructor(public groupID: string, public description: string) {
    this.id = generateID();
  }

  static fromJson(raw: string): TestReport {
    let data = JSON.parse(raw) as {
      group: string;
      id: string;
      description: string;
      cases: TestRecord[];
      time: {
        avg: number;
        sun: number;
      };
    };

    let report = new TestReport(data.group, data.description);
    report.id = data.id;
    report.records = data.cases;
    return report;
  }

  calcuteTime(): {
    avg: number;
    sum: number;
  } {
    let totalTime = this.records.reduce((prev, curr, idx, arr) => {
      return prev + curr.time;
    }, 0);

    return {
      sum: totalTime,
      avg: totalTime / this.records.length,
    };
  }

  addRecord(record: TestRecord) {
    this.records.push(record);
  }

  toJson(): string {
    return JSON.stringify({
      group: this.groupID,
      id: this.id,
      cases: this.records,
      time: this.calcuteTime(),
    });
  }
}

export class TestReportPrinter {
  constructor(private report: TestReport) {}

  printSummary() {
    const { sum, avg } = this.report.calcuteTime();

    console.log('\n=== Test Summary ===');
    console.log(`Group: ${this.report.description}`);
    console.log(`Report ID: ${this.report.id}`);
    console.log(`Total Cases: ${this.report.records.length}`);
    console.log(`Total Time: ${sum.toFixed(2)} ms`);
    console.log(`Average Time: ${avg.toFixed(2)} ms`);
  }

  printCases() {
    console.log('\n--- Test Cases ---');

    this.report.records.forEach((rec: TestRecord, idx) => {
      console.log(
        `${idx + 1}. ${rec.description} [${rec.status}] (${rec.time} ms)`,
      );

      if (rec.status === 'fail' && rec.error) {
        console.log(`   ↳ ${rec.error.message}`);
        if (rec.error.stack) {
          console.log(`   ${rec.error.stack}`);
        }
      }
    });
  }

  printAll() {
    this.printSummary();
    this.printCases();
    console.log('\n===========================\n');
  }
}

export function printReports(reports: TestReport[]) {
  for (let index = 0; index < reports.length; index++) {
    new TestReportPrinter(reports[index]).printAll();
  }
}
