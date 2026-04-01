import { METRIC_META } from '../constants.js'
import { scoreColor, scoreLabel, computeLoss, DOLLAR } from '../utils.js'

export default function FixesTab({
  activeFixes,
  checked,
  toggleCheck,
  clearChecked,
  metrics,
}) {
  const checkedFixes = activeFixes.filter(f => checked[f.id])
  const currentLoss  = computeLoss(metrics.lcp)

  const totalLcpRecovered    = checkedFixes.reduce((s, f) => s + f.lcpDelta, 0)
  const totalBounceRecovered = checkedFixes.reduce((s, f) => s + f.bounceDelta, 0)
  const repairedLcp          = Math.max(0, metrics.lcp - totalLcpRecovered)
  const repairedBouncePct    = Math.max(0, currentLoss.bouncePct - totalBounceRecovered)
  const repairedLoss         = computeLoss(repairedLcp, Math.max(0, repairedBouncePct - computeLoss(repairedLcp).bouncePct))

  const recoveredMonthly = Math.max(0, currentLoss.revenueMonth - repairedLoss.revenueMonth)
  const recoveredDaily   = Math.max(0, currentLoss.revenueDay   - repairedLoss.revenueDay)

  function getFixRevenue(fix) {
    const idx          = checkedFixes.findIndex(f => f.id === fix.id)
    const prevChecked  = checkedFixes.slice(0, idx)
    const prevLcp      = Math.max(0, metrics.lcp - prevChecked.reduce((s, f) => s + f.lcpDelta, 0))
    const prevBounce   = prevChecked.reduce((s, f) => s + f.bounceDelta, 0)
    const afterLcp     = Math.max(0, prevLcp - fix.lcpDelta)
    const afterBounce  = prevBounce + fix.bounceDelta
    const before       = computeLoss(prevLcp,  Math.max(0, currentLoss.bouncePct - prevBounce  - computeLoss(prevLcp).bouncePct))
    const after        = computeLoss(afterLcp, Math.max(0, currentLoss.bouncePct - afterBounce - computeLoss(afterLcp).bouncePct))
    return Math.max(0, before.revenueMonth - after.revenueMonth)
  }

  const fixesByMetric = METRIC_META
    .map(m => ({ ...m, fixes: activeFixes.filter(f => f.metricKey === m.key) }))
    .filter(m => m.fixes.length > 0)

  if (activeFixes.length === 0) {
    return (
      <div className="empty-state">
        No degradations detected yet. Increase the load slider to trigger performance events.
      </div>
    )
  }

  return (
    <>
      {/* Savings ticker */}
      <div className="ticker" style={{ borderColor: recoveredMonthly > 0 ? '#639922' : 'var(--color-border-tertiary)' }}>
        <div>
          <div className="ticker__label">Estimated cost eliminated by checked fixes</div>
          <div className="ticker__values">
            <div>
              <span className="ticker__primary" style={{ color: recoveredMonthly > 0 ? '#3B6D11' : 'var(--color-text-primary)' }}>
                {DOLLAR(recoveredMonthly)}
              </span>
              <span className="ticker__unit">/mo</span>
            </div>
            <div>
              <span className="ticker__secondary" style={{ color: recoveredMonthly > 0 ? '#3B6D11' : 'var(--color-text-secondary)' }}>
                {DOLLAR(recoveredDaily)}
              </span>
              <span className="ticker__unit">/day</span>
            </div>
          </div>
        </div>
        <div className="ticker__meta">
          <div>{checkedFixes.length} of {activeFixes.length} fixes applied</div>
          <div>LCP improved by <strong>{totalLcpRecovered}ms</strong></div>
          {checkedFixes.length > 0 && (
            <button onClick={clearChecked}>Clear all</button>
          )}
        </div>
      </div>

      {/* Fix groups */}
      {fixesByMetric.map(({ key, label, desc, fixes: mFixes }) => {
        const col               = scoreColor(key, metrics[key])
        const metricChecked     = mFixes.filter(f => checked[f.id]).length
        const metricRecovered   = mFixes.reduce((s, f) => s + (checked[f.id] ? getFixRevenue(f) : 0), 0)

        return (
          <div key={key} className="fix-group">
            <div className="fix-group__header">
              <span className="fix-group__dot" style={{ background: col }} />
              <span className="fix-group__title">{label} — {desc}</span>
              <span className="fix-group__status" style={{ color: col }}>{scoreLabel(key, metrics[key])}</span>
              <div className="fix-group__summary">
                {metricChecked > 0 && (
                  <span className="fix-group__recovered">+{DOLLAR(metricRecovered)}/mo eliminated</span>
                )}
                <span className="fix-group__count">{metricChecked}/{mFixes.length} done</span>
              </div>
            </div>

            {mFixes.map((fix, i) => {
              const isChecked      = !!checked[fix.id]
              const marginal       = getFixRevenue(fix)
              const hasImpact      = fix.lcpDelta > 0 || fix.bounceDelta > 0
              const isLast         = i === mFixes.length - 1

              return (
                <div
                  key={fix.id}
                  className={`fix-row${isChecked ? ' fix-row--checked' : ''}${isLast ? ' fix-row--last' : ''}`}
                  onClick={() => toggleCheck(fix.id)}
                >
                  <div className={`fix-row__checkbox${isChecked ? ' fix-row__checkbox--checked' : ''}`}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5"
                          fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="fix-row__body">
                    <div className={`fix-row__text${isChecked ? ' fix-row__text--done' : ''}`}>
                      {fix.text}
                    </div>
                    <div className="fix-row__badges">
                      {fix.lcpDelta > 0 && (
                        <span className="badge badge--blue">LCP -{fix.lcpDelta}ms</span>
                      )}
                      {fix.bounceDelta > 0 && (
                        <span className="badge badge--green">Bounce -{(fix.bounceDelta * 100).toFixed(1)}pp</span>
                      )}
                    </div>
                  </div>

                  <div className="fix-row__revenue">
                    {hasImpact ? (
                      <>
                        <div className="fix-row__rev-primary" style={{ color: isChecked ? '#27500A' : '#3B6D11' }}>
                          {isChecked ? '✓ ' : ''}{DOLLAR(marginal)}/mo
                        </div>
                        <div className="fix-row__rev-secondary">{DOLLAR(marginal / 30)}/day</div>
                      </>
                    ) : (
                      <div className="fix-row__rev-ux">UX / stability</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}