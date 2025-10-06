type CacheItem = {
  value: any;
  expiresAt: number;
};

class InMemoryCache {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private defaultTtl: number;

  constructor(defaultTtl: number = 3600) {
    this.defaultTtl = defaultTtl;
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    const ttl = ttlSeconds || this.defaultTtl;
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  setEx(key: string, ttlSeconds: number, value: any): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  del(key: string): number {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    return existed ? 1 : 0;
  }

  flushAll(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

let cacheClient: InMemoryCache;

export const connectCache = (): void => {
  try {
    cacheClient = new InMemoryCache();
    if (!process.env.JEST_WORKER_ID) {
      import('./logger').then(({ logger }) => {
        logger.info('In-memory cache initialized successfully');
      });
    }
  } catch (error) {
    if (!process.env.JEST_WORKER_ID) {
      import('./logger').then(({ logger }) => {
        logger.error({ error }, 'Cache initialization failed');
      });
    }
    throw error;
  }
};

export const getCache = (): InMemoryCache => {
  if (!cacheClient) {
    throw new Error('Cache client not initialized');
  }
  return cacheClient;
};

export const disconnectCache = (): void => {
  try {
    if (cacheClient) {
      cacheClient.destroy();
      if (!process.env.JEST_WORKER_ID) {
        import('./logger').then(({ logger }) => {
          logger.info('Cache disconnected successfully');
        });
      }
    }
  } catch (error) {
    if (!process.env.JEST_WORKER_ID) {
      import('./logger').then(({ logger }) => {
        logger.error({ error }, 'Cache disconnection failed');
      });
    }
    throw error;
  }
};

export { InMemoryCache };