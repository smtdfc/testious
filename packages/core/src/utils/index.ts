export function generateID(): string {
  return (Math.floor(Math.random() * 9999) * Date.now()).toString(32);
}
