export type RunnerConfig = 'node' | 'browser';

export interface Config {
  runners: RunnerConfig[];
  entry: {
    [runner in RunnerConfig]: string;
  };
  server: {
    port: number;
  };
}
