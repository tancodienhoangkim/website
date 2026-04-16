import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '../../../../src/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('tru-so-khach-san');
export const generateStaticParams = generateListingStaticParams('tru-so-khach-san');

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ cat?: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const p = await params;
  const sp = await searchParams;
  return (
    <ProjectListingPage
      rootSlug="tru-so-khach-san"
      cat={p.cat}
      page={Number(sp.page) || 1}
    />
  );
}
