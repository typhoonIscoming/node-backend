const apiResponse = require('../utils/response');

// 处理未定义的路由
const notFoundHandler = (req, res, next) => {
	console.log('not found', req.originalUrl);
	const error = new Error('Not Found, ${req.originalUrl}');
	error.status = 404;
	next(error);
};

// 全局错误处理
const errorHandler = (err, req, res, next) => {
	console.error(err.stack);
	const statusCode = err.status || 500;
	const message = err.message || 'Internal Server Error';

	// 开发环境返回错误详情信息
	const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : {};

	res.json(statusCode).json(apiResponse.error(message, errorDetails, statusCode));
};

module.exports = {
	notFoundHandler,
	errorHandler,
};
