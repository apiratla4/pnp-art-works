import mongoose from 'mongoose';

const CATEGORIES = [
  'Paintings',
  'Indian Products',
  'Workshops',
  'Custom Orders',
  'Digital Prints',
  'Handcrafted Items',
  'Limited Editions',
];

const INDIAN_SUBCATEGORIES = [
  'Kolam coasters',
  'Kolam peetham',
  'Traditional magnets',
  'Trays',
  'Diya holders',
];

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    subcategory: { type: String, trim: true, default: '' },
    price: { type: Number, min: 0, required: true },
    salePrice: { type: Number, min: 0, default: null },
    stock: { type: Number, min: 0, default: 0 },

    // Only an array of string URLs
    images: { type: [String], default: [] },

    description: { type: String, default: '' },
    published: { type: Boolean, default: true },

    dimensions: { type: String, default: '' },
    medium: { type: String, default: '' },
    year: { type: Number, default: new Date().getFullYear() },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.path('subcategory').validate(function (value) {
  if (this.category === 'Indian Products') {
    return value && INDIAN_SUBCATEGORIES.includes(value);
  }
  return true;
}, 'Invalid subcategory for Indian Products');

export const Product = mongoose.model('Product', productSchema);
export const PRODUCT_CONSTANTS = { CATEGORIES, INDIAN_SUBCATEGORIES };
