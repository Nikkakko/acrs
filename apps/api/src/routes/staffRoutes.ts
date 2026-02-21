import { Router } from 'express';
import { createStaff, deleteStaff, listStaff, updateStaff, uploadStaffPhoto } from '../controllers/staffController.js';
import { uploadPhoto } from '../middleware/upload.js';

export const staffRoutes = Router();

staffRoutes.get('/staff', listStaff);
staffRoutes.post('/staff/upload', uploadPhoto, uploadStaffPhoto);
staffRoutes.post('/staff', createStaff);
staffRoutes.put('/staff/:id', updateStaff);
staffRoutes.delete('/staff/:id', deleteStaff);
