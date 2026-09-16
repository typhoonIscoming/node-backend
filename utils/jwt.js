const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 生成 JWT Token
 * @param {Object} payload - 需要包含在 Token 中的数据
 * @returns {String} 生成的 JWT Token
 */
const generateToken = (payload) => {
	return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expire });
};

/**
 * 验证 JWT Token
 * @param {String} token - 需要验证的 JWT Token
 * @returns {Object|null} 验证成功返回解密后的数据，验证失败返回 null
 */
const verifyToken = (token) => {
	try {
		return jwt.verify(token, config.jwt.secret);
	} catch (error) {
		console.error('Token verification failed:', error);
		return null;
	}
};

module.exports = {
	generateToken,
	verifyToken,
};
