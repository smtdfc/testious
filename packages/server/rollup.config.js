import typescript from '@rollup/plugin-typescript';
//import terser from '@rollup/plugin-terser';
import os from 'os';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  external: ['http', 'path', 'child_process', 'fs', 'url'],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: !isProduction,
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    /* isProduction &&
      terser({
        maxWorkers: os.cpus().length || 1,
      }),*/
  ],
};
