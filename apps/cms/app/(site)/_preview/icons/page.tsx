import {
  AngleDown,
  ArrowRight,
  Comments,
  Envelope,
  Facebook,
  Gift,
  Headphones,
  Instagram,
  MapMarker,
  Messenger,
  PaperPlane,
  Phone,
  Search,
  Tiktok,
  Youtube,
  Zalo,
} from '@/components/icons';
import { notFound } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const icons: Array<[string, IconComponent]> = [
  ['Phone', Phone],
  ['Search', Search],
  ['AngleDown', AngleDown],
  ['PaperPlane', PaperPlane],
  ['Gift', Gift],
  ['ArrowRight', ArrowRight],
  ['Comments', Comments],
  ['Headphones', Headphones],
  ['MapMarker', MapMarker],
  ['Envelope', Envelope],
  ['Facebook', Facebook],
  ['Youtube', Youtube],
  ['Instagram', Instagram],
  ['Tiktok', Tiktok],
  ['Zalo', Zalo],
  ['Messenger', Messenger],
];

const SIZES = [16, 24, 32] as const;

export const metadata = {
  title: 'Icon preview · dev',
  robots: { index: false, follow: false },
};

export default function IconsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .ip-title { color: #F1E075; font-size: 22px; margin: 0 0 24px; }
        .ip-section { border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .ip-section h2 { font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 18px; }
        .ip-ctx-burgundy { background: #3B0D12; border: 1px solid rgba(241,224,117,0.35); }
        .ip-ctx-burgundy h2 { color: #F1E075; }
        .ip-ctx-gold { background: linear-gradient(135deg, #F1E075 0%, #AE7F41 100%); border: 1px solid rgba(47,10,16,0.2); }
        .ip-ctx-gold h2 { color: #2F0A10; }
        .ip-ctx-transparent { background: transparent; border: 1px dashed rgba(255,255,255,0.3); }
        .ip-ctx-transparent h2 { color: rgba(255,255,255,0.8); }
        .ip-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .ip-tile { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; border-radius: 8px; }
        .ip-ctx-burgundy .ip-tile { background: rgba(255,255,255,0.03); }
        .ip-ctx-gold .ip-tile { background: rgba(255,255,255,0.12); color: #2F0A10; }
        .ip-ctx-transparent .ip-tile { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); }
        .ip-row { display: flex; gap: 14px; align-items: center; }
        .ip-name { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.8; }
      `}</style>

      <h1 className="ip-title">Icon preview · 16 icons × 3 contexts × 3 sizes</h1>

      <section className="ip-section ip-ctx-burgundy">
        <h2>Context A · burgundy (default gradient stroke)</h2>
        <div className="ip-grid">
          {icons.map(([name, Icon]) => (
            <div key={name} className="ip-tile">
              <div className="ip-row">
                {SIZES.map((sz) => (
                  <Icon key={sz} size={sz} />
                ))}
              </div>
              <span className="ip-name">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ip-section ip-ctx-gold">
        <h2>Context B · gold button (.icon-on-gold monochrome burgundy)</h2>
        <div className="ip-grid">
          {icons.map(([name, Icon]) => (
            <div key={name} className="ip-tile">
              <div className="ip-row">
                {SIZES.map((sz) => (
                  <Icon key={sz} size={sz} className="icon-on-gold" />
                ))}
              </div>
              <span className="ip-name">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ip-section ip-ctx-transparent">
        <h2>Context C · transparent (debug stroke)</h2>
        <div className="ip-grid">
          {icons.map(([name, Icon]) => (
            <div key={name} className="ip-tile">
              <div className="ip-row">
                {SIZES.map((sz) => (
                  <Icon key={sz} size={sz} />
                ))}
              </div>
              <span className="ip-name">{name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
