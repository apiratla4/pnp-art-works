// src/routes/index.js
import { Router } from 'express';
import classesRoutes from './classes.routes.js';
import galleryRouter from './gallery.routes.js';
import productsRouter from './products.routes.js';
import authRouter from './auth.routes.js';
import couponsRouter from './coupon.routes.js';
import newsletterRouter from './newsletter.routes.js';
import checkoutRouter from './checkout.routes.js';
import customOrderRouter from './custom.order.routes.js';
import contactRouter from './contact.routes.js';
import paypalRouter from './paypal.routes.js';
import redirectRouter from './redirect.routes.js';

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/classes', classesRoutes);
routes.use('/gallery', galleryRouter);
routes.use('/products', productsRouter);
routes.use('/coupons', couponsRouter);
routes.use('/newsletters', newsletterRouter);
routes.use('/custom-orders', customOrderRouter); 
routes.use('/checkout', checkoutRouter);
routes.use('/contact', contactRouter);
routes.use('/paypal', paypalRouter);
routes.use('/redirect', redirectRouter);


export default routes;
