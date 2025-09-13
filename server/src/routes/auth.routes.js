// routes/auth.routes.js
import { Router } from 'express';
import { registerAdmin, login, logout, me } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/admin/register', registerAdmin);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateJWT, me);

export default router;
