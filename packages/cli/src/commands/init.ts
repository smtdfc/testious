import { InitCommandOption } from '../types/index.js';
import { Logger, copyDir, __dirname } from '../helpers/index.js';
import path, { resolve } from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

function installDeps(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npm',
      [
        'i',
        'testious',
        'testious-node-runner',
        'rollup',
        '@rollup/plugin-commonjs',
        '@rollup/plugin-node-resolve',
        '-D',
      ],
      {
        shell: true,
        stdio: 'inherit',
      },
    );

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Install process exited with code ${code}`));
    });
  });
}

const cwd = process.cwd();

export async function init(options: InitCommandOption) {
  const logger = new Logger('Testious CLI');
  logger.info('Setting up testious ...');
  await copyDir(resolve(path.join(__dirname, '../data/test')), cwd);

  if (options.install) {
    logger.info('Installing dependencies ...');
    await installDeps();
  }

  logger.success('Successfully! Everything is ready to use. ');
}
