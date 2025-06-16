/**
 * Utility functions for visitor tracking and cookie management
 */

// Storage keys
export const STORAGE_KEYS = {
  VISITED: "santowrldwide_visited",
  COOKIE_CONSENT: "santowrldwide_cookie_consent",
  NEWSLETTER_DISMISSED: "santowrldwide_newsletter_dismissed",
  FIRST_VISIT_DATE: "santowrldwide_first_visit",
} as const;

// Cookie consent types
export type CookieConsentType = "all" | "technical" | null;

/**
 * Check if this is the user's first visit
 */
export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEYS.VISITED);
}

/**
 * Mark user as having visited the site
 */
export function markAsVisited(): void {
  if (typeof window === "undefined") return;

  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.VISITED, "true");

  // Store first visit date if not already stored
  if (!localStorage.getItem(STORAGE_KEYS.FIRST_VISIT_DATE)) {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT_DATE, now);
  }
}

/**
 * Get cookie consent status
 */
export function getCookieConsent(): CookieConsentType {
  if (typeof window === "undefined") return null;

  const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
  return consent as CookieConsentType;
}

/**
 * Set cookie consent status
 */
export function setCookieConsent(type: CookieConsentType): void {
  if (typeof window === "undefined") return;

  if (type) {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, type);
  } else {
    localStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT);
  }
}

/**
 * Check if newsletter has been dismissed
 */
export function isNewsletterDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(STORAGE_KEYS.NEWSLETTER_DISMISSED));
}

/**
 * Mark newsletter as dismissed
 */
export function markNewsletterDismissed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.NEWSLETTER_DISMISSED, "true");
}

/**
 * Get visitor stats for analytics
 */
export function getVisitorStats() {
  if (typeof window === "undefined") return null;

  const visited = localStorage.getItem(STORAGE_KEYS.VISITED);
  const firstVisitDate = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT_DATE);
  const cookieConsent = getCookieConsent();
  const newsletterDismissed = isNewsletterDismissed();

  return {
    hasVisited: Boolean(visited),
    firstVisitDate,
    cookieConsent,
    newsletterDismissed,
    isReturningVisitor: Boolean(visited),
  };
}

/**
 * Clear all visitor data (for testing/development)
 */
export function clearVisitorData(): void {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
