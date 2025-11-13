/**
 * Calculate relative luminance of a color using WCAG formula
 * @param hex - Hex color string (e.g., '#ffffff' or '#ffffffff')
 * @returns luminance value between 0 (black) and 1 (white)
 */
function getRelativeLuminance(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values (ignore alpha if present)
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Get appropriate text color (white or black) based on background color
 * Uses WCAG contrast guidelines for optimal readability
 * @param backgroundColor - Hex color string (e.g., '#ffffff' or '#ffffffff')
 * @returns '#ffffff' for dark backgrounds, '#000000' for light backgrounds
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);
  
  // Use white text for dark backgrounds (luminance < 0.5)
  // Use black text for light backgrounds (luminance >= 0.5)
  return luminance < 0.5 ? '#ffffff' : '#000000';
}
