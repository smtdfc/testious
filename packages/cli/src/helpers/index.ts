import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

export function readJSON<T = any>(path: string): T {
  try {
    const fullPath = resolve(path);
    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    throw new Error(`Cannot read file ${path}: ${(err as Error).message}`);
  }
}

export function writeFileJSON<T = any>(path: string, data: T): void {
  try {
    const fullPath = resolve(path);
    const jsonContent = JSON.stringify(data, null, 2); // format đẹp
    writeFileSync(fullPath, jsonContent, 'utf-8');
  } catch (err) {
    throw new Error(`Cannot write file ${path}: ${(err as Error).message}`);
  }
}

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

export function renderTemplateFromFile(
  templatePath: string,
  data: Record<string, any>,
): string {
  const template = readFileSync(templatePath, 'utf8');
  const content = renderTemplate(template, data);
  return content;
}

export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return data[key] != null ? String(data[key]) : '';
  });
}

export function camelToPascal(str: string): string {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
}

export function readFile(path: string) {
  try {
    const data = readFileSync(path, 'utf-8');
    return data;
  } catch (err) {
    throw err;
  }
}
