import { Router } from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  updatePartnerNeedLevel,
  deletePartner,
  getPartnerDeliveries
} from '../controllers/partnerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All authenticated users can view partners
router.get('/', authenticate, getPartners);
router.get('/:id', authenticate, getPartnerById);
router.get('/:id/deliveries', authenticate, getPartnerDeliveries);

// Partners can update their own need level
router.patch('/:id/need-level', authenticate, authorize('partner', 'admin'), updatePartnerNeedLevel);

// Admin routes
router.post('/', authenticate, authorize('admin'), createPartner);
router.put('/:id', authenticate, authorize('admin'), updatePartner);
router.delete('/:id', authenticate, authorize('admin'), deletePartner);

export default router;
