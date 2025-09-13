// server.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { connectDB } from './src/config/db.js';
import { corsAllWithCreds } from './src/config/cors.js';
import routes from './src/routes/index.js';
import { notFound, errorHandler } from './src/middleware/error.js';
import { configureCloudinary } from './src/config/cloudinary.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4000;

// Ensure correct client IP/proto when behind reverse proxies (e.g., Nginx)
app.set('trust proxy', isProd ? 1 : 0);
app.disable('x-powered-by');

// Security + logging
app.use(helmet());                 // sets sensible security headers
app.use(morgan(isProd ? 'combined' : 'dev'));

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS with credentials, reflecting Origin (avoids using cors package)
app.use(corsAllWithCreds);

// Basic API rate limiting (exclude OPTIONS if desired to avoid counting preflights)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,     // send RFC RateLimit headers
  legacyHeaders: false,      // disable X-RateLimit-* legacy headers
  // skip: (req) => req.method === 'OPTIONS', // uncomment to ignore preflight
});
app.use('/api', apiLimiter);

// Health
app.get('/health', (req, res) =>
  res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

// API
app.use('/api', routes);

// 404 + error
app.use(notFound);
app.use(errorHandler);

// Start
async function start() {
  try {
    configureCloudinary(); // optional
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed', err);
    process.exit(1);
  }
}
start();
