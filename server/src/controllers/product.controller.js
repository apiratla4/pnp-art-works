import { Product, PRODUCT_CONSTANTS } from '../models/Product.js';

function slugify(s = '') {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function normalizeImages(b = {}) {
  if (Array.isArray(b.images)) return Array.from(new Set(b.images.filter(Boolean).map(String)));
  if (typeof b.images === 'string' && b.images.trim()) return [b.images.trim()];
  if (Array.isArray(b.image)) return Array.from(new Set(b.image.filter(Boolean).map(String)));
  if (typeof b.image === 'string' && b.image.trim()) return [b.image.trim()];
  return [];
}

function validate(b = {}) {
  const errors = {};
  if (!b.title || !String(b.title).trim()) errors.title = 'Title is required';
  if (!b.category || !PRODUCT_CONSTANTS.CATEGORIES.includes(b.category)) errors.category = 'Invalid category';
  if (b.category === 'Indian Products') {
    if (!b.subcategory || !PRODUCT_CONSTANTS.INDIAN_SUBCATEGORIES.includes(b.subcategory)) {
      errors.subcategory = 'Subcategory required for Indian Products';
    }
  }
  const price = Number(b.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number';
  if (b.salePrice !== undefined && b.salePrice !== null && b.salePrice !== '') {
    const sp = Number(b.salePrice);
    if (!Number.isFinite(sp) || sp < 0) errors.salePrice = 'Sale price must be a non-negative number';
    else if (Number.isFinite(price) && sp > price) errors.salePrice = 'Sale price cannot exceed price';
  }
  const year = Number(b.year);
  const now = new Date().getFullYear();
  if (year && (!Number.isInteger(year) || year < 1900 || year > now)) errors.year = `Year must be between 1900 and ${now}`;
  return errors;
}

export async function listProducts(req, res, next) {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    return res.json({ items });
  } catch (e) { return next(e); }
}

export async function getProduct(req, res, next) {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (e) { return next(e); }
}

export async function createProduct(req, res, next) {
  try {
    const b = req.body || {};
    const errs = validate(b);
    if (Object.keys(errs).length) return res.status(400).json({ message: 'Validation failed', details: errs });

    const payload = {
      title: String(b.title).trim(),
      slug: slugify(b.title),
      category: b.category,
      subcategory: b.category === 'Indian Products' ? (b.subcategory || '') : '',
      price: Number(b.price),
      salePrice:
        b.salePrice !== undefined && b.salePrice !== null && b.salePrice !== ''
          ? Number(b.salePrice)
          : null,
      stock: Number(b.stock || 0),
      images: normalizeImages(b),   // array of strings
      description: b.description || '',
      published: !!b.published,
      dimensions: b.dimensions || '',
      medium: b.medium || '',
      year: b.year ? Number(b.year) : new Date().getFullYear(),
      inStock: typeof b.inStock === 'boolean' ? b.inStock : (Number(b.stock || 0) > 0),
      featured: !!b.featured,
    };

    const doc = await Product.create(payload);
    return res.status(201).json(doc);
  } catch (e) { return next(e); }
}

export async function updateProduct(req, res, next) {
  try {
    const b = req.body || {};
    const errs = validate({ ...b, title: b.title || 'x', price: b.price ?? 0 });
    const filtered = Object.fromEntries(Object.entries(errs).filter(([k]) => b[k] !== undefined));
    if (Object.keys(filtered).length) return res.status(400).json({ message: 'Validation failed', details: filtered });

    const patch = {
      ...(b.title !== undefined && { title: String(b.title).trim(), slug: slugify(b.title) }),
      ...(b.category !== undefined && { category: b.category }),
      ...(b.category !== undefined && { subcategory: b.category === 'Indian Products' ? (b.subcategory || '') : '' }),
      ...(b.price !== undefined && { price: Number(b.price) }),
      ...(b.salePrice !== undefined && { salePrice: b.salePrice !== null && b.salePrice !== '' ? Number(b.salePrice) : null }),
      ...(b.stock !== undefined && { stock: Number(b.stock || 0) }),
      ...((b.images !== undefined || b.image !== undefined) && { images: normalizeImages(b) }),
      ...(b.description !== undefined && { description: b.description || '' }),
      ...(b.published !== undefined && { published: !!b.published }),
      ...(b.dimensions !== undefined && { dimensions: b.dimensions || '' }),
      ...(b.medium !== undefined && { medium: b.medium || '' }),
      ...(b.year !== undefined && { year: Number(b.year) }),
      ...(b.inStock !== undefined && { inStock: !!b.inStock }),
      ...(b.featured !== undefined && { featured: !!b.featured }),
    };

    const doc = await Product.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (e) { return next(e); }
}

export async function deleteProduct(req, res, next) {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
}
