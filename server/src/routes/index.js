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
import paypalRoutes from './paypal.routes.js';
import redirectRouter from './redirect.routes.js';
import paypalWebhookRoutes from './paypal.webhook.routes.js';
import ordersRoutes from './orders.routes.js';
import testimonialsRoutes from './testimonials.routes.js';
import storePickupRoutes from './storePickup.routes.js';
import heroSliderRouter from './heroSlider.routes.js';

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
routes.use('/paypal', paypalRoutes);
routes.use('/redirect', redirectRouter);
routes.use('/paypal/webhook', paypalWebhookRoutes); // PayPal webhook endpoint
routes.use('/orders', ordersRoutes);               // Orders API
routes.use('/testimonials', testimonialsRoutes);   // Testimonials API
routes.use('/store-pickup-orders', storePickupRoutes);
routes.use('/hero-sliders', heroSliderRouter);

export default routes;
