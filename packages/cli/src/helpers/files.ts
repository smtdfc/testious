import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function renderTemplateToFile(
  templatePath: string,
  data: Record<string, any>,
  outputPath: string,
) {
  const template = readFileSync(templatePath, 'utf8');
  const content = renderTemplate(template, data);
  const dir = dirname(outputPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(outputPath, content, 'utf8');
}

export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return data[key] != null ? String(data[key]) : '';
  });
}

export function writeFile(content: string, filePath: string) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

export function ensureRollupConfig(dir: string) {
  const configPath = join(dir, 'testious.rollup.config.js');
  if (!existsSync(configPath)) {
    writeFile(
      readFileSync(
        join(__dirname, '../data/rollup/testious.rollup.config.js'),
        'utf8',
      ),
      configPath,
    );
  }
}
