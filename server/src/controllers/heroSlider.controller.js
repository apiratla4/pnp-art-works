import HeroSlider from '../models/HeroSlider.js';

// GET all
export async function listHeroSlides(req, res) {
  const slides = await HeroSlider.find().sort({ createdAt: 1 });
  res.json(slides);
}

// POST create
export async function createHeroSlide(req, res) {
  try {
    const { image, alt, eyebrow, heading, sub, ctaLabel, ctaHref } = req.body;
    if (!image || !alt || !heading || !ctaLabel || !ctaHref)
      return res.status(400).json({ message: 'Missing required fields' });
    const slide = await HeroSlider.create({ image, alt, eyebrow, heading, sub, ctaLabel, ctaHref });
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

// PATCH update
export async function updateHeroSlide(req, res) {
  try {
    const { image, alt, eyebrow, heading, sub, ctaLabel, ctaHref } = req.body;
    const updateFields = { image, alt, eyebrow, heading, sub, ctaLabel, ctaHref };
    const slide = await HeroSlider.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

// DELETE slide
export async function deleteHeroSlide(req, res) {
  const slide = await HeroSlider.findByIdAndDelete(req.params.id);
  if (!slide) return res.status(404).json({ message: 'Slide not found' });
  res.json({ message: 'Slide deleted' });
}
