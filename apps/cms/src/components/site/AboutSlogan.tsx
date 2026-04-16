import type { ReactNode } from 'react';

export type AboutSnippet = {
  heading?: string;
  body?: unknown;
  image?: { url: string; alt?: string } | null;
  ctaLabel?: string;
  ctaUrl?: string;
};

function extractLexicalText(root: any): string {
  if (!root?.root?.children) return '';
  const walk = (n: any): string =>
    n.type === 'text' ? n.text : (n.children ?? []).map(walk).join(' ');
  return root.root.children.map(walk).join('\n\n');
}

export function AboutSlogan({ data }: { data?: AboutSnippet }): ReactNode {
  if (!data || (!data.heading && !data.body)) return null;
  const text = extractLexicalText(data.body);
  return (
    <div id="content-row-87" className="nh-row py-30">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-xs-12">
            <div className="section-architecture-hoangkim-tcd">
              <div className="section-title-center section-title-slogan">
                <h2 className="title-slogan-center">TÂN CỔ ĐIỂN HOÀNG KIM</h2>
                {data.heading && <p className="slogan">{data.heading}</p>}
              </div>
              {text && <div className="content-architecture">{text}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
