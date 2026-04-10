const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/security');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const contacts = await Contact.find().sort('-createdAt');
  res.render('admin/contacts/index', { layout: 'layouts/admin', title: 'Liên hệ', contacts });
});

router.put('/:id/read', requireCsrf, async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { read: true });
  res.redirect('/admin/contacts');
});

router.delete('/:id', requireCsrf, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa liên hệ';
  res.redirect('/admin/contacts');
});

module.exports = router;
