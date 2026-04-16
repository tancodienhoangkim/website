import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { vi } from '@payloadcms/translations/languages/vi';
import { en } from '@payloadcms/translations/languages/en';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Users } from './collections/users';
import { Media } from './collections/media';
import { ProjectCategories } from './collections/project-categories';
import { Projects } from './collections/projects';
import { NewsCategories } from './collections/news-categories';
import { News } from './collections/news';
import { Services } from './collections/services';
import { TeamMembers } from './collections/team-members';
import { PressMentions } from './collections/press-mentions';
import { Partners } from './collections/partners';
import { Testimonials } from './collections/testimonials';
import { Jobs } from './collections/jobs';
import { ContactSubmissions } from './collections/contact-submissions';
import { Subscribers } from './collections/subscribers';
import { NavMenu } from './collections/nav-menu';
import { SiteSettings } from './globals/site-settings';
import { Header } from './globals/header';
import { Footer } from './globals/footer';
import { Homepage } from './globals/homepage';
import { PromoPopup } from './globals/promo-popup';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET!,
  admin: {
    user: 'users',
    meta: { titleSuffix: ' · Hoàng Kim CMS' },
  },
  i18n: {
    supportedLanguages: { vi, en },
    fallbackLanguage: 'vi',
    translations: {
      vi: {
        general: {
          collections: 'Bộ sưu tập',
          allCollections: 'Tất cả bộ sưu tập',
          selectCollectionToBrowse: 'Chọn một bộ sưu tập để duyệt',
          globals: 'Cấu hình chung',
          dashboard: 'Bảng điều khiển',
        },
      },
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, ProjectCategories, Projects, NewsCategories, News, Services, TeamMembers, PressMentions, Partners, Testimonials, Jobs, ContactSubmissions, Subscribers, NavMenu],
  globals: [SiteSettings, Header, Footer, Homepage, PromoPopup],
  plugins: [
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: { disableLocalStorage: Boolean(process.env.S3_BUCKET) } },
      bucket: process.env.S3_BUCKET ?? '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
        forcePathStyle: true,
      },
    }),
  ],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
});
