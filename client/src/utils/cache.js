/**
 * Simple in-memory cache for API requests
 * Reduces unnecessary API calls and improves performance
 */

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const cacheManager = {
  /**
   * Get cached data if valid
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/not found
   */
  get(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.duration) {
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} duration - Cache duration in ms (default 5min)
   */
  set(key, data, duration = CACHE_DURATION) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  },

  /**
   * Invalidate specific cache key
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    cache.delete(key);
  },

  /**
   * Invalidate all cache keys matching pattern
   * @param {string|RegExp} pattern - Pattern to match keys
   */
  invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern) 
      : pattern;
      
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  },

  /**
   * Clear entire cache
   */
  clear() {
    cache.clear();
  },

  /**
   * Get cache size
   */
  size() {
    return cache.size;
  }
};

/**
 * Wrapper function for cached API calls
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function to fetch data
 * @param {number} duration - Cache duration in ms
 * @returns {Promise<any>} Cached or fresh data
 */
export async function cachedFetch(key, fetcher, duration = CACHE_DURATION) {
  const cached = cacheManager.get(key);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const data = await fetcher();
    // Only cache successful responses (not errors or null/undefined)
    if (data !== null && data !== undefined) {
      cacheManager.set(key, data, duration);
    }
    return data;
  } catch (error) {
    // Don't cache errors - let them propagate
    throw error;
  }
}

export default cacheManager;
