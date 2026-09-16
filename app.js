const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const config = require('./config');
const { connectRedis } = require('./config/redis');

const app = express();
connectRedis();

// 中间件配置
app.use(helmet()); // 安全相关的 HTTP 头
app.use(
	cors({
		origin: config.cors.origin,
		credentials: true,
		methods: config.cors.methods,
		allowedHeaders: config.cors.headers,
	})
); // 允许跨域请求
app.use(express.json({ limit: '10kb' })); // 解析 JSON 请求体
app.use(compression()); // 启用 gzip 压缩

// 解析URI编码请求体
app.use(express.urlencoded({ extended: true }));

// 设置静态目录
app.use(express.static(path.join(__dirname, 'views')));

// 1、设置视图引擎 EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2、设置路由
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// 主路由
app.get('/', (req, res) => {
	res.send('Home page');
});

// 404 错误处理
app.use((req, res, next) => {
	res.status(404).json({ message: 'Not Found' });
});

// 挂载api路由
// const routes = require('./routes');
// app.use('/api', routes);

// 全局错误处理
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
