import { promises as fs } from 'fs';
import path from 'path';

export function renderTemplate(
  content: string,
  data: Record<string, string>,
): string {
  return content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    if (key in data) return data[key];
    return match;
  });
}

export async function renderTemplateFromFile(
  filePath: string,
  data: Record<string, string>,
): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  return renderTemplate(content, data);
}

export async function renderTemplateToFile(
  templatePath: string,
  data: Record<string, string>,
  outPath: string,
): Promise<void> {
  const rendered = await renderTemplateFromFile(templatePath, data);
  const dir = path.dirname(outPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(outPath, rendered, 'utf-8');
}
