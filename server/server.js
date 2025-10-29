import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './src/config/db.js';
import routes from './src/routes/index.js';
import { notFound, errorHandler } from './src/middleware/error.js';
import { configureCloudinary } from './src/config/cloudinary.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: ['https://pnpartstudio.com', 'https://admin.pnpartstudio.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.set('trust proxy', isProd ? 1 : 0);
app.disable('x-powered-by');
app.use(helmet());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/health', (req, res) => res.status(200).json({
  ok: true,
  env: process.env.NODE_ENV,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    configureCloudinary();
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed', err);
    process.exit(1);
  }
}
start();
