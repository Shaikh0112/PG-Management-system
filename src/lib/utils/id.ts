export function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}${randomPart}`;
}
