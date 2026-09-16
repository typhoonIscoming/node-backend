// JWT 校验中间件
const jwt = require('jsonwebtoken');
const { isTokenCached } = require('../config/redis');

async function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization']; // 读取请求头中的 Authorization
	const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null; // 提取 Bearer token

	if (!token) {
		// 若没有 token，直接拒绝访问
		return res.status(401).json({ message: '未提供 token' });
	}

	try {
		const isValidCache = await isTokenCached(token); // 检查 token 是否还在 Redis 中
		if (!isValidCache) {
			return res.status(403).json({ message: 'token 已失效或未登录' });
		}

		const user = jwt.verify(token, process.env.JWT_SECRET || 'default_secret'); // 校验 token 签名和有效期
		req.user = user; // 把解析出的用户信息挂载到 req 上
		next(); // 继续走下一个中间件或控制器
	} catch (error) {
		console.error('JWT verification failed:', error.message);
		return res.status(403).json({ message: 'token 无效或已过期' });
	}
}

module.exports = { verifyToken }; // 导出中间件，供路由使用
