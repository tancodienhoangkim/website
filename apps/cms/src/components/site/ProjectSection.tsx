import Image from 'next/image';
import Link from 'next/link';

export type ProjectSectionTab = { label: string; href: string };
export type ProjectSectionItem = {
  id: string | number;
  title: string;
  slug: string;
  coverImage: { url: string; alt?: string; width?: number; height?: number } | null;
  specs?: {
    area?: number | null;
    floors?: number | null;
    location?: string | null;
    year?: number | null;
    style?: string | null;
  };
};

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  tabs: ProjectSectionTab[];
  projects: ProjectSectionItem[];
  moreHref?: string;
};

function InfoLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <li>
      <span className="label">{label}:</span> <strong>{value}</strong>
    </li>
  );
}

export function ProjectSection({ id, title, subtitle, tabs, projects, moreHref }: Props) {
  if (!projects || projects.length === 0) return null;
  return (
    <div id={id} className="nh-row py-40 mb-30 block-project-section">
      <div className="container">
        <div className="box-product-tab-home clearfix">
          <div className="tab-product clearfix">
            <h2 className="section-title-center">{title}</h2>
            {subtitle ? <p className="section-subtitle-center">{subtitle}</p> : null}
            {tabs.length > 0 ? (
              <div className="list-tab">
                <div className="list-title-txt">
                  {tabs.map((t) => (
                    <h3 key={t.href} className="item-tab-home">
                      <Link href={t.href} className="tab-item">
                        {t.label}
                      </Link>
                    </h3>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="content-product-list">
            <div className="product-grid">
              {projects.map((proj) => {
                const specs = proj.specs ?? {};
                const area = specs.area ? `${specs.area}m²` : null;
                const floors = specs.floors ? `${specs.floors} tầng` : null;
                const location = specs.location ?? null;
                const style = specs.style ?? null;
                return (
                  <article key={proj.id} className="item-product style-view-2">
                    <Link href={`/du-an/${proj.slug}`} className="item-product-link" title={proj.title}>
                      <div className="img">
                        {proj.coverImage?.url ? (
                          <Image
                            src={proj.coverImage.url}
                            alt={proj.coverImage.alt ?? proj.title}
                            width={600}
                            height={450}
                            sizes="(max-width:575px) 100vw, (max-width:767px) 50vw, (max-width:1199px) 33vw, 25vw"
                            className="img-product"
                          />
                        ) : null}
                      </div>
                      <div className="info">
                        <h4 className="title-product">{proj.title}</h4>
                        <ul className="info-build">
                          <InfoLine label="Địa chỉ" value={location} />
                          <InfoLine label="Diện tích" value={area} />
                          <InfoLine label="Số tầng" value={floors} />
                          <InfoLine label="Phong cách" value={style} />
                        </ul>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            {moreHref ? (
              <div className="project-section-more">
                <Link href={moreHref} className="btn-more">
                  Xem tất cả &rarr;
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
