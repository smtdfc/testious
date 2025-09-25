import path from 'path';
import { cpSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function init(options: any) {
  console.log('[Testious CLI]: Initializing project');
  const from = resolve(path.join(__dirname, '../data/project'));

  const to = resolve(path.join(cwd));

  cpSync(from, to, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });

  console.log('[Testious CLI]: Project created successfully');
}
