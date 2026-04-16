import type { Metadata } from 'next';
import {
  NewsListingPage,
  generateNewsListingMetadata,
} from '../../../src/components/site/NewsListingPage';

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}): Promise<Metadata> {
  return generateNewsListingMetadata(searchParams);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const sp = await searchParams;
  return <NewsListingPage catSlug={sp.cat} page={Number(sp.page) || 1} />;
}
