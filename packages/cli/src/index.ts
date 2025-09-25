#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { init, run } from './commands';

yargs()
  .scriptName('testious')
  .usage('$0 <cmd> [args]')
  .command('init', 'Init testious project', init)
  .command(
    'run',
    'Scan and run all test file',
    {
      node: {
        type: 'boolean',
        describe: 'Run on Node Runner',
        default: false,
      },
      browser: {
        type: 'boolean',
        describe: 'Run on Browser Runner',
        default: false,
      },
    },
    run,
  )
  .help()
  .parse(hideBin(process.argv));
