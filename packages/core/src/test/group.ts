import {TestiousTestCase} from "./case.js";
import {TestiousTestContext} from "./context.js";

export class TestiousTestGroup {
  public cases: TestiousTestCase[] = [];
  public context = new TestiousTestContext();
  
  constructor(public description: string) {}
  
  public it(description: string, assertFn: (context: TestiousTestContext) => any) {
    this.cases.push({ description, assertFn });
  }
  
  public async test() {
    console.log(`\n🧪 Test group: ${this.description}`);
    for (let i = 0; i < this.cases.length; i++) {
      const testCase = this.cases[i];
      try {
        await testCase.assertFn(this.context.createCaseContext());
        console.log(` ✅ PASSED: ${testCase.description}`);
      } catch (err) {
        console.error(` ❌ FAILED: ${testCase.description}`);
        console.error(`    ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
}

const _tests: TestiousTestGroup[] = [];

export function describe(description: string, fn: (group: TestiousTestGroup) => void) {
  const group = new TestiousTestGroup(description);
  fn(group);
  _tests.push(group);
}

export async function runTests() {
  console.log(`Running test ...`);
  for (const group of _tests) {
    await group.test();
  }
}