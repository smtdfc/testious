import { readFileSync } from 'fs';
import { resolve } from 'path';

export type Config = {
  browser: string;
  node: string;
  server: {
    port: number;
  };
};

export function readConfig(path: string): Config {
  try {
    const fullPath = resolve(path);
    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as Config;
  } catch (err) {
    throw new Error(`Cannot read file ${path}: ${(err as Error).message}`);
  }
}
