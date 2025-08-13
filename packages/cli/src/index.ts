import { cac } from 'cac';
import * as commands from './commands/index.js';
import { InitCommandOption, RunCommandOption } from './types/index.js';

const cli = cac('testious');

cli
  .command('init', 'Create new test ')
  .option('--no-install', 'Do not automatically install packages using npm')
  .action((options: InitCommandOption) => commands.init(options));

cli
  .command('create <type> <value>', 'Create item  ')
  .action((_type: string, value: string) => commands.create(_type, value));

cli
  .command('run', 'Run test ')
  .option('--browser', 'Run test on browser')
  .option('--bundle', 'Bundle asset with bundler')
  .action((options: RunCommandOption) => commands.run(options));

cli.parse();

if (!cli.matchedCommand) {
  cli.outputHelp();
}
