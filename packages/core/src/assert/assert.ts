export type MatcherFunction = (
  this: Assertion,
  ...args: any[]
) => void | Promise<void>;
export class Assertion {
  private static customMatchers: Record<string, MatcherFunction> = {};

  constructor(public value: any) {}

  toBe(expected: any) {
    if (this.value !== expected) {
      throw new Error(`Expected ${this.value} to be ${expected}`);
    }
  }

  toEqual(expected: any) {
    const isEqual = JSON.stringify(this.value) === JSON.stringify(expected);
    if (!isEqual) {
      throw new Error(
        `Expected ${JSON.stringify(this.value)} to equal ${JSON.stringify(expected)}`,
      );
    }
  }

  toBeTruthy() {
    if (!this.value) {
      throw new Error(`Expected ${this.value} to be truthy`);
    }
  }

  toBeFalsy() {
    if (this.value) {
      throw new Error(`Expected ${this.value} to be falsy`);
    }
  }

  toBeNull() {
    if (this.value !== null) {
      throw new Error(`Expected ${this.value} to be null`);
    }
  }

  toBeUndefined() {
    if (this.value !== undefined) {
      throw new Error(`Expected ${this.value} to be undefined`);
    }
  }

  toBeDefined() {
    if (this.value === undefined) {
      throw new Error(`Expected value to be defined, but received undefined`);
    }
  }

  toContain(expected: any) {
    if (typeof this.value === 'string' || Array.isArray(this.value)) {
      if (!this.value.includes(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(this.value)} to contain ${expected}`,
        );
      }
    } else {
      throw new Error(`toContain works only on strings or arrays`);
    }
  }

  toHaveLength(expectedLength: number) {
    if (typeof this.value !== 'string' && !Array.isArray(this.value)) {
      throw new Error(`toHaveLength works only on strings or arrays`);
    }
    if (this.value.length !== expectedLength) {
      throw new Error(
        `Expected length ${expectedLength}, but got ${this.value.length}`,
      );
    }
  }

  toHaveProperty(propertyPath: string, expectedValue?: any) {
    const parts = propertyPath.split('.');
    let val = this.value;
    for (const part of parts) {
      if (val == null || !(part in val)) {
        throw new Error(`Expected property "${propertyPath}" to exist`);
      }
      val = val[part];
    }
    if (arguments.length === 2 && val !== expectedValue) {
      throw new Error(
        `Expected property "${propertyPath}" to be ${expectedValue}, but got ${val}`,
      );
    }
  }

  toBeInstanceOf(expectedClass: any) {
    if (!(this.value instanceof expectedClass)) {
      throw new Error(
        `Expected object to be instance of ${expectedClass.name}`,
      );
    }
  }

  toMatchObject(expected: object) {
    if (typeof this.value !== 'object' || this.value == null) {
      throw new Error(`toMatchObject works only on non-null objects`);
    }
    const valObj = this.value as {
      [key: string]: any;
    };
    const expObj = expected as {
      [key: string]: any;
    };

    for (const key in expected) {
      if (
        !(key in valObj) ||
        JSON.stringify(valObj[key]) !== JSON.stringify(expObj[key])
      ) {
        throw new Error(
          `Expected property ${key} to match ${JSON.stringify(expObj[key])}, but got ${JSON.stringify(valObj[key])}`,
        );
      }
    }
  }

  toBeGreaterThan(expected: number) {
    if (!(this.value > expected)) {
      throw new Error(`Expected ${this.value} to be greater than ${expected}`);
    }
  }

  toBeLessThan(expected: number) {
    if (!(this.value < expected)) {
      throw new Error(`Expected ${this.value} to be less than ${expected}`);
    }
  }

  toBeCloseTo(expected: number, precision = 2) {
    if (typeof this.value !== 'number' || typeof expected !== 'number') {
      throw new Error(`toBeCloseTo works only on numbers`);
    }
    const factor = Math.pow(10, precision);
    if (Math.round(this.value * factor) !== Math.round(expected * factor)) {
      throw new Error(
        `Expected ${this.value} to be close to ${expected} with precision ${precision}`,
      );
    }
  }

  toThrow(expectedMessage?: string) {
    if (typeof this.value !== 'function') {
      throw new Error('toThrow expects a function');
    }
    try {
      this.value();
    } catch (error: any) {
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(
          `Expected error message to include "${expectedMessage}", but got "${error.message}"`,
        );
      }
      return; // success
    }
    throw new Error('Expected function to throw an error');
  }

  async toThrowAsync(expectedMessage?: string) {
    if (typeof this.value !== 'function') {
      throw new Error('toThrowAsync expects a function');
    }
    try {
      await this.value();
    } catch (error: any) {
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(
          `Expected async error message to include "${expectedMessage}", but got "${error.message}"`,
        );
      }
      return;
    }
    throw new Error('Expected async function to throw an error');
  }

  toHaveKey(key: string) {
    if (typeof this.value !== 'object' || this.value === null) {
      throw new Error(`toHaveKey works only on non-null objects`);
    }
    if (!(key in this.value)) {
      throw new Error(`Expected object to have key "${key}"`);
    }
  }

  private runCustomMatcher(name: string, args: any[]) {
    const matcher = Assertion.customMatchers[name];
    if (!matcher) {
      throw new Error(`No custom matcher registered with name "${name}"`);
    }
    return matcher.apply(this, args);
  }

  [key: string]: any;

  static addMatcher(name: string, fn: MatcherFunction) {
    if (name in Assertion.prototype) {
      throw new Error(`Cannot override existing method "${name}"`);
    }
    if (name in Assertion.customMatchers) {
      throw new Error(`Matcher "${name}" already exists`);
    }
    Assertion.customMatchers[name] = fn;
    (Assertion.prototype as any)[name] = function (...args: any[]) {
      return fn.apply(this, args);
    };
  }
}

export function expect(value: any): Assertion {
  return new Assertion(value);
}
