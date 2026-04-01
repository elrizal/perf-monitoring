import { MONTHLY_VISITORS, CVR, AOV, BASELINE, BOUNCE_PENALTY_PER_SEC } from '../constants.js'
import { computeLoss, DOLLAR, NUM } from '../utils.js'

export default function ImpactTab({ metrics, activeFixes, checked }) {
  const checkedFixes         = activeFixes.filter(f => checked[f.id])
  const currentLoss          = computeLoss(metrics.lcp)
  const totalLcpRecovered    = checkedFixes.reduce((s, f) => s + f.lcpDelta, 0)
  const totalBounceRecovered = checkedFixes.reduce((s, f) => s + f.bounceDelta, 0)
  const repairedLcp          = Math.max(0, metrics.lcp - totalLcpRecovered)
  const repairedBouncePct    = Math.max(0, currentLoss.bouncePct - totalBounceRecovered)
  const repairedLoss         = computeLoss(repairedLcp, Math.max(0, repairedBouncePct - computeLoss(repairedLcp).bouncePct))
  const recoveredMonthly     = Math.max(0, currentLoss.revenueMonth - repairedLoss.revenueMonth)

  return (
    <div>
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Perf cost / hour',  value: DOLLAR(currentLoss.revenueHour) },
          { label: 'Perf cost / day',   value: DOLLAR(currentLoss.revenueDay) },
          { label: 'Perf cost / month', value: DOLLAR(currentLoss.revenueMonth) },
          { label: 'Added bounce rate', value: `+${(currentLoss.bouncePct * 100).toFixed(1)}%` },
          { label: 'Lost visitors / hr',value: NUM(currentLoss.lostVisHour) },
          { label: 'Fixes applied',     value: `${checkedFixes.length} / ${activeFixes.length}` },
        ].map(c => (
          <div key={c.label} className="metric-card">
            <div className="metric-card__label">{c.label}</div>
            <div className="metric-card__value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <div className="disclaimer__title">Disclaimer — what these estimates represent</div>
        <p>
          These cost figures model only the effect of <strong>page load performance degradation</strong> on
          visitor bounce rate. They do not account for marketing spend, ad campaigns, conversion
          copywriting, design quality, checkout UX, or functional bugs (e.g. broken forms, failed
          payments). Those factors are outside the scope of this tool.
        </p>
        <p>
          A performance engineer or front-end developer should be the primary audience for these
          numbers. They should not be used to benchmark marketing or product teams.
        </p>
      </div>

      {/* Formula */}
      <div className="card">
        <div className="card__title">Formula &amp; model assumptions</div>
        <pre className="formula">
{`extra_seconds = max(0, current_LCP − baseline_LCP) ÷ 1000
added_bounce  = extra_seconds × ${BOUNCE_PENALTY_PER_SEC}
lost_visitors = hourly_visitors × added_bounce
perf_cost/hr  = lost_visitors × CVR × avg_plan_value`}
        </pre>
        <p className="card__note">
          The {BOUNCE_PENALTY_PER_SEC * 100}% multiplier comes from Google's research showing each
          additional second of load time increases bounce probability by approximately 32%. This is
          applied to LCP as the primary load signal since it most closely correlates with perceived
          page readiness.
        </p>
        <p className="card__note">
          Bounce penalties from TBT and CLS degradations are additive estimates based on UX friction
          research and are less empirically grounded than the LCP figure. All estimates are
          directional — real-world impact depends on traffic composition, device mix, and geographic
          distribution.
        </p>
      </div>

      {/* Assumptions table */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card__title">Input assumptions</div>
        {[
          ['Monthly visitors',       NUM(MONTHLY_VISITORS)],
          ['Conversion rate',        `${(CVR * 100).toFixed(1)}%`],
          ['Avg plan value',         `$${AOV}/mo`],
          ['Bounce penalty',         `+${BOUNCE_PENALTY_PER_SEC * 100}% / extra second (LCP-based)`],
          ['Baseline LCP',           `${(BASELINE.lcp / 1000).toFixed(2)}s`],
          ['Current LCP',            `${(metrics.lcp / 1000).toFixed(2)}s`],
          ['LCP recovered by fixes', `${totalLcpRecovered}ms`],
          ['Est. cost eliminated/mo',DOLLAR(recoveredMonthly)],
        ].map(([k, v]) => (
          <div key={k} className="assumption-row">
            <span className="assumption-row__key">{k}</span>
            <span className="assumption-row__val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}