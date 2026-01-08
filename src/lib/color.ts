export function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function getContrastColor(hex: string) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 180 ? '#000' : '#fff';
  } catch {
    return '#fff';
  }
}
