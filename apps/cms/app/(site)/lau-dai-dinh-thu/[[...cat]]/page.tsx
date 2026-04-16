import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '../../../../src/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('lau-dai-dinh-thu');
export const generateStaticParams = generateListingStaticParams('lau-dai-dinh-thu');

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
      rootSlug="lau-dai-dinh-thu"
      cat={p.cat}
      page={Number(sp.page) || 1}
    />
  );
}
