'use client';

/**
 * Skip Navigation Component
 * WCAG 2.4.1 - Bypass Blocks
 * Allows keyboard users to skip repetitive navigation
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#8dbf65] focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#8dbf65]"
    >
      Skip to main content
    </a>
  );
}
