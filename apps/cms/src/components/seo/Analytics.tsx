import Script from 'next/script';

const GA_SCRIPT = (id: string) => `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
`;

const GTM_SCRIPT = (id: string) => `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');
`;

const FB_PIXEL_SCRIPT = (id: string) => `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
`;

const TIKTOK_PIXEL_SCRIPT = (id: string) => `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date();
  ttq._o=ttq._o||{};ttq._o[e]=n||{};
  var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;
  var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${id}');
  ttq.page();
}(window, document, 'ttq');
`;

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const ttId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {GA_SCRIPT(gaId)}
          </Script>
        </>
      ) : null}
      {gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {GTM_SCRIPT(gtmId)}
        </Script>
      ) : null}
      {fbId ? (
        <Script id="fb-pixel" strategy="afterInteractive">
          {FB_PIXEL_SCRIPT(fbId)}
        </Script>
      ) : null}
      {ttId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {TIKTOK_PIXEL_SCRIPT(ttId)}
        </Script>
      ) : null}
    </>
  );
}
