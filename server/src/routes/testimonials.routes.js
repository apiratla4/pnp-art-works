import { Router } from 'express';
import { createTestimonial, getTestimonials, updateTestimonial, deleteTestimonial } from '../controllers/testimonials.controller.js';

const router = Router();
router.post('/', createTestimonial); // POST /api/testimonials
router.get('/', getTestimonials);      // GET /api/testimonials
router.put('/:id', updateTestimonial); // PUT /api/testimonials/:id
router.delete('/:id', deleteTestimonial); // DELETE /api/testimonials/:id

export default router;
