const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const categories = await Category.find().populate('parent').sort('type order');
  res.render('admin/categories/index', { layout: 'layouts/admin', title: 'Danh mục', categories });
});

router.get('/create', async (req, res) => {
  const parents = await Category.find({ parent: null }).sort('type order');
  res.render('admin/categories/form', { layout: 'layouts/admin', title: 'Thêm danh mục', category: null, parents });
});

router.post('/', async (req, res) => {
  const { name, type, parent, order } = req.body;
  await Category.create({ name, type, parent: parent || null, order: parseInt(order, 10) || 0 });
  req.session.success = 'Đã thêm danh mục';
  res.redirect('/admin/categories');
});

router.get('/:id/edit', async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.redirect('/admin/categories');
  const parents = await Category.find({ parent: null, _id: { $ne: category._id } }).sort('type order');
  res.render('admin/categories/form', { layout: 'layouts/admin', title: 'Sửa danh mục', category, parents });
});

router.put('/:id', async (req, res) => {
  const { name, type, parent, order } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.redirect('/admin/categories');
  category.name = name;
  category.type = type;
  category.parent = parent || null;
  category.order = parseInt(order, 10) || 0;
  await category.save();
  req.session.success = 'Đã cập nhật danh mục';
  res.redirect('/admin/categories');
});

router.delete('/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa danh mục';
  res.redirect('/admin/categories');
});

module.exports = router;
