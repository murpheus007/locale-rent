/**
 * LocaleRent Color System — Developer Reference
 * ==============================================
 *
 * All colors are defined as CSS custom properties in:
 *   src/app/globals.css  (Tailwind @theme tokens)
 *   src/shared/styles/tokens.css  (raw CSS variables + dark mode class)
 *
 * USAGE
 * -----
 * Tailwind classes (preferred):
 *   bg-primary text-primary-foreground hover:bg-primary-dark
 *   bg-secondary text-secondary-foreground
 *   bg-accent text-accent-foreground
 *   bg-success text-success-foreground
 *   bg-error text-error-foreground
 *   bg-warning text-warning-foreground
 *   bg-dark bg-light bg-white bg-muted
 *   text-dark text-mid
 *   border-primary border-secondary border-accent
 *   ring-primary  (form focus)
 *
 * CSS variables (inline styles, CSS modules):
 *   style={{ backgroundColor: 'var(--clr-primary)' }}
 *   color: var(--clr-dark)
 *
 * Dark mode:
 *   Automatic via @media (prefers-color-scheme: dark) in globals.css
 *   Toggle via <html class="dark"> using tokens.css variables
 *
 * PALETTE
 * -------
 * Primary   #0D7377  Deep Teal   — CTAs, links, active states, price text
 * Secondary #FF6B6B  Warm Coral  — Secondary CTAs, sale badges, error accents
 * Accent    #F4A261  Gold        — Star ratings, featured badges
 * Dark      #1A1A2E  Near Black  — Headings, body text
 * Mid       #6B7280  Gray        — Secondary text, placeholders
 * Light     #F8F9FA  Off-White   — Page backgrounds, card backgrounds
 * Success   #10B981  Green       — Confirmations, available indicators
 * Error     #EF4444  Red         — Validation errors, unavailable
 * Warning   #F59E0B  Amber       — Notices, expiring subscriptions
 *
 * BUTTON VARIANTS
 * ---------------
 * Primary:     bg-primary text-primary-foreground hover:bg-primary-dark
 * Secondary:   bg-secondary text-secondary-foreground hover:bg-secondary-dark
 * Accent:      bg-accent text-accent-foreground hover:bg-accent-dark
 * Outline:     border-2 border-primary text-primary hover:bg-primary-light
 * Ghost:       text-primary hover:bg-primary-light
 * Disabled:    bg-primary/50 cursor-not-allowed
 *
 * BADGE VARIANTS
 * --------------
 * Solid:       bg-{color} text-{color}-foreground
 * Light:       bg-{color}-light text-{color} (or text-{color}-dark for light backgrounds)
 *
 * ALERT VARIANTS
 * --------------
 * Structure:   bg-{semantic}-light border-l-4 border-{semantic} text-{semantic}
 * Success:     bg-success-light border-success text-success
 * Error:       bg-error-light border-error text-error
 * Warning:     bg-warning-light border-warning text-warning-foreground
 * Info:        bg-primary-light border-primary text-primary
 */
