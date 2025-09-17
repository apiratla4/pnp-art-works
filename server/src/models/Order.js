// src/models/Order.js
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    productId: { type: String },
    name: { type: String },
    qty: { type: Number },
    price: { type: Number }, // unit price
    total: { type: Number }, // qty * price
    variant: { type: String },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    countryCode: String,
    phone: String,
    email: String,
  },
  { _id: false }
);

const TotalsSchema = new mongoose.Schema(
  {
    subtotal: { type: Number },
    tax: { type: Number },
    shipping: { type: Number },
    discount: { type: Number },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Local checkout info (from checkout page)
    userId: { type: String },
    customer: {
      email: String,
      firstName: String,
      lastName: String,
    },
    items: [ItemSchema],
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    totals: TotalsSchema,
    referenceId: { type: String }, // local ref for reconciliation

    // PayPal Order info
    paypalOrderId: { type: String, index: true },
    intent: { type: String }, // CAPTURE or AUTHORIZE
    status: { type: String }, // CREATED, APPROVED, COMPLETED, etc.
    approvalLink: { type: String },

    // Snapshots
    paypalCreateResponse: { type: mongoose.Schema.Types.Mixed },
    paypalCaptureResponse: { type: mongoose.Schema.Types.Mixed },

    // Captures array (if multiple captures occur)
    captures: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // Webhook events log
    webhooks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
