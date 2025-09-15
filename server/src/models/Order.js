// server/src/models/Order.js
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: String,
  title: String,
  image: String,
  unitPrice: Number,
  qty: Number,
  category: String,
  lineTotal: Number,
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  postal_code: String,
  country: String,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  method: { type: String, enum: ['paypal','cod'], required: true },
  status: { type: String, default: 'CREATED' },
  paypal: {
    orderId: String,
    captureId: String,
    raw: Object,
  },
  customer: {
    email: String,
    name: String,
    phone: String,
    address: AddressSchema,
  },
  items: [ItemSchema],
  summary: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: Number,
    total: Number,
    promoCode: String,
    percent: Number,
    currency: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);
