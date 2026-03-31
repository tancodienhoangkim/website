const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  content: { type: String, required: true },
  avatar: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
