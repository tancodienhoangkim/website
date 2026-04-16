import Image from 'next/image';
import Link from 'next/link';
import type { ProjectSectionItem } from './ProjectSection';

function InfoLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <li>
      <span className="label">{label}:</span> <strong>{value}</strong>
    </li>
  );
}

export function ProjectCardGrid({ items }: { items: ProjectSectionItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="product-grid block-project-section">
      {items.map((proj) => {
        const specs = proj.specs ?? {};
        const area = specs.area ? `${specs.area}m²` : null;
        const floors = specs.floors ? `${specs.floors} tầng` : null;
        const location = specs.location ?? null;
        const style = specs.style ?? null;
        return (
          <article key={proj.id} className="item-product style-view-2">
            <Link
              href={`/du-an/${proj.slug}`}
              className="item-product-link"
              title={proj.title}
            >
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
  );
}

export function RelatedProjects({ items }: { items: ProjectSectionItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="related-projects">
      <h2>Dự án tương tự</h2>
      <ProjectCardGrid items={items.slice(0, 3)} />
    </section>
  );
}
