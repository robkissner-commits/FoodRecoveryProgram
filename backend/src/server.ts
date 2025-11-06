import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import recoveryRoutes from './routes/recoveries';
import deliveryRoutes from './routes/deliveries';
import partnerRoutes from './routes/partners';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Recovery Platform API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/recoveries', recoveryRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        Campus Food Recovery Platform - Backend API        ║
║                                                            ║
║  Server running on: http://localhost:${PORT}                 ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                            ║
║  API Documentation:                                        ║
║  - Health check: GET /health                               ║
║  - Authentication: /api/auth/*                             ║
║  - Events: /api/events/*                                   ║
║  - Recoveries: /api/recoveries/*                           ║
║  - Deliveries: /api/deliveries/*                           ║
║  - Partners: /api/partners/*                               ║
║  - Notifications: /api/notifications/*                     ║
║  - Dashboard: /api/dashboard/*                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
