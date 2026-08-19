import { Router } from 'express';
import { listGallery, createGalleryItems, updateGalleryItem, deleteGalleryItem } from '../controllers/gallery.controller.js';

const router = Router();
router.get('/', listGallery);
router.post('/', createGalleryItems);
router.patch('/:id', updateGalleryItem);
router.delete('/:id', deleteGalleryItem);

export default router;
