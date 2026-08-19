// controllers/classes.controller.js
import { ClassModel, CLASS_CONSTANTS } from '../models/Class.js';

// Basic payload validation aligned with UI rules
function validate(b = {}) {
  const errors = {};
  if (!b.title || !String(b.title).trim()) errors.title = 'Title is required';
  if (!b.mode || !CLASS_CONSTANTS.MODES.includes(b.mode)) errors.mode = 'Invalid mode';
  if (!b.startDate) errors.startDate = 'Start date is required';
  const dw = Number(b.durationWeeks);
  if (!Number.isFinite(dw) || dw < 1) errors.durationWeeks = 'Duration must be >= 1 week';
  const seats = Number(b.seats);
  if (!Number.isFinite(seats) || seats < 1) errors.seats = 'Seats must be >= 1';
  const price = b.price !== undefined && b.price !== '' ? Number(b.price) : 0;
  if (!Number.isFinite(price) || price < 0) errors.price = 'Price must be a non-negative number';
  if (!b.level || !CLASS_CONSTANTS.LEVELS.includes(b.level)) errors.level = 'Invalid level';
  return errors;
}

// GET /api/classes?published=true|false
export async function listClasses(req, res, next) {
  try {
    const { published } = req.query;
    const q = {};
    if (published === 'true') q.published = true;
    if (published === 'false') q.published = false;
    const items = await ClassModel.find(q).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return next(error); // Pass errors to Express error handler
  }
}

export async function getClass(req, res, next) {
  try {
    const doc = await ClassModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Class not found' });
    return res.json(doc);
  } catch (error) {
    return next(error);
  }
}

export async function createClass(req, res, next) {
  try {
    const b = req.body || {};
    const errs = validate(b);
    
    // Return 400 for validation errors (client error)
    if (Object.keys(errs).length) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errs 
      });
    }

    const payload = {
      title: String(b.title).trim(),
      mode: b.mode || 'Online',
      startDate: b.startDate || '',
      durationWeeks: Number(b.durationWeeks || 4),
      seats: Number(b.seats || 10),
      price: b.price ? Number(b.price) : 0,
      level: b.level || 'Beginner',
      cover: b.cover || '',
      description: b.description || '',
      published: b.published === true || b.published === 'true',
    };

    const doc = await ClassModel.create(payload);
    return res.status(201).json(doc);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    return next(error);
  }
}

export async function updateClass(req, res, next) {
  try {
    const b = req.body || {};
    
    // Partial validation: only validate provided fields
    const partialData = {
      ...(b.title !== undefined && { title: b.title }),
      ...(b.mode !== undefined && { mode: b.mode }),
      ...(b.startDate !== undefined && { startDate: b.startDate }),
      ...(b.durationWeeks !== undefined && { durationWeeks: b.durationWeeks }),
      ...(b.seats !== undefined && { seats: b.seats }),
      ...(b.price !== undefined && { price: b.price }),
      ...(b.level !== undefined && { level: b.level }),
    };
    
    // Only validate fields that are being updated
    const errs = validate({
      title: partialData.title || 'placeholder',
      mode: partialData.mode || 'Online',
      startDate: partialData.startDate || '2000-01-01',
      durationWeeks: partialData.durationWeeks || 1,
      seats: partialData.seats || 1,
      price: partialData.price !== undefined ? partialData.price : 0,
      level: partialData.level || 'Beginner',
    });
    
    // Filter errors to only include fields being updated
    const relevantErrors = Object.fromEntries(
      Object.entries(errs).filter(([key]) => b[key] !== undefined)
    );
    
    if (Object.keys(relevantErrors).length) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: relevantErrors 
      });
    }

    const update = {
      ...(b.title !== undefined && { title: String(b.title).trim() }),
      ...(b.mode !== undefined && { mode: b.mode }),
      ...(b.startDate !== undefined && { startDate: b.startDate }),
      ...(b.durationWeeks !== undefined && { durationWeeks: Number(b.durationWeeks) }),
      ...(b.seats !== undefined && { seats: Number(b.seats) }),
      ...(b.price !== undefined && { price: Number(b.price) }),
      ...(b.level !== undefined && { level: b.level }),
      ...(b.cover !== undefined && { cover: b.cover || '' }),
      ...(b.description !== undefined && { description: b.description || '' }),
      ...(b.published !== undefined && { published: b.published === true || b.published === 'true' }),
    };

    const doc = await ClassModel.findByIdAndUpdate(
      req.params.id, 
      update, 
      { new: true, runValidators: true }
    );
    
    if (!doc) return res.status(404).json({ message: 'Class not found' });
    return res.json(doc);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    return next(error);
  }
}

export async function deleteClass(req, res, next) {
  try {
    const doc = await ClassModel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Class not found' });
    return res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    return next(error);
  }
}
