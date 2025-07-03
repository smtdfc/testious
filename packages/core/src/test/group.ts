import { TestiousTestCase } from "./case.js";
import { TestiousTestContext } from "./context.js";
import { performance } from "perf_hooks";



export class TestiousTestGroup {
  public cases: TestiousTestCase[] = [];
  public context = new TestiousTestContext();
  
  public passed = 0;
  public failed = 0;
  
  constructor(public description: string) {}
  
  public it(description: string, assertFn: (context: TestiousTestContext) => any) {
    this.cases.push({ description, assertFn });
  }
  
  public get total() {
    return this.cases.length;
  }
  
  public async test() {
    console.log(`\n🧪 Test group: ${this.description}`);
    const groupStart = performance.now();
    
    for (const testCase of this.cases) {
      const start = performance.now();
      try {
        await testCase.assertFn(this.context.createCaseContext());
        const duration = performance.now() - start;
        console.log(` ✅ PASSED: ${testCase.description} (${duration.toFixed(2)} ms)`);
        this.passed++;
      } catch (err) {
        const duration = performance.now() - start;
        console.error(` ❌ FAILED: ${testCase.description} (${duration.toFixed(2)} ms)`);
        if (err instanceof Error) {
          console.error(`    ${err.message}`);
          console.error("    Stack trace:");
          console.error(indentStack(err.stack ?? ""));
        } else {
          console.error(`    ${String(err)}`);
        }
        this.failed++;
      }
    }
    
    const groupDuration = performance.now() - groupStart;
    console.log(`⏱️ Group finished in ${groupDuration.toFixed(2)} ms`);
  }
}


function indentStack(stack: string): string {
  return stack
    .split("\n")
    .slice(1) 
    .map(line => "      " + line.trim())
    .join("\n");
}

const _tests: TestiousTestGroup[] = [];

export function describe(description: string, fn: (group: TestiousTestGroup) => void) {
  const group = new TestiousTestGroup(description);
  fn(group);
  _tests.push(group);
}

export async function runTests() {
  console.log(`Running test ...`);
  let total = 0;
  let passed = 0;
  let failed = 0;
  
  for (const group of _tests) {
    await group.test();
    total += group.total;
    passed += group.passed;
    failed += group.failed;
  }
  
  console.log(`\n📊 Test Summary:`);
  console.log(`   Total: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log(`\n🎉 All tests passed!`);
  } else {
    console.log(`\n💥 ${failed} test(s) failed.`);
    process.exitCode = 1;
  }
}