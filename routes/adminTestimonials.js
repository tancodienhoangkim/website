const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/security');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const testimonials = await Testimonial.find().sort('order');
  res.render('admin/testimonials/index', { layout: 'layouts/admin', title: 'Đánh giá', testimonials });
});

router.get('/create', (req, res) => {
  res.render('admin/testimonials/form', { layout: 'layouts/admin', title: 'Thêm đánh giá', testimonial: null });
});

router.post('/', requireCsrf, upload.single('avatar'), async (req, res) => {
  const { name, role, content, order, status } = req.body;
  const data = { name, role, content, order: parseInt(order, 10) || 0, status };
  if (req.file) data.avatar = '/uploads/' + req.file.filename;
  await Testimonial.create(data);
  req.session.success = 'Đã thêm đánh giá';
  res.redirect('/admin/testimonials');
});

router.get('/:id/edit', async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.redirect('/admin/testimonials');
  res.render('admin/testimonials/form', { layout: 'layouts/admin', title: 'Sửa đánh giá', testimonial });
});

router.put('/:id', requireCsrf, upload.single('avatar'), async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.redirect('/admin/testimonials');
  const { name, role, content, order, status } = req.body;
  testimonial.name = name;
  testimonial.role = role;
  testimonial.content = content;
  testimonial.order = parseInt(order, 10) || 0;
  testimonial.status = status;
  if (req.file) testimonial.avatar = '/uploads/' + req.file.filename;
  await testimonial.save();
  req.session.success = 'Đã cập nhật đánh giá';
  res.redirect('/admin/testimonials');
});

router.delete('/:id', requireCsrf, async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa đánh giá';
  res.redirect('/admin/testimonials');
});

module.exports = router;
