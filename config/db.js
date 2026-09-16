//  const mysql = require('mysql2/promise');
//  const pool = mysql.createPool({
//      host: 'localhost',
//      user: 'root',//数据库用户名
//      database: 'demo',//数据库
//      password: '123456',//数据库密码
//      waitForConnections: true,//是否允许排队等待
//      connectionLimit: 10,//最大连接数
//      dateStrings: true //时间转字符串（转化格式）
//  });
// module.exports = pool;

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
	//   host: process.env.DB_HOST,
	//   user: process.env.DB_USER,
	//   password: process.env.DB_PASSWORD,
	//   database: process.env.DB_NAME,
	//   waitForConnections: true,
	//   connectionLimit: 10,
	host: 'localhost',
	user: 'root', //数据库用户名
	database: 'swap', //数据库
	password: 'rootroot', //数据库密码
	waitForConnections: true, //是否允许排队等待
	connectionLimit: 10, //最大连接数
	dateStrings: true, //时间转字符串（转化格式）
	queueLimit: 0,
	port: 3306,
});

const connectDB = () => {
	pool.getConnection((err, connection) => {
		if (err) {
			console.error('数据库连接失败:', err);
		} else {
			console.log('数据库连接成功');
			connection.release();
		}
	});
};

module.exports = connectDB;
module.exports.pool = pool;

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();

// function connectDB() {
//   mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//     .then(() => console.log('MongoDB 连接成功'))
//     .catch((err) => {
//       console.error('MongoDB 连接失败:', err.message);
//       process.exit(1);
//     });
// }

// module.exports = connectDB;
