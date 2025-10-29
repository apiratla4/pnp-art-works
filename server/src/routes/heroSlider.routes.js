import { Router } from 'express';
import {
  listHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide
} from '../controllers/heroSlider.controller.js';

const router = Router();

router.get('/', listHeroSlides);                // GET all
router.post('/', createHeroSlide);              // POST create (expects image field as Cloudinary URL)
router.patch('/:id', updateHeroSlide);          // PATCH update
router.delete('/:id', deleteHeroSlide);         // DELETE by id

export default router;
