import express from 'express';
import multer from 'multer';
import * as AuthController from '../controllers/authController';
import ordersRouter from './orders';
import adminRouter from './admin';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register/seller', upload.single('logo'), AuthController.registerSeller);
router.post('/register/customer', AuthController.registerCustomer);
router.post('/register/admin', AuthController.registerAdmin);
router.post('/login', AuthController.login);

router.use('/api/admin', adminRouter);
router.use('/api/orders', ordersRouter);

export default router;