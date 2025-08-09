import { cac } from 'cac';
import * as commands from './commands/index.js';

const cli = cac('testious');

cli
  .command('init', 'Create new test ')
  .option('--no-install', 'Do not automatically install packages using npm')
  .action((options) => commands.init(options));

cli
  .command('typecheck', 'Run TypeScript type checking (tsc --noEmit)')
  .action(() => commands.typecheck());

cli
  .command('gen <type> <name>', 'Generate test file')
  .action((itemType, name) => commands.gen(itemType, name));

cli
  .command('run', 'Run test ')
  .option('--bundle', 'Bundles test file with Webpack')
  .option('--browser', 'Run test in browser with testious-browser-runner')
  .action((options) => commands.run(options));

cli.parse();

if (!cli.matchedCommand) {
  cli.outputHelp();
}
