/**
 * Normalize email for Supabase auth (trim + lowercase).
 * Use the same normalization on sign-up and sign-in so logins match stored users.
 */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}
