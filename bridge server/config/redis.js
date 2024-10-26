const Redis = require('ioredis');
require('dotenv').config();
const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
  })

  redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

// Handle Redis ready event
redisClient.on('ready', () => {
    console.log('Redis client connected and ready to use');
  });
  
  module.exports = redisClient;