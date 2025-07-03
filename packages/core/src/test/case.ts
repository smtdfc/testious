import {TestiousTestContext} from './context.js';

export interface TestiousTestCase {
  description: string;
  assertFn: (context: TestiousTestContext) => any;
}
