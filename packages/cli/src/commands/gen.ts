import {
  renderTemplateToFile,
  readJSON,
  writeFileJSON,
} from '../helpers/index.js';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Config } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function gen(itemType: string, name: string) {
  const config = readJSON<Config>(path.join(cwd, './testious.config.json'));

  if (itemType === 'group') {
    renderTemplateToFile(
      resolve(path.join(__dirname, '../data/group/index.test.tmpl')),
      { name },
      resolve(path.join(cwd, `./${name}.test.js`)),
    );
  }
}
