// models/Class.js
import mongoose from 'mongoose';

const MODES = ['Online', 'Studio'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    mode: { type: String, enum: MODES, default: 'Online' },
    startDate: { type: String, default: '' }, // UI sends string (input type="date")
    durationWeeks: { type: Number, min: 1, default: 4 },
    seats: { type: Number, min: 1, default: 10 },
    price: { type: Number, min: 0, default: 0 },
    level: { type: String, enum: LEVELS, default: 'Beginner' },
    cover: { type: String, default: '' }, // single URL string
    description: { type: String, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ClassModel = mongoose.model('Class', classSchema);
export const CLASS_CONSTANTS = { MODES, LEVELS };
