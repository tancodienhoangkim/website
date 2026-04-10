const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { requireCsrf } = require('../middleware/security');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const posts = await Post.find().populate('category').sort('-createdAt');
  res.render('admin/posts/index', { layout: 'layouts/admin', title: 'Bài viết', posts });
});

router.get('/create', async (req, res) => {
  const categories = await Category.find().sort('type order');
  res.render('admin/posts/form', { layout: 'layouts/admin', title: 'Thêm bài viết', post: null, categories });
});

router.post('/', requireCsrf, upload.single('thumbnail'), async (req, res) => {
  const { title, content, excerpt, category, tags, status } = req.body;
  const data = {
    title, content, excerpt, category: category || null,
    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    status,
  };
  if (req.file) data.thumbnail = '/uploads/' + req.file.filename;
  await Post.create(data);
  req.session.success = 'Đã thêm bài viết';
  res.redirect('/admin/posts');
});

router.get('/:id/edit', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/admin/posts');
  const categories = await Category.find().sort('type order');
  res.render('admin/posts/form', { layout: 'layouts/admin', title: 'Sửa bài viết', post, categories });
});

router.put('/:id', requireCsrf, upload.single('thumbnail'), async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.redirect('/admin/posts');
  const { title, content, excerpt, category, tags, status } = req.body;
  post.title = title;
  post.content = content;
  post.excerpt = excerpt;
  post.category = category || null;
  post.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  post.status = status;
  if (req.file) post.thumbnail = '/uploads/' + req.file.filename;
  await post.save();
  req.session.success = 'Đã cập nhật bài viết';
  res.redirect('/admin/posts');
});

router.delete('/:id', requireCsrf, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  req.session.success = 'Đã xóa bài viết';
  res.redirect('/admin/posts');
});

module.exports = router;
