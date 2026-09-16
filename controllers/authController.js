const bcrypt = require('bcryptjs'); // 引入 bcrypt，用于密码加密和校验
const jwt = require('jsonwebtoken'); // 引入 jwt，用于生成和验证 token
const { pool } = require('../config/db'); // 引入数据库连接池，用于执行 SQL
const { cacheToken } = require('../config/redis'); // 引入 Redis 缓存，用于保存有效 token

const findUserByName = (name) => {
	// 定义按用户名查询用户的通用方法
	return new Promise((resolve, reject) => {
		// 返回 Promise，便于 async/await 调用
		pool.query('SELECT * FROM `user` WHERE name = ? LIMIT 1', [name], (err, results) => {
			// 执行 SQL：查询指定用户名是否存在
			if (err) return reject(err); // 如果数据库查询失败，抛出错误
			resolve(results[0] || null); // 返回第一条查询结果，若无结果则返回 null
		});
	});
};

const getRequestBody = (req) => {
	// 兼容 JSON 和查询参数两种传参方式，保证接口更稳定
	return req.query && Object.keys(req.query).length ? req.query : req.body;
};

exports.register = async (req, res) => {
	// 导出注册接口，接收请求对象和响应对象
	const payload = getRequestBody(req); // 获取请求参数，优先取 body
	const { username, age, password } = payload; // 解构用户名、年龄和密码
	console.log('Register request:', payload); // 打印请求参数，方便调试
	if (!username || !age || !password) {
		// 校验必填参数是否完整
		return res.status(400).json({ message: '用户名、年龄和密码必填' }); // 如果缺少参数，返回 400 错误
	}

	try {
		// 进入 try 块，处理异步数据库操作
		const existingUser = await findUserByName(username); // 查询数据库里是否已有同名用户
		if (existingUser) {
			// 如果存在同名用户
			return res.status(409).json({ message: '用户名已存在' }); // 返回冲突状态码 409
		}

		const hashedPassword = await bcrypt.hash(password, 10); // 对密码进行 bcrypt 加密，盐轮数为 10
		const result = await new Promise((resolve, reject) => {
			// 封装 SQL 插入操作为 Promise
			pool.query(
				// 执行插入语句
				'INSERT INTO `user` (name, age, password) VALUES (?, ?, ?)', // SQL：向 user 表插入用户名、年龄和加密密码
				[username, Number(age), hashedPassword], // 参数绑定，避免 SQL 注入
				(err, insertResult) => {
					// 回调函数接收错误和插入结果
					if (err) return reject(err); // 如果插入失败，拒绝 Promise
					resolve(insertResult); // 插入成功时返回结果对象
				}
			);
		});

		return res.status(201).json({
			// 返回注册成功响应，状态码 201
			message: '注册成功', // 成功消息
			userId: result.insertId, // 新插入数据的主键 ID
			name: username, // 用户名
			age, // 年龄
		});
	} catch (error) {
		// 捕获前面 try 中的所有异常
		console.error('register error:', error); // 打印错误日志
		return res.status(500).json({ message: '注册失败', error: error.message }); // 返回 500 错误响应
	}
};

exports.login = async (req, res) => {
	// 导出登录接口
	const payload = getRequestBody(req); // 获取请求参数，兼容 body 和 query
	const { username, password } = payload; // 从参数对象中解构用户名和密码

	if (!username || !password) {
		// 校验用户名和密码是否为空
		return res.status(400).json({ message: '用户名和密码必填' }); // 缺参数返回 400
	}

	try {
		// 开始数据库和密码比对流程
		const user = await findUserByName(username); // 根据用户名查询用户
		if (!user) {
			// 如果用户不存在
			return res.status(401).json({ message: '用户名或密码错误' }); // 返回 401 未授权
		}

		const isMatch = await bcrypt.compare(password, user.password); // 比对提交密码和数据库中的哈希密码是否一致
		if (!isMatch) {
			// 如果密码不匹配
			return res.status(401).json({ message: '用户名或密码错误' }); // 返回 401 未授权
		}

		const token = jwt.sign(
			// 生成 JWT
			{ name: user.name, age: user.age }, // token 内部携带用户名和年龄信息
			process.env.JWT_SECRET || 'default_secret', // 使用环境变量中的密钥，未配置时提供默认值
			{
				expiresIn: '2h', // token 有效期为 2 小时
			}
		);

		await cacheToken(token, { name: user.name, age: user.age }, 7200); // 把 token 记录到 Redis，2 小时后自动过期

		return res.json({ message: '登录成功', token }); // 登录成功返回 token
	} catch (error) {
		// 捕获登录过程中的异常
		console.error('login error:', error); // 输出错误日志
		return res.status(500).json({ message: '登录失败', error: error.message }); // 返回 500 错误信息
	}
};
