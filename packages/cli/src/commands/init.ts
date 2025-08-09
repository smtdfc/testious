import path from 'path';
import { cpSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function init(options: any) {
  console.log('[Testious CLI]: Initializing test');
  const from = resolve(path.join(__dirname, '../data/test'));

  const to = resolve(path.join(cwd, './'));

  cpSync(from, to, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });

  if (options.install) {
    console.log(`[Testious CLI]: Installing ...`);

    spawn('npm', ['i', '-D', 'testious', 'webpack'], {
      stdio: 'inherit',
      shell: true,
    });
  }

  console.log('[Testious CLI]: Test created successfully');
}
