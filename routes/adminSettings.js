const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/security');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const settings = await Setting.getAll();
  res.render('admin/settings/index', { layout: 'layouts/admin', title: 'Cài đặt', settings });
});

router.put('/', requireCsrf, upload.single('logo'), async (req, res) => {
  const fields = [
    { key: 'siteName', group: 'general' },
    { key: 'phone', group: 'general' },
    { key: 'email', group: 'general' },
    { key: 'address', group: 'general' },
    { key: 'footerText', group: 'general' },
    { key: 'googleMapsEmbed', group: 'general' },
    { key: 'metaTitle', group: 'seo' },
    { key: 'metaDescription', group: 'seo' },
    { key: 'facebook', group: 'social' },
    { key: 'zalo', group: 'social' },
    { key: 'youtube', group: 'social' },
  ];
  for (const { key, group } of fields) {
    if (req.body[key] !== undefined) {
      await Setting.set(key, req.body[key], group);
    }
  }
  if (req.file) {
    await Setting.set('logo', '/uploads/' + req.file.filename, 'general');
  }
  req.session.success = 'Đã cập nhật cài đặt';
  res.redirect('/admin/settings');
});

module.exports = router;
