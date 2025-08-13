import typescript from '@rollup/plugin-typescript';
//import terser from '@rollup/plugin-terser';
import os from 'os';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  external: [
    'url',
    'cac',
    'path',
    'child_process',
    'fs',
    'rollup',
    '@rollup/plugin-node-resolve',
    '@rollup/plugin-commonjs',
  ],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: !isProduction,
    banner: '#!/usr/bin/env node',
    paths: {
      'testious-server': !isProduction
        ? '../../server/dist/index.js'
        : 'testious-server',
    },
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    /* isProduction &&
      terser({
        maxWorkers: os.cpus().length || 1,
      }),*/
  ],
};
