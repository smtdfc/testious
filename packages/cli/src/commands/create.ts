import { InitCommandOption } from '../types/index.js';
import {
  Logger,
  readConfig,
  renderTemplateToFile,
  __dirname,
} from '../helpers/index.js';
import path, { resolve } from 'path';

const cwd = process.cwd();

export async function create(objectType: string, objectName: string) {
  const logger = new Logger('Testious CLI');

  logger.info('Reading configuration ...');
  const config = await readConfig(cwd);

  switch (objectType) {
    case 'file':
      logger.info('Creating test file ...');
      const filePath = resolve(path.join(cwd, objectName + '.test.js'));

      await renderTemplateToFile(
        path.join(__dirname, '../data/file/index.test.tmpl'),
        {},
        filePath,
      );

      logger.success('Test file created successfully. ');
      break;

    default:
      logger.error(`Unknown object type: ${objectType} !`);
  }
}
