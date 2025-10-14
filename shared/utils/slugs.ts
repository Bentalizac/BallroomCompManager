/**
 * Generate a URL-safe slug from a competition name and year.
 * Format: competition-name-YYYY with conflict resolution.
 */
export function generateCompetitionSlug(name: string, createdAt: Date | string): string {
  // Extract year from the date
  const year = createdAt instanceof Date 
    ? createdAt.getFullYear()
    : new Date(createdAt).getFullYear();
  
  // Create base slug: lowercase, replace spaces with hyphens, remove special chars
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Combine with year
  const slug = `${baseSlug}-${year}`;
  
  return slug;
}

/**
 * Generate a competition slug with conflict resolution suffix.
 * This version is for use when you need to check for uniqueness.
 * The actual uniqueness check should be handled by the database trigger.
 */
export function generateCompetitionSlugWithSuffix(
  name: string, 
  createdAt: Date | string, 
  suffix?: string
): string {
  const baseSlug = generateCompetitionSlug(name, createdAt);
  
  if (suffix) {
    return `${baseSlug}-${suffix}`;
  }
  
  return baseSlug;
}

/**
 * Validate that a slug follows the expected format
 */
export function isValidCompetitionSlug(slug: string): boolean {
  // Check for basic format: lowercase letters, numbers, hyphens, ending with 4-digit year
  const slugPattern = /^[a-z0-9-]+-\d{4}(-[a-z]{2})?$/;
  return slugPattern.test(slug);
}

/**
 * Extract the competition name from a slug
 */
export function extractNameFromSlug(slug: string): string {
  // Remove year and potential suffix
  const namePart = slug.replace(/-\d{4}(-[a-z]{2})?$/, '');
  // Convert back to readable format
  return namePart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract the year from a slug
 */
export function extractYearFromSlug(slug: string): number | null {
  const yearMatch = slug.match(/-(\d{4})(?:-[a-z]{2})?$/);
  return yearMatch ? parseInt(yearMatch[1], 10) : null;
}