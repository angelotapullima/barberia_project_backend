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
import draftSaleRoutes from './routes/draftSale.routes'; // New import for draft sale routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route to confirm server is running
app.get('/', (req, res) => {
  res.send('Barbería API is running!');
});

// Initialize database and then set up routes
setupDatabase()
  .then(() => {
    console.log('Database initialized.');
    app.use('/api/barbers', barberRoutes);
    app.use('/api/stations', stationRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/sales', saleRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/reservations', reservationRoutes); // Use reservation routes
    app.use('/api/auth', authRoutes); // Use auth routes
    app.use('/api/settings', settingRoutes); // Use settings routes
    app.use('/api/draft-sales', draftSaleRoutes); // New: Use draft sale routes
  })
  .catch((err: any) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

export default app;
