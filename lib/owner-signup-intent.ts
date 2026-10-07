// Remembers that a Google sign-up started on the owner registration page, so the account can be
// made an owner when Google sends the user back to /login. Stored in this browser only.

const KEY = 'nugget-owner-signup-intent';
const MAX_AGE_MS = 30 * 60 * 1000;

export function setOwnerSignupIntent() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage unavailable: the user can still be made an owner by signing up with email
  }
}

/** True if a recent owner sign-up started in this browser (doesn't clear it). */
export function hasOwnerSignupIntent(): boolean {
  try {
    const startedAt = Number(localStorage.getItem(KEY));
    return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MAX_AGE_MS;
  } catch {
    return false;
  }
}

/** Returns true (once) if a recent owner sign-up started in this browser, then forgets it. */
export function consumeOwnerSignupIntent(): boolean {
  try {
    const startedAt = Number(localStorage.getItem(KEY));
    localStorage.removeItem(KEY);
    return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MAX_AGE_MS;
  } catch {
    return false;
  }
}
