import crypto from "crypto";

/**
 * Generate a secure random token for invitations
 * @returns A URL-safe base64 token
 */
export function generateInvitationToken(): string {
  // Generate 32 random bytes and encode as URL-safe base64
  return crypto
    .randomBytes(32)
    .toString("base64url")
    .replace(/[+/=]/g, ""); // Remove any remaining special chars
}

/**
 * Calculate expiration date for invitation (7 days from now)
 * @returns Date object 7 days in the future
 */
export function getInvitationExpiration(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  return expirationDate;
}

/**
 * Check if invitation has expired
 * @param expiresAt - Expiration date
 * @returns true if expired, false otherwise
 */
export function isInvitationExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Format invitation expiration for display
 * @param expiresAt - Expiration date
 * @returns Formatted string like "Expires in 5 days"
 */
export function formatInvitationExpiration(expiresAt: Date): string {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Expired";
  } else if (diffDays === 0) {
    return "Expires today";
  } else if (diffDays === 1) {
    return "Expires in 1 day";
  } else {
    return `Expires in ${diffDays} days`;
  }
}
