import { allGroup } from '../../../core/dist/index.js';
import { BrowserRunner } from 'testious-browser-runner';

export function runTest() {
  BrowserRunner.run(allGroup());
}
