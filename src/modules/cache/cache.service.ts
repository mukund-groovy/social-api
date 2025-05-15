import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { getEnv } from '@utils/env.util';

@Injectable()
export class CacheService {
  private readonly defaultTTL = 86400; // Default TTL in seconds (24 hours)
  private redisAvailable = true;
  private readonly prefix: string; // Prefix for all cache keys

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    // Initialize the prefix based on the environment
    this.prefix = getEnv('REDIS_PREFIX', 'DEV');
    // Check if Redis is available on service initialization
    this.checkRedisAvailability();
  }

  // Prepend the prefix to a key
  private getPrefixedKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Check if Redis is available
  private async checkRedisAvailability() {
    try {
      await this.redis.ping(); // Try to ping Redis to check its availability
      this.redisAvailable = true;
    } catch (error) {
      this.redisAvailable = false;
      console.warn('Redis is not available. Caching is disabled.');
    }
  }

  // Get data from cache (only if Redis is available)
  async get<T>(key: string): Promise<T | null> {
    if (!this.redisAvailable) return null; // Skip if Redis is not available

    try {
      const value = await this.redis.get(this.getPrefixedKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error fetching from Redis:', error);
      return null;
    }
  }

  // Set data in cache (only if Redis is available)
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const stringValue = JSON.stringify(value);
    const ttlValue = ttl ?? this.defaultTTL;

    try {
      await this.redis.set(
        this.getPrefixedKey(key),
        stringValue,
        'EX',
        ttlValue,
      );
    } catch (error) {
      console.error('Error setting cache in Redis:', error);
    }
  }

  // Delete data from cache (only if Redis is available)
  async delete(key: string): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    try {
      await this.redis.del(this.getPrefixedKey(key));
    } catch (error) {
      console.error('Error deleting cache from Redis:', error);
    }
  }

  // Clear all data in the cache (only if Redis is available)
  async clear(): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    try {
      const keys = await this.redis.keys(this.getPrefixedKey('*')); // Get only keys with the application's prefix
      if (keys.length) {
        await this.redis.del(keys); // Delete only those keys
      }
    } catch (error) {
      console.error('Error clearing Redis cache:', error);
    }
  }

  // Get all keys in the cache (only if Redis is available)
  async getAllKeys(): Promise<string[]> {
    if (!this.redisAvailable) return []; // Skip if Redis is not available

    try {
      return await this.redis.keys(this.getPrefixedKey('*'));
    } catch (error) {
      console.error('Error fetching all keys from Redis:', error);
      return [];
    }
  }

  // Add data to a specific cache group (only if Redis is available)
  async addCacheToGroup(
    group: string,
    key: string,
    value: any,
    ttl?: number,
  ): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const fullKey = `${group}:${key}`;
    await this.set(fullKey, value, ttl);
  }

  // Get data from a specific cache group (only if Redis is available)
  async getCacheFromGroup<T>(group: string, key: string): Promise<T | null> {
    if (!this.redisAvailable) return null; // Skip if Redis is not available

    const fullKey = `${group}:${key}`;
    return await this.get(fullKey);
  }

  // Delete data from a specific cache group (only if Redis is available)
  async deleteCacheFromGroup(group: string, key: string): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const fullKey = `${group}:${key}`;
    await this.delete(fullKey);
  }

  // Get all keys from a specific cache group (only if Redis is available)
  async getCacheByGroup(group: string): Promise<string[]> {
    if (!this.redisAvailable) return []; // Skip if Redis is not available

    const pattern = this.getPrefixedKey(`${group}:*`);
    return await this.redis.keys(pattern);
  }

  // Clear cache from a specific cache group (only if Redis is available)
  async clearCacheByGroup(group: string): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const keys = await this.getCacheByGroup(group);
    if (keys.length) {
      await this.redis.del(keys);
    }
  }

  // Set up an index for a specific group in Redis (only if Redis is available)
  async setGroupIndex(
    group: string,
    id: string,
    fields: Record<string, string>,
    ttl?: number,
  ): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const indexKey = this.getPrefixedKey(`${group}:index:${id}`);
    try {
      // Set fields in the hash
      await this.redis.hset(indexKey, fields);

      // Set TTL for the entire hash (indexKey)
      await this.redis.expire(indexKey, ttl); // TTL is in seconds
    } catch (error) {
      console.error('Error setting group index in Redis:', error);
    }
  }

  // Remove all keys listed in the group index and delete the index itself
  async removeGroupIndex(group: string, user_id: string): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const indexKey = this.getPrefixedKey(`${group}:index:${user_id}`);
    try {
      const keys = await this.redis.hvals(indexKey); // Get all values (keys) from the hash
      if (keys.length > 0) {
        await this.redis.del(...keys); // Delete all keys listed in the index
      }
      await this.redis.del(indexKey); // Delete the index key itself
    } catch (error) {
      console.error('Error removing group index in Redis:', error);
    }
  }

  // Update a specific field in a group index for a user (only if Redis is available)
  async updateGroupIndexKey(
    group: string,
    user_id: string,
    field: string,
    newKey: string,
  ): Promise<void> {
    if (!this.redisAvailable) return; // Skip if Redis is not available

    const indexKey = this.getPrefixedKey(`${group}:index:${user_id}`);
    try {
      await this.redis.hset(indexKey, field, newKey);
    } catch (error) {
      console.error('Error updating key in group index in Redis:', error);
    }
  }
}
