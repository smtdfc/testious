import { deepStrictEqual } from 'assert';


export class TestiousAssertion {
  constructor(public value: any, public isNegate: boolean = false) {}
  
  private fail(message: string) {
    throw new Error(message);
  }
  
  get not(): TestiousAssertion {
    return new TestiousAssertion(this.value, !this.isNegate);
  }
  
  toBe(val: any): this {
    const pass = this.value === val;
    if (pass === this.isNegate) {
      this.fail(`Expected ${this.value} ${this.isNegate ? "not " : ""}to be ${val}`);
    }
    return this;
  }
  
  toEqual(val: any): this {
    const pass = JSON.stringify(this.value) === JSON.stringify(val);
    if (pass === this.isNegate) {
      this.fail(`Expected ${JSON.stringify(this.value)} ${this.isNegate ? "not " : ""}to equal ${JSON.stringify(val)}`);
    }
    return this;
  }
  
  toBeTruthy(): this {
    const pass = !!this.value;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be truthy`);
    }
    return this;
  }
  
  toBeFalsy(): this {
    const pass = !this.value;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be falsy`);
    }
    return this;
  }
  
  toThrow(): this {
    if (typeof this.value !== 'function') {
      this.fail(`Expected value to be a function`);
    }
    let threw = false;
    try {
      this.value();
    } catch {
      threw = true;
    }
    if (threw === this.isNegate) {
      this.fail(`Expected function ${this.isNegate ? "not " : ""}to throw`);
    }
    return this;
  }
  
  toBeNull(): this {
    const pass = this.value === null;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be null`);
    }
    return this;
  }
  
  toBeUndefined(): this {
    const pass = this.value === undefined;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be undefined`);
    }
    return this;
  }
  
  toBeDefined(): this {
    const pass = this.value !== undefined;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be defined`);
    }
    return this;
  }
  
  toBeGreaterThan(val: number): this {
    const pass = this.value > val;
    if (pass === this.isNegate) {
      this.fail(`Expected ${this.value} ${this.isNegate ? "not " : ""}to be > ${val}`);
    }
    return this;
  }
  
  toBeGreaterThanOrEqual(val: number): this {
    const pass = this.value >= val;
    if (pass === this.isNegate) {
      this.fail(`Expected ${this.value} ${this.isNegate ? "not " : ""}to be >= ${val}`);
    }
    return this;
  }
  
  toBeLessThan(val: number): this {
    const pass = this.value < val;
    if (pass === this.isNegate) {
      this.fail(`Expected ${this.value} ${this.isNegate ? "not " : ""}to be < ${val}`);
    }
    return this;
  }
  
  toBeLessThanOrEqual(val: number): this {
    const pass = this.value <= val;
    if (pass === this.isNegate) {
      this.fail(`Expected ${this.value} ${this.isNegate ? "not " : ""}to be <= ${val}`);
    }
    return this;
  }
  
  toContain(item: any): this {
    const pass = Array.isArray(this.value) || typeof this.value === 'string' ?
      this.value.includes(item) :
      false;
    if (pass === this.isNegate) {
      this.fail(`Expected ${JSON.stringify(this.value)} ${this.isNegate ? "not " : ""}to contain ${item}`);
    }
    return this;
  }
  
  toMatch(matcher: string | RegExp): this {
    const pass = typeof this.value === 'string' &&
      (typeof matcher === 'string' ? this.value.includes(matcher) : matcher.test(this.value));
    if (pass === this.isNegate) {
      this.fail(`Expected string ${this.isNegate ? "not " : ""}to match ${matcher}`);
    }
    return this;
  }
  
  toHaveLength(len: number): this {
    const actual = this.value?.length;
    const pass = typeof actual === 'number' && actual === len;
    if (pass === this.isNegate) {
      this.fail(`Expected length ${this.isNegate ? "not " : ""}to be ${len}, got ${actual}`);
    }
    return this;
  }
  
  toBeInstanceOf(cls: any): this {
    const pass = this.value instanceof cls;
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be instance of ${cls.name}`);
    }
    return this;
  }
  
  toHaveProperty(path: string, expectedValue ? : any): this {
    const keys = path.split(".");
    let current = this.value;
    for (const key of keys) {
      if (current == null || !(key in current)) {
        if (!this.isNegate) {
          this.fail(`Expected object to have property '${path}', but it was not found`);
        } else return this;
      }
      current = current[key];
    }
    
    if (arguments.length === 2) {
      const pass = current === expectedValue;
      if (pass === this.isNegate) {
        this.fail(`Expected property '${path}' ${this.isNegate ? "not " : ""}to be ${expectedValue}, got ${current}`);
      }
    }
    
    if (this.isNegate && arguments.length === 1) {
      this.fail(`Expected object not to have property '${path}', but it exists`);
    }
    
    return this;
  }
  
  
  toStrictEqual(val: any): this {
    let pass = true;
    try {
      deepStrictEqual(this.value, val);
    } catch {
      pass = false;
    }
    
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to strictly equal ${JSON.stringify(val)}`);
    }
    
    return this;
  }
  
  toBeObject(): this {
    const pass = typeof this.value === "object" && this.value !== null && !Array.isArray(this.value);
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be a plain object`);
    }
    return this;
  }
  
  toHaveKeys(keys: string[]): this {
    if (typeof this.value !== "object" || this.value === null) {
      this.fail("Expected an object to check keys");
    }
    
    const actualKeys = Object.keys(this.value);
    const missing = keys.filter(k => !actualKeys.includes(k));
    const pass = missing.length === 0;
    
    if (pass === this.isNegate) {
      this.fail(`Expected object ${this.isNegate ? "not " : ""}to have keys ${keys.join(", ")}`);
    }
    
    return this;
  }
  
  toMatchObject(partial: object): this {
    const isMatch = (a: any, b: any): boolean => {
      if (typeof a !== "object" || a === null) return false;
      for (const key in b) {
        if (!(key in a)) return false;
        const valA = a[key];
        const valB = b[key];
        if (typeof valB === "object" && valB !== null) {
          if (!isMatch(valA, valB)) return false;
        } else {
          if (valA !== valB) return false;
        }
      }
      return true;
    };
    
    const pass = isMatch(this.value, partial);
    if (pass === this.isNegate) {
      this.fail(`Expected object ${this.isNegate ? "not " : ""}to match partial ${JSON.stringify(partial)}`);
    }
    return this;
  }
  
  toSatisfy(predicate: (val: any) => boolean): this {
    const pass = predicate(this.value);
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to satisfy given predicate`);
    }
    return this;
  }
  
  toBeFunction(): this {
    const pass = typeof this.value === "function";
    if (pass === this.isNegate) {
      this.fail(`Expected value ${this.isNegate ? "not " : ""}to be a function`);
    }
    return this;
  }
  
}

export function expect(val: any) {
  return new TestiousAssertion(val);
}