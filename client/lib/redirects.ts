/**
 * Redirect utility for handling post-authentication navigation
 * Based on where the user originated from
 */

export interface RedirectConfig {
  /** Default redirect path */
  default: string;
  /** Path patterns and their corresponding redirects */
  patterns: Array<{
    /** Regex pattern to match against the origin path */
    pattern: RegExp;
    /** Function to generate redirect path, receives match groups as parameter */
    redirect: (matches: RegExpMatchArray) => string;
  }>;
}

/**
 * Helper function to create nested resource patterns
 * @param basePath - Base path (e.g., 'comp', 'org')
 * @param resourcePath - Resource path (e.g., 'events', 'sessions')
 * @returns Pattern configuration for nested resources
 */
function createNestedResourcePattern(basePath: string, resourcePath: string) {
  return {
    pattern: new RegExp(`^\/${basePath}\/([^\/]+)\/${resourcePath}\/([^\/]+)`),
    redirect: (matches: RegExpMatchArray) => `/${basePath}/${matches[1]}/${resourcePath}/${matches[2]}`,
  };
}

/**
 * Helper function to create simple resource patterns
 * @param basePath - Base path (e.g., 'comp', 'org', 'event')
 * @returns Pattern configuration for simple resources
 */
function createSimpleResourcePattern(basePath: string) {
  return {
    pattern: new RegExp(`^\/${basePath}\/([^\/]+)`),
    redirect: (matches: RegExpMatchArray) => `/${basePath}/${matches[1]}`,
  };
}

/**
 * Configuration builder for easy pattern management
 */
export class RedirectConfigBuilder {
  private patterns: RedirectConfig['patterns'] = [];
  
  /**
   * Add a nested resource pattern (e.g., /comp/[id]/events/[eventId])
   */
  addNestedResource(basePath: string, resourcePath: string) {
    this.patterns.push(createNestedResourcePattern(basePath, resourcePath));
    return this;
  }
  
  /**
   * Add a simple resource pattern (e.g., /comp/[id])
   */
  addSimpleResource(basePath: string) {
    this.patterns.push(createSimpleResourcePattern(basePath));
    return this;
  }
  
  /**
   * Add a custom pattern
   */
  addCustomPattern(pattern: RegExp, redirectFn: (matches: RegExpMatchArray) => string) {
    this.patterns.push({ pattern, redirect: redirectFn });
    return this;
  }
  
  /**
   * Build the configuration
   */
  build(defaultPath: string = '/home'): RedirectConfig {
    return {
      default: defaultPath,
      patterns: [...this.patterns], // Create a copy
    };
  }
}

const REDIRECT_CONFIG: RedirectConfig = new RedirectConfigBuilder()
  // Nested resource patterns (most specific first)
  .addNestedResource('comp', 'events')     // /comp/[id]/events/[eventId]
  .addNestedResource('comp', 'sessions')   // /comp/[id]/sessions/[sessionId]
  .addNestedResource('comp', 'rounds')     // /comp/[id]/rounds/[roundId]
  .addNestedResource('org', 'events')      // /org/[id]/events/[eventId]
  .addNestedResource('org', 'members')     // /org/[id]/members/[memberId]
  .addNestedResource('studio', 'classes')  // /studio/[id]/classes/[classId]
  
  // Simple resource patterns (less specific)
  .addSimpleResource('comp')               // /comp/[id]
  .addSimpleResource('org')                // /org/[id]
  .addSimpleResource('event')              // /event/[id]
  .addSimpleResource('studio')             // /studio/[id]
  .addSimpleResource('venue')              // /venue/[id]
  
  // Custom patterns can be added easily:
  // .addCustomPattern(/^\/admin\/reports\/([^\/]+)/, (m) => `/admin/reports/${m[1]}`)
  
  .build('/home');

/**
 * Determines the appropriate redirect URL after successful authentication
 * @param originPath - The path the user came from (stored in sessionStorage/URL params)
 * @returns The path to redirect to
 */
export function getPostAuthRedirect(originPath?: string | null): string {
  if (!originPath) {
    return REDIRECT_CONFIG.default;
  }

  // Check each pattern for a match
  for (const { pattern, redirect } of REDIRECT_CONFIG.patterns) {
    const matches = originPath.match(pattern);
    if (matches) {
      return redirect(matches);
    }
  }

  // If no pattern matches, use the default
  return REDIRECT_CONFIG.default;
}

/**
 * Stores the current path for post-auth redirect
 * @param path - The current path to store
 */
export function storeRedirectPath(path: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth-redirect', path);
  }
}

/**
 * Retrieves and clears the stored redirect path
 * @returns The stored path or null if none exists
 */
export function getAndClearRedirectPath(): string | null {
  if (typeof window === 'undefined') return null;
  
  const path = sessionStorage.getItem('auth-redirect');
  if (path) {
    sessionStorage.removeItem('auth-redirect');
  }
  return path;
}

/**
 * Gets redirect path from URL search params or sessionStorage
 * @param searchParams - URL search parameters
 * @returns The redirect path or null
 */
export function getRedirectFromParams(searchParams?: URLSearchParams): string | null {
  // First check URL params (higher priority)
  const redirectParam = searchParams?.get('redirect');
  if (redirectParam) {
    return decodeURIComponent(redirectParam);
  }

  // Fall back to session storage
  return getAndClearRedirectPath();
}