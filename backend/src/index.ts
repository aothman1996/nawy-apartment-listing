import dotenv from 'dotenv';

// Load environment variables FIRST (before any other imports that might use them)
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import apartmentRoutes from './routes/apartmentRoutes';
import { connectDatabase } from './utils/database';
import { connectCache } from './utils/cache';
import { httpLogger, logger } from './utils/logger';
import { validateEnv } from './utils/validateEnv';

// Validate environment variables with defaults
const env = validateEnv();

const app = express();
const PORT = env.PORT;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// HTTP request logging with Pino
app.use(httpLogger);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nawy Apartment API',
      version: '1.0.0',
      description: 'A comprehensive API for apartment listing and management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Development server (v1)',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV
  });
});

// API routes (v1)
logger.info('Loading apartment routes');
app.use('/api/v1/apartments', apartmentRoutes);
logger.info('Apartment routes loaded successfully');

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and cache connections
const startServer = async () => {
  try {
    await connectDatabase();
    await connectCache();
    
    app.listen(PORT, () => {
      logger.info({
        port: PORT,
        environment: env.NODE_ENV,
        apiDocs: `http://localhost:${PORT}/api-docs`,
        healthCheck: `http://localhost:${PORT}/health`,
        corsOrigins: env.CORS_ORIGIN,
        rateLimit: `${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 1000}s`
      }, 'Server started successfully');
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

