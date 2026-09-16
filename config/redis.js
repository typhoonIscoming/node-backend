const { createClient } = require('redis');

const redisClient = createClient({
	url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
	console.error('Redis Client Error:', err.message);
});

const connectRedis = async () => {
	try {
		await redisClient.connect();
		console.log('Redis 连接成功');
	} catch (error) {
		console.error('Redis 连接失败:', error.message);
	}
};

const getTokenKey = (token) => `auth:token:${token}`;

const cacheToken = async (token, payload, ttlSeconds = 7200) => {
	if (!token) return false;
	try {
		await redisClient.set(getTokenKey(token), JSON.stringify(payload), {
			EX: ttlSeconds,
		});
		return true;
	} catch (error) {
		console.error('Redis cache token failed:', error.message);
		return false;
	}
};

const isTokenCached = async (token) => {
	if (!token) return false;
	try {
		const exists = await redisClient.exists(getTokenKey(token));
		return exists === 1;
	} catch (error) {
		console.error('Redis validate token failed:', error.message);
		return false;
	}
};

const revokeToken = async (token) => {
	if (!token) return false;
	try {
		await redisClient.del(getTokenKey(token));
		return true;
	} catch (error) {
		console.error('Redis revoke token failed:', error.message);
		return false;
	}
};

module.exports = {
	redisClient,
	connectRedis,
	cacheToken,
	isTokenCached,
	revokeToken,
	getTokenKey,
};
