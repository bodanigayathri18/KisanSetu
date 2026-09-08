import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authMiddleware } from './server/middleware/auth';
import authRoutes from './server/routes/authRoutes';
import masterRoutes from './server/routes/masterRoutes';
import farmerRoutes from './server/routes/farmerRoutes';
import officialRoutes from './server/routes/officialRoutes';
import buyerRoutes from './server/routes/buyerRoutes';
import commonRoutes from './server/routes/commonRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global auth parser middleware
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'KisanConnect Unified Procurement Ecosystem API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/master', masterRoutes);
  app.use('/api/farmer', farmerRoutes);
  app.use('/api/official', officialRoutes);
  app.use('/api/buyer', buyerRoutes);
  app.use('/api', commonRoutes);

  // API 404 handler (prevents falling through to Vite HTML for unmatched /api routes)
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.url}`,
    });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error occurred',
    });
  });

  // Vite middleware in development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KisanConnect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
