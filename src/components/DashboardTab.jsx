import { METRIC_META } from '../constants.js'
import { scoreColor, buildSparkPath, DOLLAR, NUM } from '../utils.js'

export default function DashboardTab({ metrics, history, currentLoss }) {
  const overallScore = (() => {
    let s = 0
    METRIC_META.forEach(({ key }) => {
      const col = scoreColor(key, metrics[key])
      s += col === '#639922' ? 100 : col === '#BA7517' ? 60 : 20
    })
    return Math.round(s / METRIC_META.length)
  })()

  const scoreCol = overallScore >= 90 ? '#639922' : overallScore >= 60 ? '#BA7517' : '#A32D2D'

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: 'Perf score',       value: `${overallScore}/100`,              color: scoreCol },
          { label: 'Visitors lost/hr', value: NUM(currentLoss.lostVisHour),       color: currentLoss.lostVisHour > 50 ? '#A32D2D' : '#BA7517' },
          { label: 'Perf cost/day',    value: DOLLAR(currentLoss.revenueDay),     color: currentLoss.revenueDay > 500 ? '#A32D2D' : '#BA7517' },
          { label: 'Perf cost/mo',     value: DOLLAR(currentLoss.revenueMonth),   color: currentLoss.revenueMonth > 10000 ? '#A32D2D' : '#BA7517' },
        ].map(c => (
          <div key={c.label} className="metric-card">
            <div className="metric-card__label">{c.label}</div>
            <div className="metric-card__value" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="spark-grid">
        {METRIC_META.map(({ key, label, fmt, desc }) => {
          const v   = metrics[key]
          const col = scoreColor(key, v)
          const sp  = buildSparkPath(history, key)
          return (
            <div key={key} className="spark-card" style={{ borderColor: col + '44' }}>
              <div className="spark-card__label">{label}</div>
              <div className="spark-card__value" style={{ color: col }}>{fmt(v)}</div>
              <div className="spark-card__desc">{desc}</div>
              {history.length > 2 && (
                <svg width="80" height="28" viewBox="0 0 80 28">
                  <path d={sp} fill="none" stroke={col} strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}