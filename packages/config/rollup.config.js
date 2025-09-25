import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import os from 'os';
import { getWorkspacePackages } from '../../helpers/index.js';

const isProduction = process.env.NODE_ENV === 'production';
const localPackages = getWorkspacePackages();

export default {
  input: 'src/index.ts',
  external: [
    ...Object.keys(localPackages),
    'cac',
    'fs',
    'path',
    'child_process',
    'url',
  ],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      moduleDirectories: ['node_modules', 'src'],
      preferBuiltins: true,
    }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: 'auto',
    }),
    typescript({ tsconfig: './tsconfig.json' }),
    isProduction &&
      terser({
        maxWorkers: os.cpus().length || 1,
      }),
  ],
};
