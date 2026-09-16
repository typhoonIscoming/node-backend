exports.getProfile = (req, res) => {
	const user = req.user || {}; // 从验证通过的 token 中读取用户信息
	const userName = user.name || user.username || req.query.username || 'unknown'; // 优先使用 token 里的用户名

	res.json({
		message: '获取用户信息成功',
		user: {
			name: userName,
			age: user.age || null,
		},
	});
};
