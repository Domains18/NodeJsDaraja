import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

export interface CallbackMetadataItem {
    Name: string;
    Value: any;
}

@Injectable()
export class CallbackHandlerService {
    private readonly logger = new Logger(CallbackHandlerService.name);
    private readonly redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getOrThrow();
    }

    /**
     * Extracts metadata from callback array into key-value object
     * @param items - Array of callback metadata items
     * @returns Object with key-value pairs
     */
    extractMetadata(items: CallbackMetadataItem[]): Record<string, any> {
        return items.reduce((acc, item) => ({ ...acc, [item.Name]: item.Value }), {});
    }

    /**
     * Caches transaction data with TTL
     * @param key - Cache key (usually ConversationID or CheckoutRequestID)
     * @param data - Transaction data to cache
     * @param ttl - Time to live in seconds (default: 1 hour)
     */
    async cacheTransaction(key: string, data: any, ttl: number = 3600): Promise<void> {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(data));
            this.logger.debug(`Transaction cached: ${key}`);
        } catch (error) {
            this.logger.error(`Cache error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieves cached transaction
     * @param key - Cache key
     * @returns Parsed transaction data or null if not found
     */
    async getCachedTransaction<T>(key: string): Promise<T | null> {
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            this.logger.error(`Cache retrieval error: ${error.message}`);
            return null;
        }
    }

    /**
     * Deletes cached transaction
     * @param key - Cache key
     */
    async deleteCachedTransaction(key: string): Promise<void> {
        try {
            await this.redis.del(key);
            this.logger.debug(`Transaction cache deleted: ${key}`);
        } catch (error) {
            this.logger.error(`Cache deletion error: ${error.message}`);
        }
    }
}
