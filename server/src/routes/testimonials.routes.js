import { Router } from 'express';
import { createTestimonial, getTestimonials, updateTestimonial } from '../controllers/testimonials.controller.js';

const router = Router();
router.post('/', createTestimonial); // POST /api/testimonials
router.get('/', getTestimonials);      // GET /api/testimonials
router.put('/:id', updateTestimonial); // PUT /api/testimonials/:id

export default router;
