const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { verifyToken } = require('./middlewares/authMiddleware');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
dotenv.config();
console.log('db', connectDB);
connectDB();
connectRedis();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', verifyToken, userRoutes);

app.get('/', (req, res) => {
	res.send('API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
