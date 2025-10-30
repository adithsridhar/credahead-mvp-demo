/**
 * App versioning system for cache busting
 * Uses build timestamp to automatically invalidate cache when app updates
 */

// Generate version based on build time - this will change on each deployment
const BUILD_TIME = Date.now();
const APP_VERSION = `v${BUILD_TIME}`;

export const getAppVersion = () => APP_VERSION;

/**
 * Add version query parameter to URLs for cache busting
 */
export const addVersionToUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_v=${APP_VERSION}`;
};

/**
 * Cache headers for different types of content
 */
export const getCacheHeaders = (type: 'static' | 'dynamic' | 'api' = 'dynamic') => {
  switch (type) {
    case 'static':
      // Static assets can be cached longer but with version checking
      return {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'ETag': APP_VERSION,
      };
    case 'api':
      // API responses should be fresh but can use short cache
      return {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'ETag': APP_VERSION,
      };
    case 'dynamic':
    default:
      // Dynamic pages should be fresh
      return {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'ETag': APP_VERSION,
      };
  }
};

/**
 * Check if client version matches current app version
 */
export const isVersionCurrent = (clientVersion?: string): boolean => {
  return clientVersion === APP_VERSION;
};

console.log(`📦 App version initialized: ${APP_VERSION}`);