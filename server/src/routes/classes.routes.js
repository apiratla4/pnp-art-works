// src/routes/classes.routes.js
import { Router } from 'express';
import {
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classes.controller.js'; // ✅ .js extension required

const router = Router();

router.get('/', listClasses);
router.get('/:id', getClass);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;
