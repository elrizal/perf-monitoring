import { useState, useEffect, useRef, useCallback } from 'react'
import { METRIC_META, FIXES } from './constants.js'
import { genMetrics, computeLoss, scoreLabel, NUM } from './utils.js'
import DashboardTab from './components/DashboardTab.jsx'
import MetricsTab   from './components/MetricsTab.jsx'
import FixesTab     from './components/FixesTab.jsx'
import ImpactTab    from './components/ImpactTab.jsx'

const TABS = ['dashboard', 'metrics', 'fixes', 'impact']

export default function App() {
  const [stress,      setStress]      = useState(0)
  const [metrics,     setMetrics]     = useState(() => genMetrics(0))
  const [history,     setHistory]     = useState([])
  const [activeFixes, setActiveFixes] = useState([])
  const [checked,     setChecked]     = useState({})
  const [isLive,      setIsLive]      = useState(true)
  const [tab,         setTab]         = useState('dashboard')

  const prevMetrics = useRef(metrics)
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    const next = genMetrics(stress)
    const prev = prevMetrics.current

    const newlyDegraded = []
    METRIC_META.forEach(({ key }) => {
      const pl = scoreLabel(key, prev[key])
      const nl = scoreLabel(key, next[key])
      if ((pl === 'Good' && nl !== 'Good') || (pl === 'Needs work' && nl === 'Poor')) {
        newlyDegraded.push(key)
      }
    })

    if (newlyDegraded.length > 0) {
      setActiveFixes(prev => {
        const existingKeys = new Set(prev.map(f => f.metricKey))
        const toAdd = newlyDegraded
          .filter(k => !existingKeys.has(k))
          .flatMap(k =>
            (FIXES[k] || []).map((f, i) => ({
              id: `${k}-${i}`,
              metricKey: k,
              fixIdx: i,
              ...f,
            }))
          )
        return [...prev, ...toAdd]
      })
    }

    setMetrics(next)
    setHistory(h => [...h.slice(-59), { ...next }])
    prevMetrics.current = next
  }, [stress])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(tick, 2000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isLive, tick])

  const toggleCheck = id  => setChecked(c => ({ ...c, [id]: !c[id] }))
  const clearChecked      = ()  => setChecked({})

  const currentLoss   = computeLoss(metrics.lcp)
  const fixCount      = activeFixes.length

  const stressLabel =
    stress < 0.01 ? 'Baseline' :
    stress < 0.30 ? 'Low' :
    stress < 0.60 ? 'Medium' :
    stress < 0.85 ? 'High' : 'Critical'

  const stressColor =
    stress > 0.6 ? '#A32D2D' : stress > 0.3 ? '#BA7517' : '#639922'

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div>
          <h1 className="app__title">ShipStation.com — Performance Monitor</h1>
          <p className="app__subtitle">
            shipstation.com/&nbsp;·&nbsp;{NUM(339000)} visitors/mo&nbsp;·&nbsp;4.2% CVR
          </p>
        </div>
        <div className="app__live">
          <span className="live-dot" style={{ animationPlayState: isLive ? 'running' : 'paused', background: isLive ? '#639922' : '#888' }} />
          <span className="app__live-label">{isLive ? 'Live' : 'Paused'}</span>
          <button onClick={() => setIsLive(l => !l)}>{isLive ? 'Pause' : 'Resume'}</button>
        </div>
      </header>

      {/* Stress slider */}
      <div className="stress-bar">
        <span className="stress-bar__label">Simulated load</span>
        <input
          type="range" min="0" max="1" step="0.01"
          value={stress}
          onChange={e => setStress(parseFloat(e.target.value))}
          className="stress-bar__slider"
        />
        <span className="stress-bar__value" style={{ color: stressColor }}>{stressLabel}</span>
      </div>

      {/* Tabs */}
      <nav className="tabs">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tabs__btn${tab === t ? ' tabs__btn--active' : ''}`}
          >
            {t}{t === 'fixes' && fixCount > 0 ? ` (${fixCount})` : ''}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="app__content">
        {tab === 'dashboard' && (
          <DashboardTab metrics={metrics} history={history} currentLoss={currentLoss} />
        )}
        {tab === 'metrics' && (
          <MetricsTab metrics={metrics} />
        )}
        {tab === 'fixes' && (
          <FixesTab
            activeFixes={activeFixes}
            checked={checked}
            toggleCheck={toggleCheck}
            clearChecked={clearChecked}
            metrics={metrics}
          />
        )}
        {tab === 'impact' && (
          <ImpactTab metrics={metrics} activeFixes={activeFixes} checked={checked} />
        )}
      </main>
    </div>
  )
}