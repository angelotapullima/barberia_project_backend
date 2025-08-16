import express from 'express';
import cors from 'cors';
import setupDatabase from './database';
import barberRoutes from './routes/barber.routes';
import stationRoutes from './routes/station.routes';
import serviceRoutes from './routes/service.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';
import reservationRoutes from './routes/reservation.routes'; // Import reservation routes
import authRoutes from './routes/auth.routes';
import settingRoutes from './routes/setting.routes';

import productRoutes from './routes/product.routes'; // Import product routes
import dashboardRoutes from './routes/dashboard.routes'; // Import dashboard routes
import posRoutes from './routes/pos.routes'; // Import POS routes
import inventoryRoutes from './routes/inventory.routes'; // Import inventory routes
import barberCommissionsRoutes from './routes/barberCommissions.routes'; // Import barber commissions routes
import paymentRoutes from './routes/payment.routes';
import swaggerUi from 'swagger-ui-express'; // Import swagger-ui-express
import swaggerSpec from './swagger'; // Import your swaggerSpec

const app = express();

// Middleware
// CORS configuration

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route to confirm server is running
app.get('/', (req, res) => {
  res.send('Barbería API is running!');
});

// Initialize database and then set up routes
const pool = setupDatabase();
pool.connect()
  .then(client => {
    console.log('Database connected.');
    client.release();
    app.use('/api/barbers', barberRoutes);
    app.use('/api/stations', stationRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/reservations', reservationRoutes); // Use reservation routes
    app.use('/api/auth', authRoutes); // Use auth routes
    app.use('/api/settings', settingRoutes); // Use settings routes
    app.use('/api/products', productRoutes); // Use product routes
    app.use('/api/dashboard', dashboardRoutes); // Use dashboard routes
    app.use('/api/pos', posRoutes); // Use POS routes
    app.use('/api/inventory', inventoryRoutes); // Use inventory routes
    app.use('/api/barber-commissions', barberCommissionsRoutes); // Use barber commissions routes
    app.use('/api/payments', paymentRoutes);
    
  })
  .catch((err: any) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

export default app;
