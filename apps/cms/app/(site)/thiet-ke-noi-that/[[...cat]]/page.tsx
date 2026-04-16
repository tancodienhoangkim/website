import {
  ProjectListingPage,
  generateListingMetadata,
  generateListingStaticParams,
} from '../../../../src/components/site/ProjectListingPage';

export const revalidate = 3600;

export const generateMetadata = generateListingMetadata('noi-that');
export const generateStaticParams = generateListingStaticParams('noi-that');

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
    <ProjectListingPage rootSlug="noi-that" cat={p.cat} page={Number(sp.page) || 1} />
  );
}
