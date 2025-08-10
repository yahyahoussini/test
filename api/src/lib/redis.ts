import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in the environment variables.');
}

// Create a new Redis client instance.
// It will automatically try to connect to the provided URL.
// `lazyConnect: true` prevents the client from connecting until a command is issued.
export const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 20,
    lazyConnect: true,
});

redis.on('error', (err) => {
    console.error('🔴 Redis Client Error', err);
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully.');
});
