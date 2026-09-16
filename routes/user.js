const express = require('express');
const { getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', verifyToken, getProfile); // 受保护接口，必须携带合法 token 才能访问

module.exports = router;
