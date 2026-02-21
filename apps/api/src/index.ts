import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { reservationRoutes } from './routes/reservationRoutes.js';
import { serviceRoutes } from './routes/serviceRoutes.js';
import { staffRoutes } from './routes/staffRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(staffRoutes);
app.use(serviceRoutes);
app.use(reservationRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API running at http://localhost:${config.port}`);
});
