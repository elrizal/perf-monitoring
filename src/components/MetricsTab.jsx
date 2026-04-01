import { METRIC_META, THRESHOLDS } from '../constants.js'
import { scoreColor, scoreLabel } from '../utils.js'

export default function MetricsTab({ metrics }) {
  return (
    <div className="table-wrapper">
      <table className="metrics-table">
        <thead>
          <tr>
            {['Metric', 'Value', 'Status', 'Good', 'Needs work', 'Poor'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRIC_META.map(({ key, label, fmt, desc }) => {
            const v   = metrics[key]
            const t   = THRESHOLDS[key]
            const col = scoreColor(key, v)
            const lbl = scoreLabel(key, v)
            const unit = key === 'cls' ? '' : 'ms'
            return (
              <tr key={key}>
                <td>
                  <span className="metric-name">{label}</span>
                  <span className="metric-desc">{desc}</span>
                </td>
                <td style={{ color: col, fontWeight: 500 }}>{fmt(v)}</td>
                <td>
                  <span className="status-pill" style={{ background: col + '22', color: col }}>{lbl}</span>
                </td>
                <td className="threshold good">{t ? `≤ ${t.good}${unit}` : '—'}</td>
                <td className="threshold warn">{t ? `≤ ${t.poor}${unit}` : '—'}</td>
                <td className="threshold poor">{t ? `> ${t.poor}${unit}` : '—'}</td>
              </tr>
            )
          })}

          <tr>
            <td>
              <span className="metric-name">Page size</span>
              <span className="metric-desc">Total transfer size</span>
            </td>
            <td style={{ color: metrics.pageSize > 5 ? '#A32D2D' : metrics.pageSize > 3 ? '#BA7517' : '#639922', fontWeight: 500 }}>
              {metrics.pageSize}MB
            </td>
            <td colSpan={4} className="threshold-note">Target: &lt;3MB</td>
          </tr>

          <tr>
            <td>
              <span className="metric-name">Requests</span>
              <span className="metric-desc">Total HTTP requests</span>
            </td>
            <td style={{ color: metrics.requests > 100 ? '#A32D2D' : metrics.requests > 75 ? '#BA7517' : '#639922', fontWeight: 500 }}>
              {metrics.requests}
            </td>
            <td colSpan={4} className="threshold-note">Target: &lt;50</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}