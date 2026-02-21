import { Router } from 'express';
import { createStaff, deleteStaff, listStaff, updateStaff } from '../controllers/staffController.js';

export const staffRoutes = Router();

staffRoutes.get('/staff', listStaff);
staffRoutes.post('/staff', createStaff);
staffRoutes.put('/staff/:id', updateStaff);
staffRoutes.delete('/staff/:id', deleteStaff);
