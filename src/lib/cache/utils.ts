export function joinKey(key: string | string[], separator: string): string {
  return Array.isArray(key) ? key.map(encodeURIComponent).join(separator) : key;
}