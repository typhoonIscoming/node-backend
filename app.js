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
// 根因已经确定了：helmet() 默认启用了 CSP，浏览器把外链脚本和内联脚本都拦住了。
// 我要把它放宽成允许 unpkg 资源和页面内联脚本，这样图表库能正常加载。
// 如果不启用下面的配置，在views/index.html中引用的外部脚本和内联脚本都会被浏览器拦截，导致图表无法正常加载。
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"], // 默认只允许从当前站点加载资源，避免外部恶意脚本或资源
				scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'], // 允许本域脚本、页面内联脚本，以及 lightweight-charts CDN 脚本
				styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'], // 允许本域样式、内联样式，以及 CDN 提供的样式资源
				imgSrc: ["'self'", 'data:', 'https:'], // 允许本域图片、base64 图片和 HTTPS 图片，避免图表或背景图被拦截
				connectSrc: ["'self'", 'https://unpkg.com'], // 允许本域 API 请求，以及轻量图表库可能发起的跨域请求
				fontSrc: ["'self'", 'data:'], // 允许本地字体与 data URI 字体，避免样式被字体加载拦住
				objectSrc: ["'none'"], // 禁止加载 object/embed/插件，减少 XSS 和插件注入风险
				baseUri: ["'self'"], // 限制 base 标签只能指向当前站点，避免 URL 劫持
				frameAncestors: ["'none'"], // 禁止页面被 iframe 嵌套，减少点击劫持风险
			},
		},
	})
); // 安全相关的 HTTP 头
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

// 设置静态目录，保证 /index.html、/script.js 等资源可直接访问
app.use(express.static(path.join(__dirname, 'views')));

// 1、设置视图引擎 EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2、设置路由
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// 主路由：返回 HTML 页面，浏览器才能加载页面中的 JS/CSS 资源
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/index.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
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
