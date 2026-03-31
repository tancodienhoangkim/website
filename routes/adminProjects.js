const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Category = require('../models/Category');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const projects = await Project.find().populate('category').sort('-createdAt');
  res.render('admin/projects/index', { layout: 'layouts/admin', title: 'Dự án', projects });
});

router.get('/create', async (req, res) => {
  const categories = await Category.find().sort('type order');
  res.render('admin/projects/form', { layout: 'layouts/admin', title: 'Thêm dự án', project: null, categories });
});

router.post('/', upload.array('images', 20), async (req, res) => {
  const { title, description, category, style, type, area, location, videoUrl, featured, order, status } = req.body;
  const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
  await Project.create({
    title, description, category: category || null, style, type, area, location, videoUrl,
    images, thumbnail: images[0] || '',
    featured: featured === 'on', order: parseInt(order, 10) || 0, status,
  });
  req.session.success = 'Đã thêm dự án';
  res.redirect('/admin/projects');
});

router.get('/:id/edit', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.redirect('/admin/projects');
  const categories = await Category.find().sort('type order');
  res.render('admin/projects/form', { layout: 'layouts/admin', title: 'Sửa dự án', project, categories });
});

router.put('/:id', upload.array('images', 20), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.redirect('/admin/projects');
  const { title, description, category, style, type, area, location, videoUrl, featured, order, status, existingImages } = req.body;
  project.title = title;
  project.description = description;
  project.category = category || null;
  project.style = style;
  project.type = type;
  project.area = area;
  project.location = location;
  project.videoUrl = videoUrl;
  project.featured = featured === 'on';
  project.order = parseInt(order, 10) || 0;
  project.status = status;
  const kept = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
  const newImages = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
  project.images = [...kept, ...newImages];
  project.thumbnail = project.images[0] || '';
  await project.save();
  req.session.success = 'Đã cập nhật dự án';
  res.redirect('/admin/projects');
});

router.delete('/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa dự án';
  res.redirect('/admin/projects');
});

module.exports = router;
