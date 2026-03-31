const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Contact = require('../models/Contact');
const { requireAuth } = require('../middleware/auth');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  res.render('admin/login', { layout: false, error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.render('admin/login', { layout: false, error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }
  req.session.user = { _id: user._id, username: user.username, role: user.role };
  res.redirect('/admin');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/', requireAuth, async (req, res) => {
  const [projectCount, postCount, contactCount, unreadCount] = await Promise.all([
    Project.countDocuments(),
    Post.countDocuments(),
    Contact.countDocuments(),
    Contact.countDocuments({ read: false }),
  ]);
  res.render('admin/dashboard', {
    layout: 'layouts/admin', title: 'Dashboard',
    projectCount, postCount, contactCount, unreadCount,
  });
});

module.exports = router;
