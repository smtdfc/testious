import { allGroup } from 'testious';
import { NodeRunner } from 'testious-node-runner';

export function runTest() {
  NodeRunner.run(allGroup());
}
