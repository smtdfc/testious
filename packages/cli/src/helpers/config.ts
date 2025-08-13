import { promises as fs } from 'fs';
import path from 'path';
import { Config } from '../types/index.js';

export async function readConfig(dir: string): Promise<Config> {
  try {
    const data = await fs.readFile(
      path.join(dir, 'testious.config.json'),
      'utf-8',
    );
    return JSON.parse(data) as Config;
  } catch (error) {
    console.error(`Error when reading configuration file !`);
    throw error;
  }
}
