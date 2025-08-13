export function dedent(str: string): string {
  const lines = str.split('\n');
  const indentLengths = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = Math.min(...indentLengths);

  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trim();
}
