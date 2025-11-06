import { Router } from 'express';
import {
  createRecoveryReport,
  getRecoveryReports,
  getRecoveryReportById,
  updateRecoveryReport
} from '../controllers/recoveryController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All authenticated users can view recovery reports
router.get('/', authenticate, getRecoveryReports);
router.get('/:id', authenticate, getRecoveryReportById);

// Reporters can create recovery reports (with photo uploads)
router.post('/', authenticate, authorize('reporter', 'admin'), upload.array('photos', 5), createRecoveryReport);

// Reporters and admins can update reports
router.put('/:id', authenticate, authorize('reporter', 'admin'), updateRecoveryReport);

export default router;
