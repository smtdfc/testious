import { generateID } from '../utils';

export class TestCase {
  public id: string;
  constructor(public description: string, public cb: () => any) {
    this.id = generateID();
  }
}
