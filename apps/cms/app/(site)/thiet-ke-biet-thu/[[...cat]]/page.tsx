import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '../../../../src/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('biet-thu');
export const generateStaticParams = generateListingStaticParams('biet-thu');

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ cat?: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const p = await params;
  const sp = await searchParams;
  return <ProjectListingPage rootSlug="biet-thu" cat={p.cat} page={Number(sp.page) || 1} />;
}
