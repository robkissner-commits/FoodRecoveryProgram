import { Router } from 'express';
import {
  getAdminDashboard,
  getReporterDashboard,
  getDriverDashboard,
  getPartnerDashboard
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.get('/reporter', authenticate, authorize('reporter'), getReporterDashboard);
router.get('/driver', authenticate, authorize('driver'), getDriverDashboard);
router.get('/partner', authenticate, authorize('partner'), getPartnerDashboard);

export default router;
