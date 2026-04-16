import config from '../../src/payload.config';
import { RootLayout } from '@payloadcms/next/layouts';
import '@payloadcms/next/css';
import { importMap } from './admin/importMap';
import { serverFunction } from './actions';

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
