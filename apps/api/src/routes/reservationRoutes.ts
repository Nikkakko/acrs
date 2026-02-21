import { Router } from 'express';
import {
  createReservation,
  deleteReservation,
  listReservations,
  updateReservation
} from '../controllers/reservationController.js';

export const reservationRoutes = Router();

reservationRoutes.get('/reservations', listReservations);
reservationRoutes.post('/reservations', createReservation);
reservationRoutes.put('/reservations/:id', updateReservation);
reservationRoutes.delete('/reservations/:id', deleteReservation);
