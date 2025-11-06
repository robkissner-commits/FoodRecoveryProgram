import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  uploadEventsCSV,
  assignReporter,
  unassignReporter,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/csv/' });

// Public/authenticated routes
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEventById);

// Reporter routes
router.post('/:id/assign', authenticate, authorize('reporter'), assignReporter);
router.post('/:id/unassign', authenticate, unassignReporter);

// Admin routes
router.post('/', authenticate, authorize('admin'), createEvent);
router.post('/upload-csv', authenticate, authorize('admin'), upload.single('file'), uploadEventsCSV);
router.put('/:id', authenticate, authorize('admin'), updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

export default router;
