/**
 * Workflow Engine API
 * 
 * Main entry point for the workflow engine backend.
 * Sets up Express server with middleware and routes.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import workflowRoutes from '@/routes/workflows';
import triggerRoutes from '@/routes/trigger';
import { errorHandler } from '@/middleware/errorHandler';
import { morganStream } from '@/utils/logger';
import { logger } from '@/utils/logger';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server / postman

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Logging middleware
app.use(morgan('combined', { stream: morganStream }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/workflows', workflowRoutes);

// Trigger routes (webhook endpoints)
app.use('/t', triggerRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    code: 'NOT_FOUND',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info({
    message: 'Workflow Engine API started',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
});

export default app;
