require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const helmet = require('helmet');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const Setting = require('./models/Setting');

const app = express();

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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
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

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
  res.status(404).render('pages/404', { title: '404 - Không tìm thấy trang' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', { title: 'Lỗi server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
