import { InMemoryCache, getCache, connectCache, disconnectCache } from '../../src/utils/cache';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger');

describe('In-memory cache utilities', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache(1); // 1 second TTL for testing
    jest.clearAllMocks();
  });

  describe('InMemoryCache', () => {
    it('should store and retrieve values', () => {
      const key = 'test-key';
      const value = { test: 'data' };

      cache.set(key, value);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should expire values after TTL', async () => {
      const key = 'test-key';
      const value = { test: 'data' };

      cache.set(key, value, 0.1); // 100ms TTL
      
      // Should exist immediately
      let result = cache.get(key);
      expect(result).toEqual(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired now
      result = cache.get(key);
      expect(result).toBeNull();
    });

    it('should delete values', () => {
      const key = 'test-key';
      const value = { test: 'data' };

      cache.set(key, value);
      const deleted = cache.del(key);
      
      expect(deleted).toBe(1);
      
      const result = cache.get(key);
      expect(result).toBeNull();
    });

    it('should return 0 when deleting non-existent key', () => {
      const deleted = cache.del('non-existent-key');
      expect(deleted).toBe(0);
    });

    it('should flush all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.flushAll();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('getCache', () => {
    it('should return cache instance', () => {
      // Initialize cache first
      connectCache();
      
      const cacheInstance = getCache();
      expect(cacheInstance).toBeDefined();
      expect(typeof cacheInstance.get).toBe('function');
      expect(typeof cacheInstance.set).toBe('function');
      expect(typeof cacheInstance.del).toBe('function');
    });
  });

  describe('connectCache', () => {
    it('should initialize cache successfully', () => {
      connectCache();
      
      const cacheInstance = getCache();
      expect(cacheInstance).toBeDefined();
      expect(typeof cacheInstance.get).toBe('function');
    });
  });

  describe('disconnectCache', () => {
    it('should clear cache successfully', () => {
      // Initialize cache first
      connectCache();
      const cache = getCache();
      
      // Add some data to cache
      cache.set('test-key', 'test-value');
      
      disconnectCache();
      
      // Cache should still exist but data should be cleared
      const cacheAfter = getCache();
      expect(cacheAfter).toBeDefined();
    });
  });
});
