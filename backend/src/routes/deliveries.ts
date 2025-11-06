import { Router } from 'express';
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  cancelDelivery
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All authenticated users can view deliveries
router.get('/', authenticate, getDeliveries);
router.get('/:id', authenticate, getDeliveryById);

// Drivers can accept deliveries
router.post('/', authenticate, authorize('driver'), createDelivery);

// Drivers can update delivery status (with photo upload for pickup/delivery confirmation)
router.put('/:id/status', authenticate, authorize('driver', 'admin'), upload.single('photo'), updateDeliveryStatus);

// Drivers can cancel deliveries
router.post('/:id/cancel', authenticate, authorize('driver', 'admin'), cancelDelivery);

export default router;
