import express from 'express';
import * as AuthController from '../controllers/authController';
import { approveSeller } from '../controllers/approveSeller';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/pending-sellers', authenticateJWT, authorizeRole('useradmin'), AuthController.getPendingSellers);
router.post('/seller-approval/:id', authenticateJWT, authorizeRole('useradmin'), approveSeller);

export default router;