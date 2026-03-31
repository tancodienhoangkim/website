const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Service = require('../models/Service');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Contact = require('../models/Contact');
const Testimonial = require('../models/Testimonial');
const Setting = require('../models/Setting');
const transporter = require('../config/mail');

router.get('/', async (req, res) => {
  const [services, featuredProjects, interiorProjects, constructionProjects, testimonials, posts, videosProjects] = await Promise.all([
    Service.find({ status: 'published' }).sort('order'),
    Project.find({ status: 'published', featured: true }).sort('order').limit(6),
    Project.find({ status: 'published' }).populate('category').sort('order').limit(6),
    Project.find({ status: 'published' }).sort('-createdAt').limit(6),
    Testimonial.find({ status: 'published' }).sort('order'),
    Post.find({ status: 'published' }).sort('-createdAt').limit(4),
    Project.find({ status: 'published', videoUrl: { $ne: '' } }).limit(6),
  ]);
  const settings = await Setting.getAll();
  let partners = [], pressLogos = [];
  try { partners = JSON.parse(settings.partners || '[]'); } catch (e) {}
  try { pressLogos = JSON.parse(settings.pressLogos || '[]'); } catch (e) {}
  res.render('pages/home', { layout: 'layouts/main', title: null, services, featuredProjects, interiorProjects, constructionProjects, testimonials, posts, videosProjects, partners, pressLogos });
});

router.get('/gioi-thieu', (req, res) => {
  res.render('pages/about', { layout: 'layouts/main', title: 'Giới thiệu' });
});

router.get('/dich-vu', async (req, res) => {
  const services = await Service.find({ status: 'published' }).sort('order');
  res.render('pages/services', { layout: 'layouts/main', title: 'Dịch vụ', services });
});

router.get('/dich-vu/:slug', async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug });
  if (!service) return res.status(404).render('pages/404', { title: '404' });
  res.render('pages/service-detail', { layout: 'layouts/main', title: service.title, service });
});

router.get('/thiet-ke-kien-truc', async (req, res) => {
  const { style, type, page = 1 } = req.query;
  const filter = { status: 'published' };
  const archCats = await Category.find({ type: 'architecture' });
  filter.category = { $in: archCats.map(c => c._id) };
  if (style) filter.style = style;
  if (type) filter.type = type;
  const limit = 12, skip = (parseInt(page, 10) - 1) * limit;
  const [projects, total] = await Promise.all([Project.find(filter).sort('order').skip(skip).limit(limit), Project.countDocuments(filter)]);
  res.render('pages/architecture', { layout: 'layouts/main', title: 'Thiết kế kiến trúc', projects, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / limit), style: style || '', type: type || '' });
});

router.get('/thiet-ke-noi-that', async (req, res) => {
  const { style, page = 1 } = req.query;
  const filter = { status: 'published' };
  const intCats = await Category.find({ type: 'interior' });
  filter.category = { $in: intCats.map(c => c._id) };
  if (style) filter.style = style;
  const limit = 12, skip = (parseInt(page, 10) - 1) * limit;
  const [projects, total] = await Promise.all([Project.find(filter).sort('order').skip(skip).limit(limit), Project.countDocuments(filter)]);
  res.render('pages/interior', { layout: 'layouts/main', title: 'Thiết kế nội thất', projects, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / limit), style: style || '' });
});

router.get('/thi-cong', async (req, res) => {
  const conCats = await Category.find({ type: 'construction' });
  const projects = await Project.find({ status: 'published', category: { $in: conCats.map(c => c._id) } }).sort('order');
  res.render('pages/construction', { layout: 'layouts/main', title: 'Thi công', projects });
});

router.get('/du-an/:slug', async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug }).populate('category');
  if (!project) return res.status(404).render('pages/404', { title: '404' });
  const related = await Project.find({ _id: { $ne: project._id }, status: 'published' }).limit(4);
  res.render('pages/project-detail', { layout: 'layouts/main', title: project.title, project, related });
});

router.get('/tin-tuc', async (req, res) => {
  const { category, page = 1 } = req.query;
  const filter = { status: 'published' };
  if (category) filter.category = category;
  const limit = 10, skip = (parseInt(page, 10) - 1) * limit;
  const [posts, total, categories] = await Promise.all([Post.find(filter).populate('category').sort('-createdAt').skip(skip).limit(limit), Post.countDocuments(filter), Category.find()]);
  res.render('pages/blog', { layout: 'layouts/main', title: 'Tin tức', posts, categories, currentPage: parseInt(page, 10), totalPages: Math.ceil(total / limit), selectedCategory: category || '' });
});

router.get('/tin-tuc/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('category');
  if (!post) return res.status(404).render('pages/404', { title: '404' });
  const related = await Post.find({ _id: { $ne: post._id }, status: 'published' }).sort('-createdAt').limit(4);
  res.render('pages/blog-detail', { layout: 'layouts/main', title: post.title, post, related });
});

router.get('/lien-he', (req, res) => {
  res.render('pages/contact', { layout: 'layouts/main', title: 'Liên hệ' });
});

router.post('/api/contact', async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !message) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  await Contact.create({ name, phone, email, message });
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM, to: process.env.MAIL_TO, subject: `[Liên hệ mới] ${name} - ${phone}`, html: `<p><strong>Tên:</strong> ${name}</p><p><strong>SĐT:</strong> ${phone}</p><p><strong>Email:</strong> ${email || 'N/A'}</p><p><strong>Nội dung:</strong> ${message}</p>` });
  } catch (e) { console.error('Mail error:', e.message); }
  res.json({ success: true, message: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.' });
});

module.exports = router;
