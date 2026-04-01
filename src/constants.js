export const MONTHLY_VISITORS = 339000
export const CVR = 0.042
export const AOV = 49
export const DAILY_VISITORS = Math.round(MONTHLY_VISITORS / 30)
export const HOURLY_VISITORS = Math.round(DAILY_VISITORS / 24)
export const BOUNCE_PENALTY_PER_SEC = 0.32

export const BASELINE = {
  ttfb: 320,
  fcp: 1400,
  lcp: 2800,
  tbt: 180,
  cls: 0.08,
  tti: 3200,
  fid: 85,
  pageSize: 3.2,
  requests: 68,
}

export const THRESHOLDS = {
  ttfb: { good: 800,  poor: 1800 },
  fcp:  { good: 1800, poor: 3000 },
  lcp:  { good: 2500, poor: 4000 },
  tbt:  { good: 200,  poor: 600  },
  cls:  { good: 0.1,  poor: 0.25 },
  tti:  { good: 3800, poor: 7300 },
  fid:  { good: 100,  poor: 300  },
}

export const METRIC_META = [
  { key: 'ttfb', label: 'TTFB', fmt: v => `${v}ms`,                  desc: 'Time to First Byte' },
  { key: 'fcp',  label: 'FCP',  fmt: v => `${(v/1000).toFixed(2)}s`, desc: 'First Contentful Paint' },
  { key: 'lcp',  label: 'LCP',  fmt: v => `${(v/1000).toFixed(2)}s`, desc: 'Largest Contentful Paint' },
  { key: 'tbt',  label: 'TBT',  fmt: v => `${v}ms`,                  desc: 'Total Blocking Time' },
  { key: 'cls',  label: 'CLS',  fmt: v => v.toFixed(3),              desc: 'Cumulative Layout Shift' },
  { key: 'tti',  label: 'TTI',  fmt: v => `${(v/1000).toFixed(2)}s`, desc: 'Time to Interactive' },
  { key: 'fid',  label: 'FID',  fmt: v => `${v}ms`,                  desc: 'First Input Delay' },
]

export const FIXES = {
  ttfb: [
    { text: 'Enable HTTP/3 and QUIC on your origin server',                                    lcpDelta: 120, bounceDelta: 0.020 },
    { text: 'Add a CDN edge node closer to target regions (Cloudflare/Fastly)',                lcpDelta: 200, bounceDelta: 0.040 },
    { text: 'Implement server-side caching with Redis or Varnish for repeat requests',         lcpDelta: 150, bounceDelta: 0.030 },
    { text: 'Use origin shield to reduce cache misses to origin',                              lcpDelta: 80,  bounceDelta: 0.015 },
    { text: 'Audit TTFB with server-timing headers — isolate DB vs app latency',              lcpDelta: 60,  bounceDelta: 0.010 },
  ],
  fcp: [
    { text: 'Inline critical CSS for above-the-fold content (< 14KB)',                        lcpDelta: 180, bounceDelta: 0.030 },
    { text: 'Preload hero fonts with <link rel="preload"> and font-display: swap',             lcpDelta: 100, bounceDelta: 0.020 },
    { text: 'Defer or async non-critical JS that blocks paint',                                lcpDelta: 220, bounceDelta: 0.040 },
    { text: 'Preconnect to third-party origins (analytics, chat widgets)',                     lcpDelta: 90,  bounceDelta: 0.015 },
    { text: 'Serve HTML document from edge cache (SSR + CDN)',                                 lcpDelta: 160, bounceDelta: 0.030 },
  ],
  lcp: [
    { text: 'Preload the hero image with high fetchpriority attribute',                        lcpDelta: 350, bounceDelta: 0.070 },
    { text: 'Convert hero images to AVIF/WebP with proper srcset',                            lcpDelta: 280, bounceDelta: 0.055 },
    { text: 'Remove render-blocking resources before the LCP element',                         lcpDelta: 400, bounceDelta: 0.080 },
    { text: 'Remove loading="lazy" from hero — LCP images must not be lazy-loaded',           lcpDelta: 300, bounceDelta: 0.060 },
    { text: 'Set explicit width/height on images to prevent layout shifts delaying paint',     lcpDelta: 120, bounceDelta: 0.025 },
  ],
  tbt: [
    { text: 'Code-split JavaScript bundles — load only what is needed on page load',          lcpDelta: 0,   bounceDelta: 0.040 },
    { text: 'Move non-critical scripts to Web Workers or defer with requestIdleCallback',     lcpDelta: 0,   bounceDelta: 0.030 },
    { text: 'Audit third-party scripts (chat, analytics) — often 60%+ of TBT',               lcpDelta: 0,   bounceDelta: 0.050 },
    { text: 'Remove unused polyfills and legacy browser bundles',                              lcpDelta: 0,   bounceDelta: 0.020 },
    { text: 'Use Partytown to run third-party scripts off the main thread',                    lcpDelta: 0,   bounceDelta: 0.035 },
  ],
  cls: [
    { text: 'Set explicit width/height on all images and video embeds',                        lcpDelta: 0,   bounceDelta: 0.020 },
    { text: 'Reserve space for dynamic ad slots and embeds with CSS aspect-ratio',            lcpDelta: 0,   bounceDelta: 0.015 },
    { text: 'Avoid inserting DOM elements above existing content after load',                  lcpDelta: 0,   bounceDelta: 0.020 },
    { text: 'Preload fonts to prevent FOUT causing layout shifts',                             lcpDelta: 0,   bounceDelta: 0.010 },
    { text: 'Only animate transform/opacity — compositor-safe properties only',               lcpDelta: 0,   bounceDelta: 0.010 },
  ],
  tti: [
    { text: 'Reduce JavaScript payload — audit with webpack-bundle-analyzer',                  lcpDelta: 100, bounceDelta: 0.030 },
    { text: 'Implement route-based code splitting (React.lazy + Suspense)',                    lcpDelta: 120, bounceDelta: 0.025 },
    { text: 'Remove duplicate dependencies across bundles',                                    lcpDelta: 80,  bounceDelta: 0.020 },
    { text: 'Defer hydration of below-fold components (partial hydration)',                   lcpDelta: 90,  bounceDelta: 0.020 },
    { text: 'Use speculation rules API for instant navigation to likely next pages',          lcpDelta: 0,   bounceDelta: 0.015 },
  ],
  fid: [
    { text: 'Break up long tasks into smaller chunks with scheduler.yield()',                  lcpDelta: 0,   bounceDelta: 0.020 },
    { text: 'Move event handlers outside render-blocking code paths',                          lcpDelta: 0,   bounceDelta: 0.015 },
    { text: 'Use passive event listeners for scroll and touch events',                         lcpDelta: 0,   bounceDelta: 0.010 },
    { text: 'Reduce main thread work from analytics and tag managers',                         lcpDelta: 0,   bounceDelta: 0.025 },
    { text: 'Implement INP monitoring to catch slow interaction handlers',                     lcpDelta: 0,   bounceDelta: 0.015 },
  ],
}