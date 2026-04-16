import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '../../../../src/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('thi-cong');
export const generateStaticParams = generateListingStaticParams('thi-cong');

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
    <ProjectListingPage rootSlug="thi-cong" cat={p.cat} page={Number(sp.page) || 1} />
  );
}
