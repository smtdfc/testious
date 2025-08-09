import { TestCase } from './case.js';

let testCount = 0;
let groups: TestGroup[] = [];

export class TestGroup {
  public cases: TestCase[] = [];
  private beforeEachFns: (() => void)[] = [];
  private afterEachFns: (() => void)[] = [];

  constructor(public description: string = `Test group ${testCount++}`) {}

  beforeEach(fn: () => void) {
    this.beforeEachFns.push(fn);
  }

  afterEach(fn: () => void) {
    this.afterEachFns.push(fn);
  }

  it(description: string, fn: () => unknown, timeout: number = -1) {
    this.cases.push(
      new TestCase(description, async () => {
        for (const beforeFn of this.beforeEachFns) {
          await beforeFn();
        }

        if (timeout >= 0) {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error(`Test timed out after ${timeout}ms`)),
              timeout,
            );
          });

          await Promise.race([Promise.resolve(fn()), timeoutPromise]);
        } else {
          await fn();
        }

        for (const afterFn of this.afterEachFns) {
          await afterFn();
        }
      }),
    );
  }
}

export function describe(description: string, fn: (g: TestGroup) => unknown) {
  let group = new TestGroup(description);
  fn(group);
  groups.push(group);
}

export function allGroup(): TestGroup[] {
  return groups;
}
