// server.js
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

// --- CORS CONFIGURATION ---
// To allow multiple origins, provide them as an array of strings.
const corsOptions = {
  origin: 'https://adminpnp.fineflux.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // PATCH is included
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- MIDDLEWARE SETUP ---
app.set('trust proxy', isProd ? 1 : 0);
app.disable('x-powered-by');
app.use(helmet());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Use the CORS middleware with the updated options
app.use(cors(corsOptions));

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) =>
  res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

// API routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// --- SERVER START ---
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
