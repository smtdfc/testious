export class TestCase {
  constructor(
    public description: string,
    public fn: () => unknown,
  ) {}

  run() {
    this.fn();
  }
}
