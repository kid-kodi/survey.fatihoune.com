/**
 * Utility functions for generating URL-safe slugs
 */

/**
 * Generates a URL-safe slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 * @example
 * generateSlug("My Organization Name") // "my-organization-name"
 * generateSlug("Café & Restaurant") // "cafe-restaurant"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace accented characters with their base equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 * @example
 * makeSlugUnique("my-org", ["my-org", "my-org-1"]) // "my-org-2"
 */
export function makeSlugUnique(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validates if a slug meets requirements
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Must be 3-63 characters, lowercase alphanumeric and hyphens only
  // Cannot start or end with hyphen
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return slugRegex.test(slug);
}
