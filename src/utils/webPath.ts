export function HostConfig_webPath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `.${path}` : path;
}

export function HostConfig_baseUrl(fallback: string): string {
  const doc = (globalThis as { document?: { baseURI?: string } }).document;
  return doc?.baseURI ?? fallback;
}
