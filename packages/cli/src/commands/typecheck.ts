import path from 'path';
import { spawn } from 'child_process';

const cwd = process.cwd();

export function typecheck() {
  console.log('[Testious CLI]: Starting TSC');
  spawn('tsc', ['--noEmit'], {
    stdio: 'inherit',
    shell: true,
  });
}
