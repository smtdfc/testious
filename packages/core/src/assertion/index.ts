export class Assertion {
  constructor(public value: any, private isNot = false) {}

  private check(condition: boolean, message: string): this {
    if (this.isNot ? condition : !condition) {
      throw new Error(message);
    }
    return this;
  }

  get not(): Assertion {
    return new Assertion(this.value, !this.isNot);
  }

  toBe(expected: any): this {
    return this.check(
      this.value === expected,
      `Expected ${this.value} to be ${expected}`,
    );
  }

  toEqual(expected: any): this {
    const eq = JSON.stringify(this.value) === JSON.stringify(expected);
    return this.check(
      eq,
      `Expected ${JSON.stringify(this.value)} to equal ${JSON.stringify(
        expected,
      )}`,
    );
  }

  toStrictEqual(expected: any): this {
    const eq = JSON.stringify(this.value) === JSON.stringify(expected);
    return this.check(
      eq,
      `Expected strict equal to ${JSON.stringify(expected)}`,
    );
  }

  toBeNull(): this {
    return this.check(
      this.value === null,
      `Expected null but got ${this.value}`,
    );
  }

  toBeUndefined(): this {
    return this.check(
      this.value === undefined,
      `Expected undefined but got ${this.value}`,
    );
  }

  toBeDefined(): this {
    return this.check(
      this.value !== undefined,
      `Expected defined value but got undefined`,
    );
  }

  toBeTruthy(): this {
    return this.check(
      Boolean(this.value),
      `Expected truthy but got ${this.value}`,
    );
  }

  toBeFalsy(): this {
    return this.check(!this.value, `Expected falsy but got ${this.value}`);
  }

  toBeGreaterThan(n: number): this {
    return this.check(this.value > n, `Expected ${this.value} > ${n}`);
  }

  toBeGreaterThanOrEqual(n: number): this {
    return this.check(this.value >= n, `Expected ${this.value} >= ${n}`);
  }

  toBeLessThan(n: number): this {
    return this.check(this.value < n, `Expected ${this.value} < ${n}`);
  }

  toBeLessThanOrEqual(n: number): this {
    return this.check(this.value <= n, `Expected ${this.value} <= ${n}`);
  }

  toBeCloseTo(n: number, precision = 2): this {
    const diff = Math.abs(this.value - n);
    const pass = diff < Math.pow(10, -precision) / 2;
    return this.check(
      pass,
      `Expected ${this.value} to be close to ${n} with precision ${precision}`,
    );
  }

  toMatch(regex: RegExp | string): this {
    const r = typeof regex === 'string' ? new RegExp(regex) : regex;
    return this.check(
      r.test(this.value),
      `Expected ${this.value} to match ${regex}`,
    );
  }

  toContain(item: any): this {
    return this.check(
      this.value.includes(item),
      `Expected ${JSON.stringify(this.value)} to contain ${item}`,
    );
  }

  toContainEqual(item: any): this {
    const found = this.value.some(
      (el: any) => JSON.stringify(el) === JSON.stringify(item),
    );
    return this.check(
      found,
      `Expected ${JSON.stringify(this.value)} to contain equal ${JSON.stringify(
        item,
      )}`,
    );
  }

  toHaveProperty(key: string, expected?: any): this {
    const has = key in this.value;
    if (!has)
      return this.check(false, `Expected object to have property ${key}`);
    if (arguments.length === 2) {
      return this.check(
        this.value[key] === expected,
        `Expected property ${key} to be ${expected}`,
      );
    }
    return this;
  }

  toHaveKey(key: string): this {
    return this.check(
      Object.prototype.hasOwnProperty.call(this.value, key),
      `Expected object to have key ${key}`,
    );
  }

  toHaveKeys(keys: string[]): this {
    const hasAll = keys.every((k) =>
      Object.prototype.hasOwnProperty.call(this.value, k),
    );
    return this.check(
      hasAll,
      `Expected object to have keys ${keys}, got ${Object.keys(this.value)}`,
    );
  }

  toHaveValue(val: any): this {
    const values = Object.values(this.value);
    return this.check(
      values.includes(val),
      `Expected object values to contain ${val}, got ${values}`,
    );
  }

  toThrow(expected?: string | RegExp): this {
    if (typeof this.value !== 'function') {
      throw new Error(`.toThrow() expects a function`);
    }
    let threw = false;
    try {
      this.value();
    } catch (err: any) {
      threw = true;
      if (expected) {
        const msg = err?.message ?? String(err);
        if (typeof expected === 'string') {
          return this.check(
            msg === expected,
            `Expected error message "${expected}", got "${msg}"`,
          );
        }
        if (expected instanceof RegExp) {
          return this.check(
            expected.test(msg),
            `Expected error matching ${expected}, got "${msg}"`,
          );
        }
      }
    }
    return this.check(threw, `Expected function to throw`);
  }

  toBeInstanceOf(ctor: any): this {
    return this.check(
      this.value instanceof ctor,
      `Expected ${this.value} to be instance of ${ctor.name}`,
    );
  }

  toBeTypeOf(type: string): this {
    return this.check(
      typeof this.value === type,
      `Expected type ${type}, got ${typeof this.value}`,
    );
  }
}

export const expectUtils = {
  anything: () => (val: any) => val !== null && val !== undefined,
  any: (ctor: any) => (val: any) => val instanceof ctor,
  arrayContaining: (arr: any[]) => (val: any[]) =>
    arr.every((v) => val.includes(v)),
  objectContaining: (obj: any) => (val: any) =>
    Object.entries(obj).every(
      ([k, v]) => JSON.stringify(val[k]) === JSON.stringify(v),
    ),
  stringContaining: (substr: string) => (val: string) => val.includes(substr),
  stringMatching: (regex: RegExp) => (val: string) => regex.test(val),
};

export function expectAsync(promise: Promise<any>) {
  return {
    get resolves() {
      return new Proxy(new Assertion(null), {
        get(_, prop) {
          return async (...args: any[]) => {
            const val = await promise;
            return (new Assertion(val) as any)[prop](...args);
          };
        },
      });
    },
    get rejects() {
      return new Proxy(new Assertion(null), {
        get(_, prop) {
          return async (...args: any[]) => {
            let err;
            try {
              await promise;
            } catch (e) {
              err = e;
            }
            if (!err) throw new Error('Expected promise to reject');
            return (new Assertion(err) as any)[prop](...args);
          };
        },
      });
    },
  };
}

export function expect(value: any) {
  if (value instanceof Promise) {
    return expectAsync(value);
  }
  return new Assertion(value);
}
