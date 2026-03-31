require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Testimonial = require('../models/Testimonial');
const Setting = require('../models/Setting');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Service.deleteMany({}),
    Project.deleteMany({}), Post.deleteMany({}), Testimonial.deleteMany({}), Setting.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  await User.create({ username: 'admin', password: 'admin123' });
  console.log('Created admin user (admin / admin123)');

  const archCats = await Category.create([
    { name: 'Biệt thự', type: 'architecture', order: 1 },
    { name: 'Nhà phố', type: 'architecture', order: 2 },
    { name: 'Lâu đài', type: 'architecture', order: 3 },
    { name: 'Dinh thự', type: 'architecture', order: 4 },
    { name: 'Khách sạn', type: 'architecture', order: 5 },
  ]);
  const intCats = await Category.create([
    { name: 'Phòng khách', type: 'interior', order: 1 },
    { name: 'Phòng ngủ', type: 'interior', order: 2 },
    { name: 'Phòng bếp', type: 'interior', order: 3 },
    { name: 'Phòng tắm', type: 'interior', order: 4 },
    { name: 'Văn phòng', type: 'interior', order: 5 },
  ]);
  await Category.create([
    { name: 'Thi công biệt thự', type: 'construction', order: 1 },
    { name: 'Thi công nhà phố', type: 'construction', order: 2 },
    { name: 'Thi công nội thất', type: 'construction', order: 3 },
  ]);
  console.log('Created categories');

  await Service.create([
    { title: 'Thiết kế kiến trúc', description: '<p>Dịch vụ thiết kế kiến trúc chuyên nghiệp cho biệt thự, nhà phố, lâu đài với phong cách tân cổ điển sang trọng.</p>', icon: 'fas fa-pencil-ruler', order: 1, status: 'published' },
    { title: 'Thiết kế nội thất', description: '<p>Thiết kế nội thất sang trọng, tinh tế theo phong cách hoàng gia cho mọi không gian sống.</p>', icon: 'fas fa-couch', order: 2, status: 'published' },
    { title: 'Thi công xây dựng', description: '<p>Thi công trọn gói từ phần thô đến hoàn thiện với cam kết chất lượng vàng và tiến độ.</p>', icon: 'fas fa-hard-hat', order: 3, status: 'published' },
    { title: 'Tư vấn phong thủy', description: '<p>Tư vấn phong thủy chuyên sâu, đảm bảo hài hòa và mang lại vượng khí cho gia chủ.</p>', icon: 'fas fa-yin-yang', order: 4, status: 'published' },
  ]);
  console.log('Created services');

  const styles = ['tan-co-dien', 'hien-dai', 'co-dien-phap', 'dia-trung-hai'];
  const types = ['biet-thu', 'nha-pho', 'lau-dai', 'dinh-thu'];
  const locations = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Quảng Ninh', 'Nghệ An'];
  const allCats = [...archCats, ...intCats];
  const projectData = [];
  for (let i = 1; i <= 12; i++) {
    projectData.push({
      title: `Biệt thự tân cổ điển Hoàng Kim ${i}`,
      description: `<p>Thiết kế biệt thự tân cổ điển số ${i} mang phong cách Hoàng Kim sang trọng, đẳng cấp.</p><p>Kết hợp hài hòa giữa kiến trúc cổ điển châu Âu và nét hiện đại tinh tế.</p>`,
      thumbnail: `https://picsum.photos/seed/hk${i}/600/400`,
      images: [`https://picsum.photos/seed/hk${i}/600/400`, `https://picsum.photos/seed/hk${i}b/600/400`, `https://picsum.photos/seed/hk${i}c/600/400`],
      category: allCats[i % allCats.length]._id,
      style: styles[i % styles.length],
      type: types[i % types.length],
      area: `${150 + i * 20}m2`,
      location: locations[i % locations.length],
      videoUrl: i <= 3 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '',
      featured: i <= 6,
      order: i,
      status: 'published',
    });
  }
  await Project.create(projectData);
  console.log('Created 12 projects');

  const postData = [];
  for (let i = 1; i <= 6; i++) {
    postData.push({
      title: `Xu hướng thiết kế biệt thự tân cổ điển ${2026} — Phần ${i}`,
      content: `<p>Năm 2026 chứng kiến sự trỗi dậy mạnh mẽ của phong cách tân cổ điển trong thiết kế biệt thự.</p><p>Sự kết hợp giữa đường nét cổ điển châu Âu và vật liệu hiện đại tạo nên những công trình vừa sang trọng vừa bền vững.</p>`,
      excerpt: `Khám phá xu hướng thiết kế biệt thự tân cổ điển mới nhất năm 2026.`,
      thumbnail: `https://picsum.photos/seed/post${i}/600/400`,
      tags: ['tân cổ điển', 'biệt thự', 'xu hướng'],
      status: 'published',
    });
  }
  await Post.create(postData);
  console.log('Created 6 blog posts');

  await Testimonial.create([
    { name: 'Nguyễn Văn Hùng', role: 'CEO, Tập đoàn XYZ', content: 'Tân Cổ Điển Hoàng Kim đã mang đến cho gia đình tôi một biệt thự tuyệt đẹp. Đội ngũ kiến trúc sư rất tận tâm và chuyên nghiệp.', order: 1, status: 'published' },
    { name: 'Trần Thị Mai', role: 'Doanh nhân', content: 'Tôi ấn tượng với sự tỉ mỉ trong từng chi tiết thiết kế. Ngôi nhà hoàn thiện đúng như bản vẽ 3D.', order: 2, status: 'published' },
    { name: 'Lê Minh Đức', role: 'Giám đốc, Công ty ABC', content: 'Tiến độ thi công đúng cam kết, chất lượng vượt mong đợi. Hoàng Kim là đơn vị uy tín nhất mà tôi từng hợp tác.', order: 3, status: 'published' },
    { name: 'Phạm Thu Hà', role: 'Chủ biệt thự Vinhomes', content: 'Nội thất sang trọng, tinh tế. Mỗi căn phòng đều mang nét đặc biệt riêng mà vẫn hài hòa tổng thể.', order: 4, status: 'published' },
    { name: 'Hoàng Anh Tuấn', role: 'Kỹ sư xây dựng', content: 'Với con mắt chuyên môn, tôi đánh giá cao bản vẽ kỹ thuật và phương án kết cấu. Rất chi tiết và an toàn.', order: 5, status: 'published' },
  ]);
  console.log('Created 5 testimonials');

  await Setting.create([
    { key: 'siteName', value: 'Tân Cổ Điển Hoàng Kim', group: 'general' },
    { key: 'phone', value: '0966.888.000', group: 'general' },
    { key: 'email', value: 'info@hoangkim.vn', group: 'general' },
    { key: 'address', value: '123 Nguyễn Trãi, Thanh Xuân, Hà Nội', group: 'general' },
    { key: 'footerText', value: '© 2026 Tân Cổ Điển Hoàng Kim. Thiết kế tận tâm — Thi công tận lực.', group: 'general' },
    { key: 'googleMapsEmbed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096!2d105.7938!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1', group: 'general' },
    { key: 'metaTitle', value: 'Tân Cổ Điển Hoàng Kim — Thiết kế biệt thự, nội thất, thi công trọn gói', group: 'seo' },
    { key: 'metaDescription', value: 'Công ty thiết kế kiến trúc tân cổ điển và thi công xây dựng chuyên nghiệp. 1000+ mẫu biệt thự đẳng cấp hoàng gia.', group: 'seo' },
    { key: 'facebook', value: 'https://facebook.com/hoangkim', group: 'social' },
    { key: 'zalo', value: '0966888000', group: 'social' },
    { key: 'youtube', value: 'https://youtube.com/@hoangkim', group: 'social' },
    { key: 'partners', value: JSON.stringify([
      { name: 'Đối tác 1', logo: 'https://via.placeholder.com/120x60?text=Partner+1' },
      { name: 'Đối tác 2', logo: 'https://via.placeholder.com/120x60?text=Partner+2' },
      { name: 'Đối tác 3', logo: 'https://via.placeholder.com/120x60?text=Partner+3' },
      { name: 'Đối tác 4', logo: 'https://via.placeholder.com/120x60?text=Partner+4' },
      { name: 'Đối tác 5', logo: 'https://via.placeholder.com/120x60?text=Partner+5' },
    ]), group: 'general' },
    { key: 'pressLogos', value: JSON.stringify([
      { name: 'VnExpress', logo: 'https://via.placeholder.com/120x40?text=VnExpress' },
      { name: 'Dân Trí', logo: 'https://via.placeholder.com/120x40?text=Dan+Tri' },
      { name: 'Tuổi Trẻ', logo: 'https://via.placeholder.com/120x40?text=Tuoi+Tre' },
    ]), group: 'general' },
  ]);
  console.log('Created default settings');

  console.log('\nSeed completed! Admin: admin / admin123');
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
