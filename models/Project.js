const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  thumbnail: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  style: { type: String, default: '' },
  type: { type: String, default: '' },
  area: { type: String, default: '' },
  location: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, { timestamps: true });

projectSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
