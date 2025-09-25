import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let deps = [];
try {
  const pkg = require(path.join(__dirname, 'package.json'));
  deps = Object.keys(pkg.dependencies ?? {});
  console.log('[rollup.config] Using external deps:', deps);
} catch {}

const entryPoint = process.env.TESTIOUS_ENTRY_POINT;
const outdir = process.env.TESTIOUS_OUTDIR;
const isBrowser = process.env.TESTIOUS_BROWSER === 'true';

export default {
  input: entryPoint,
  output: {
    file: outdir,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      moduleDirectories: ['node_modules', 'src'],
      preferBuiltins: !isBrowser,
      browser: isBrowser,
    }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: 'auto',
    }),
  ],
  external: isBrowser ? [] : deps,
};
