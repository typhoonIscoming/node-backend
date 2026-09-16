const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

const requirePost = (req, res) => {
	res.status(405).json({
		message: '该接口仅支持 POST 请求，请使用用户名和密码提交登录信息。',
	});
};

router.get('/register', register);

router.get('/login', login);

module.exports = router;
