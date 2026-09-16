require('dotenv').config();

module.exports = {
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',
	jwt: {
		secret: process.env.JWT_SECRET,
		expire: process.env.JWT_EXPIRE || '7d',
	},
	mongodb: {
		uri: process.env.MONGO_URI || 'mongodb://localhost:27017/xieyuexing',
	},
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE',
		headers: process.env.CORS_HEADERS || 'Content-Type,Authorization',
	},
};
