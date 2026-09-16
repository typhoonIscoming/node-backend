const http = require('http');
const app = require('./app'); // 引入 Express 应用
const connectDB = require('./config/db');

const config = require('./config');
connectDB();
const startServer = async () => {
	try {
		const server = http.createServer(app);
		console.log('Starting server...', config.port);
		server.listen(config.port, () => {
			console.log(`Server is running on port： ${config.port}`);
		});

		// 优雅关闭服务器
		const gracefulShutdown = () => {
			console.log('Received shutdown signal, shutting down gracefully...');
			server.close(() => {
				console.log('Closed out remaining connections.');
				process.exit(0);
			});

			// 如果在 10 秒内没有关闭服务器，则强制退出
			setTimeout(() => {
				console.error('Could not close connections in time, forcefully shutting down');
				process.exit(1);
			}, 5000);
		};

		process.on('SIGTERM', gracefulShutdown);
		process.on('SIGINT', gracefulShutdown);
	} catch (error) {
		console.error('Error starting server:', error);
		process.exit(1);
	}
};

startServer();
