// src/routes/index.js
import { Router } from 'express';
import classesRoutes from './classes.routes.js'; // ✅ Added .js
import galleryRouter from './gallery.routes.js';  // ✅ Added .js
import productsRouter from './products.routes.js'; // ✅ Added .js
import authRouter from './auth.routes.js';        // ✅ Added .js
import couponsRouter from './coupon.routes.js';   // ✅ Added .js
import newsletterRouter from './newsletter.routes.js'; // ✅ Added .js

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/classes', classesRoutes);
routes.use('/gallery', galleryRouter);
routes.use('/products', productsRouter);
routes.use('/coupons', couponsRouter);
routes.use('/newsletters', newsletterRouter);

export default routes;
