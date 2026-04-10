const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/security');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const services = await Service.find().sort('order');
  res.render('admin/services/index', { layout: 'layouts/admin', title: 'Dịch vụ', services });
});

router.get('/create', (req, res) => {
  res.render('admin/services/form', { layout: 'layouts/admin', title: 'Thêm dịch vụ', service: null });
});

router.post('/', requireCsrf, upload.single('image'), async (req, res) => {
  const { title, description, icon, order, status } = req.body;
  const data = { title, description, icon, order: parseInt(order, 10) || 0, status };
  if (req.file) data.image = '/uploads/' + req.file.filename;
  await Service.create(data);
  req.session.success = 'Đã thêm dịch vụ';
  res.redirect('/admin/services');
});

router.get('/:id/edit', async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.redirect('/admin/services');
  res.render('admin/services/form', { layout: 'layouts/admin', title: 'Sửa dịch vụ', service });
});

router.put('/:id', requireCsrf, upload.single('image'), async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.redirect('/admin/services');
  const { title, description, icon, order, status } = req.body;
  service.title = title;
  service.description = description;
  service.icon = icon;
  service.order = parseInt(order, 10) || 0;
  service.status = status;
  if (req.file) service.image = '/uploads/' + req.file.filename;
  await service.save();
  req.session.success = 'Đã cập nhật dịch vụ';
  res.redirect('/admin/services');
});

router.delete('/:id', requireCsrf, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa dịch vụ';
  res.redirect('/admin/services');
});

module.exports = router;
