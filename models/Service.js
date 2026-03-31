const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
});

serviceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
