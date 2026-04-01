import {
  BASELINE,
  THRESHOLDS,
  HOURLY_VISITORS,
  CVR,
  AOV,
  BOUNCE_PENALTY_PER_SEC,
} from './constants.js'

export const NUM    = n => Number(n).toLocaleString()
export const DOLLAR = n => `$${Math.round(n).toLocaleString()}`

export function scoreColor(metric, value) {
  const t = THRESHOLDS[metric]
  if (!t) return '#639922'
  if (value <= t.good) return '#639922'
  if (value <= t.poor) return '#BA7517'
  return '#A32D2D'
}

export function scoreLabel(metric, value) {
  const t = THRESHOLDS[metric]
  if (!t) return 'Good'
  if (value <= t.good) return 'Good'
  if (value <= t.poor) return 'Needs work'
  return 'Poor'
}

export function computeLoss(lcp, extraBouncePct = 0) {
  const extraSec    = Math.max(0, (lcp - BASELINE.lcp) / 1000)
  const totalBounce = Math.min(0.85, extraSec * BOUNCE_PENALTY_PER_SEC + extraBouncePct)
  const lostPerHour = HOURLY_VISITORS * totalBounce
  return {
    bouncePct:    totalBounce,
    lostVisHour:  Math.round(lostPerHour),
    revenueHour:  lostPerHour * CVR * AOV,
    revenueDay:   lostPerHour * 24 * CVR * AOV,
    revenueMonth: lostPerHour * 24 * 30 * CVR * AOV,
  }
}

function jitter(base, pct = 0.12) {
  return base * (1 + (Math.random() - 0.5) * 2 * pct)
}

export function genMetrics(stress = 0) {
  const s = 1 + stress * 2.5
  return {
    ttfb:     Math.round(jitter(BASELINE.ttfb * s, 0.10)),
    fcp:      Math.round(jitter(BASELINE.fcp  * s, 0.10)),
    lcp:      Math.round(jitter(BASELINE.lcp  * s, 0.10)),
    tbt:      Math.round(jitter(BASELINE.tbt  * s, 0.15)),
    cls:      parseFloat(jitter(BASELINE.cls  * (1 + stress * 1.5), 0.2).toFixed(3)),
    tti:      Math.round(jitter(BASELINE.tti  * s, 0.10)),
    fid:      Math.round(jitter(BASELINE.fid  * s, 0.10)),
    pageSize: parseFloat(jitter(BASELINE.pageSize * (1 + stress * 0.5), 0.08).toFixed(2)),
    requests: Math.round(jitter(BASELINE.requests * (1 + stress * 0.3), 0.10)),
  }
}

export function buildSparkPath(history, key) {
  if (history.length < 2) return ''
  const vals = history.map(h => h[key])
  const mn   = Math.min(...vals) * 0.9
  const mx   = Math.max(...vals) * 1.1 || mn + 1
  return vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * 80
    const y = 28 - ((v - mn) / (mx - mn)) * 28
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}