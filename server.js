require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const helmet = require('helmet');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');
const Setting = require('./models/Setting');
const { attachSecurityLocals } = require('./middleware/security');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');

// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE from forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  name: 'hoangkim.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
    secure: 'auto',
  },
}));

// Make session data available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Load site settings for all views
app.use(async (req, res, next) => {
  try {
    res.locals.settings = await Setting.getAll();
  } catch (e) {
    res.locals.settings = {};
  }
  next();
});

app.use(attachSecurityLocals);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Routes
app.use('/admin/categories', require('./routes/adminCategories'));
app.use('/admin/services', require('./routes/adminServices'));
app.use('/admin/projects', require('./routes/adminProjects'));
app.use('/admin/posts', require('./routes/adminPosts'));
app.use('/admin/testimonials', require('./routes/adminTestimonials'));
app.use('/admin/contacts', require('./routes/adminContacts'));
app.use('/admin/settings', require('./routes/adminSettings'));
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', { layout: false, title: '404 - Không tìm thấy trang' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', { layout: false, title: 'Lỗi server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
