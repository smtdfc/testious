import chalk from 'chalk';

const log = console.log;

export class Logger {
  constructor(public target: string) {}

  private getTime() {
    return chalk.gray(new Date().toISOString());
  }

  info(...messages: string[]) {
    log(
      chalk.black.bgWhite.bold(` ${this.target} `),
      chalk.blueBright.bgBlack.bold('INFO '),
      chalk.blue(messages.join(' ')),
    );
  }

  success(...messages: string[]) {
    log(
      chalk.black.bgWhite.bold(` ${this.target} `),
      chalk.greenBright.bgBlack.bold('SUCCESS '),
      chalk.green(messages.join(' ')),
    );
  }

  warn(...messages: string[]) {
    log(
      chalk.black.bgWhite.bold(` ${this.target} `),
      chalk.yellowBright.bgBlack.bold('WARN '),
      chalk.yellow(messages.join(' ')),
    );
  }

  error(...messages: string[]) {
    log(
      chalk.black.bgWhite.bold(` ${this.target} `),
      chalk.redBright.bgBlack.bold('ERROR '),
      chalk.red(messages.join(' ')),
    );
  }
}
