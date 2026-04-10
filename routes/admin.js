const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Contact = require('../models/Contact');
const { requireAuth } = require('../middleware/auth');
const {
  createRateLimiter,
  getClientIp,
  requireCsrf,
  verifyTurnstileToken,
} = require('../middleware/security');

function renderLogin(req, res, error, status = 200) {
  return res.status(status).render('admin/login', {
    layout: 'layouts/admin',
    title: 'Đăng nhập',
    error: error || res.locals.error || null,
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `admin-login:${getClientIp(req)}:${(req.body.username || '').trim().toLowerCase()}`,
  onLimit: (req, res) => renderLogin(req, res, 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.', 429),
});

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  renderLogin(req, res);
});

router.post('/login', requireCsrf, loginRateLimit, async (req, res, next) => {
  const { username, password } = req.body;
  const turnstileResult = await verifyTurnstileToken(req.body['cf-turnstile-response'], req);
  if (!turnstileResult.success) {
    return renderLogin(req, res, 'Vui lòng xác minh bạn không phải robot.');
  }
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return renderLogin(req, res, 'Sai tên đăng nhập hoặc mật khẩu');
  }
  try {
    await regenerateSession(req);
    req.session.user = { _id: user._id, username: user.username, role: user.role };
    if (req.rateLimit) req.rateLimit.reset();
    return res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('hoangkim.sid');
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
