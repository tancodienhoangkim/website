import type { Metadata } from 'next';
import {
  ServicesListingPage,
  generateServicesListingMetadata,
} from '../../../src/components/site/ServicesListingPage';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generateServicesListingMetadata();
}

export default async function Page() {
  return <ServicesListingPage />;
}
