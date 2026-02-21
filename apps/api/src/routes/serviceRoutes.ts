import { Router } from 'express';
import {
  createCustomField,
  createService,
  deleteService,
  getColumnOrder,
  listCustomFields,
  listServices,
  updateColumnOrder,
  updateService
} from '../controllers/serviceController.js';

export const serviceRoutes = Router();

serviceRoutes.get('/service-custom-fields', listCustomFields);
serviceRoutes.post('/service-custom-fields', createCustomField);

serviceRoutes.get('/services', listServices);
serviceRoutes.post('/services', createService);
serviceRoutes.put('/services/:id', updateService);
serviceRoutes.delete('/services/:id', deleteService);

serviceRoutes.get('/service-column-order', getColumnOrder);
serviceRoutes.put('/service-column-order', updateColumnOrder);
