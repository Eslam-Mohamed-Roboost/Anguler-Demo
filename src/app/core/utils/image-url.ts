/**
 * Returns an image URL exactly as stored, without any domain the backend prepended.
 * e.g. `https://api-dev.lines-trips.com/https://pub-x.r2.dev/uploads/a.png` → `https://pub-x.r2.dev/uploads/a.png`
 */
export function cleanImageUrl(url: string | null | undefined): string {
  const value = url?.trim() ?? '';
  if (!value) return '';

  const lastAbsolute = Math.max(value.lastIndexOf('https://'), value.lastIndexOf('http://'));
  return lastAbsolute > 0 ? value.slice(lastAbsolute) : value;
}
