import { Router } from 'express';
import {
  listHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide
} from '../controllers/heroSlider.controller.js';

const router = Router();
router.get('/', listHeroSlides);
router.post('/', createHeroSlide);
router.patch('/:id', updateHeroSlide);
router.delete('/:id', deleteHeroSlide);
export default router;
