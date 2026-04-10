const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
}, { timestamps: true });

postSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Post', postSchema);
