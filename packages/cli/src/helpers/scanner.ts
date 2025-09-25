import * as fs from 'fs';
import * as path from 'path';

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp('^' + escaped + '$');
}

export function findFiles(root: string, patterns: string[]): string[] {
  const regexes = patterns.map(globToRegex);
  const results: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.'))
          continue;
        walk(full);
      } else {
        if (regexes.some((re) => re.test(entry.name))) {
          results.push(full);
        }
      }
    }
  }

  walk(root);
  return results;
}
