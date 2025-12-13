import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', imageRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Image Encryption API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
