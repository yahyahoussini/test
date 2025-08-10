import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// We only connect if not in a test environment to avoid issues with test runners
if (process.env.NODE_ENV !== 'test') {
    redisClient.connect().catch(console.error);
}

export default redisClient;
