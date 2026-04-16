// Env loaded by tsx --env-file=.env.local (see package.json script)
import { getPayload } from 'payload';
import config from '../payload.config';
import { seedCategories } from './categories';
import { seedGlobals } from './globals';
import { seedJobs } from './jobs';
import { seedNavMenu } from './nav-menu';
import { seedNews } from './news';
import { seedPartners } from './partners';
import { seedPress } from './press';
import { seedProjects } from './projects';
import { seedServices } from './services';
import { seedTeam } from './team';
import { seedTestimonials } from './testimonials';
import { seedMedia } from './media';
import { seedUsers } from './users';

async function run() {
  const p = await getPayload({ config });
  p.logger.info('🌱 Seeding Hoàng Kim CMS...');
  const admin = await seedUsers(p);
  const media = await seedMedia(p);
  const cats = await seedCategories(p);
  const projects = await seedProjects(p, cats, media);
  const newsCats = await seedNews(p, admin, media);
  const services = await seedServices(p, media);
  const team = await seedTeam(p);
  const press = await seedPress(p);
  const partners = await seedPartners(p, media);
  const testimonials = await seedTestimonials(p, media);
  await seedJobs(p);
  await seedNavMenu(p, cats, services);
  await seedGlobals(p, { projects, press, testimonials, services, media });
  void partners;
  p.logger.info('✅ Seed complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
