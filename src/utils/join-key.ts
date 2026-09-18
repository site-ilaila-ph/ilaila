export type KeyOrMultipleKeys = string | string[];

export function joinKey(key: KeyOrMultipleKeys, separator: string): string {
  return Array.isArray(key) ? key.map(encodeURIComponent).join(separator) : key;
}
