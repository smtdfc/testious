import { TestCase } from './case.js';
import { generateID } from '../utils';

export const ALL_GROUP: TestGroup[] = [];
export class TestGroup {
  public id: string;
  public cases: TestCase[] = [];
  constructor(public description: string) {
    this.id = generateID();
  }

  it(description: string, cb: () => any) {
    this.cases.push(new TestCase(description, cb));
  }
}

export function test(description: string, cb: (g: TestGroup) => void) {
  let group = new TestGroup(description);
  ALL_GROUP.push(group);
  cb(group);
}
