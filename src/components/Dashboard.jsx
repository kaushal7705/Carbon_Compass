import { useState } from 'react';
import { AlertTriangle, ChevronRight, RefreshCw, Sparkles, Award, Calendar, Trophy, FileText } from 'lucide-react';
import { getScoreLevel, calculateFootprint, calculateLevel, EMISSION_FACTORS, getScoredRecommendations } from '../utils/carbonCalculations';
import ExplainabilityModal from './ExplainabilityModal';

export default function Dashboard({ 
  habits, 
  missions = [], 
  completedMissions = [], 
  leaderboardData = [], 
  streak = 5, 
  xp = 0, 
  profile = { name: 'Tanya Sen', avatar: '🦊' }, 
  onRetake, 
  onNavigate,
  onDownloadReport
}) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainMode, setExplainMode] = useState('score');
  const [whyActionOpen, setWhyActionOpen] = useState(false);

  const handleOpenExplainability = (mode) => {
    setExplainMode(mode);
    setExplainOpen(true);
  };

  const result = calculateFootprint(habits);
  const scoreLevel = getScoreLevel(result.score);
  const levelInfo = calculateLevel(xp);
  
  // Scored recommendations from engine
  const recommendations = getScoredRecommendations(habits);
  const topRec = recommendations[0];
  
  // Format total in Metric Tons
  const tonsYearly = (result.total / 1000).toFixed(1);
  const kgMonthly = Math.round(result.total / 12);
  


  // Breakdown percentages
  const total = result.total || 1;
  const transportPct = Math.round((result.transportation / total) * 100);
  const foodPct = Math.round((result.food / total) * 100);
  const energyPct = Math.round((result.energy / total) * 100);
  const shoppingPct = Math.round((result.shopping / total) * 100);

  // Breakdown array for rendering progress bars
  const categories = [
    { id: 'transportation', label: 'Transportation', value: result.transportation, pct: transportPct, color: 'var(--secondary)', icon: '🚗' },
    { id: 'food', label: 'Diet & Food', value: result.food, pct: foodPct, color: 'var(--primary)', icon: '🥗' },
    { id: 'energy', label: 'Home Energy', value: result.energy, pct: energyPct, color: 'var(--accent)', icon: '⚡' },
    { id: 'shopping', label: 'Shopping', value: result.shopping, pct: shoppingPct, color: '#ec4899', icon: '🛍️' },
    { id: 'waste', label: 'Waste', value: result.waste, pct: Math.round((result.waste / total) * 100), color: '#8b5cf6', icon: '♻️' }
  ];

  // Find top emission category
  const sortedCategories = [...categories].sort((a, b) => b.value - a.value);
  const primaryCategory = sortedCategories[0];


  // SVG Progress Ring Parameters
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.score / 100) * circumference;

  // Bottom section data slices
  const activeQuestsSlice = missions.filter(m => !m.completed).slice(0, 2);
  const completedQuestsSlice = completedMissions.slice(0, 2);
  const leaderboardPreviewSlice = leaderboardData.slice(0, 3);

  // Dynamic projection details
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const startScore = result.score;
  const targetScore = 95;

  const projectionPoints = [
    { month: 'Month 1', x: 0, score: startScore, co2: tonsYearly, type: 'Target Path' },
    { month: 'Month 3', x: 100, score: Math.round(startScore + (targetScore - startScore) * 0.3), co2: (tonsYearly * 0.9).toFixed(1), type: 'Target Path' },
    { month: 'Month 6', x: 200, score: Math.round(startScore + (targetScore - startScore) * 0.6), co2: (tonsYearly * 0.8).toFixed(1), type: 'Target Path' },
    { month: 'Month 9', x: 300, score: Math.round(startScore + (targetScore - startScore) * 0.85), co2: (tonsYearly * 0.7).toFixed(1), type: 'Target Path' },
    { month: 'Month 12', x: 400, score: targetScore, co2: (tonsYearly * 0.55).toFixed(1), type: 'Target Path' }
  ];

  const baselinePoints = [
    { month: 'Month 1', x: 0, score: startScore, co2: tonsYearly, type: 'Baseline Path' },
    { month: 'Month 3', x: 100, score: Math.max(10, startScore - 1), co2: (tonsYearly * 1.01).toFixed(1), type: 'Baseline Path' },
    { month: 'Month 6', x: 200, score: Math.max(10, startScore - 2), co2: (tonsYearly * 1.02).toFixed(1), type: 'Baseline Path' },
    { month: 'Month 9', x: 300, score: Math.max(10, startScore - 2), co2: (tonsYearly * 1.02).toFixed(1), type: 'Baseline Path' },
    { month: 'Month 12', x: 400, score: Math.max(10, startScore - 3), co2: (tonsYearly * 1.03).toFixed(1), type: 'Baseline Path' }
  ];

  // Active categories from active quests to render offsets
  const activeCategories = missions.filter(m => !m.completed).map(m => m.category);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* 1. TOP HEADER WITH RECALCULATE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Climate Dashboard</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome to your professional sustainability hub.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onDownloadReport && (
            <button 
              onClick={onDownloadReport}
              className="btn btn-secondary" 
              style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', border: '1px solid var(--border)', alignItems: 'center', fontWeight: 700 }}
            >
              <FileText size={14} /> Download Report
            </button>
          )}
          <button 
            onClick={onRetake}
            className="btn-icon" 
            title="Reset assessment"
            style={{ display: 'flex', gap: '4px', fontSize: '0.8rem', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', border: '1px solid var(--border)' }}
          >
            <RefreshCw size={14} /> Recalculate Profile
          </button>
        </div>
      </div>

      {/* 2. TOP SECTION: 3-Column Desktop Grid */}
      <div className="dashboard-grid-top">
        
        {/* welcome section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.75rem' }}>{profile.avatar}</span>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Welcome, {profile.name}!</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Level {levelInfo.level} Companion</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Your Climate Companion is running diagnostic routines. Keep completing quests to reach Level {levelInfo.level + 1}!
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔥 {streak} Days
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Streak</span>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
            <div style={{ flex: 1, paddingLeft: '8px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚡ {xp} XP
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accumulated</span>
            </div>
          </div>
        </div>

        {/* Carbon Score ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', textAlign: 'center', minHeight: '220px' }}>
          <div className="score-circle-container" style={{ margin: '0 auto 8px auto', width: '130px', height: '130px' }}>
            <svg width="130" height="130" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} className="score-circle-bg" />
              <circle 
                cx="80" 
                cy="80" 
                r={radius} 
                className="score-circle-fill" 
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: scoreLevel.color
                }}
              />
            </svg>
            <div className="score-text-center">
              <span className="score-number" style={{ fontSize: '2.4rem' }}>{result.score}</span>
              <span className="score-label" style={{ fontSize: '0.65rem' }}>Eco Score</span>
            </div>
          </div>
          <h3 style={{ fontSize: '1rem', color: scoreLevel.color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {scoreLevel.label} Rating
            <button 
              onClick={() => handleOpenExplainability('score')}
              aria-label="Explain Eco Score rating calculation"
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '2px 4px'
              }}
            >
              Why?
            </button>
          </h3>
        </div>

        {/* Assistant Observations */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} /> Assistant Observations
            </h3>
            <ul style={{ paddingLeft: '14px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              <li>
                <strong>{primaryCategory.label}</strong> contributes <strong>{primaryCategory.pct}%</strong> of your emissions, making it your dominant footprint category.
              </li>
              {primaryCategory.id === 'energy' && (
                <li>
                  AC usage represents approximately <strong>{Math.round(((habits.ac_usage * 1.1 * 365 * (habits.appliances === 'efficient' ? 0.9 : habits.appliances === 'wasteful' ? 1.2 : 1.0)) / (result.energy || 1)) * 100)}%</strong> of Home Energy emissions.
                </li>
              )}
              {primaryCategory.id === 'transportation' && (
                <li>
                  Solo car driving represents approximately <strong>{Math.round(((habits.car * EMISSION_FACTORS.transport.car * Math.max(0.5, 1 - (habits.wfh_days * 0.1)) * 52) / (result.transportation || 1)) * 100)}%</strong> of Transportation emissions.
                </li>
              )}
              {primaryCategory.id === 'food' && (
                <li>
                  Food delivery transit represents approximately <strong>{Math.round(((habits.food_delivery * EMISSION_FACTORS.food.delivery * 52) / (result.food || 1)) * 100)}%</strong> of Diet & Food emissions.
                </li>
              )}
              {primaryCategory.id === 'shopping' && (
                <li>
                  Fast fashion purchases represent approximately <strong>{Math.round(((habits.fast_fashion * EMISSION_FACTORS.shopping.fashion * 12) / (result.shopping || 1)) * 100)}%</strong> of Shopping emissions.
                </li>
              )}
              {(() => {
                const sorted = [...categories].sort((a, b) => a.value - b.value);
                const lowest = sorted[0];
                return (
                  <li>
                    <strong>{lowest.label}</strong> contributes only <strong>{lowest.pct}%</strong>, making it a lower-priority optimization area.
                  </li>
                );
              })()}
              {habits.ac_usage > 4 && habits.car < 40 ? (
                <li>Your high electricity demand means AC optimization yields larger gains than transportation shifts.</li>
              ) : habits.car > 80 && habits.ac_usage < 3 ? (
                <li>Your heavy road commuting means public transit shifts yield much larger gains than home cooling changes.</li>
              ) : (
                <li>Optimizing your primary emitter ({primaryCategory.label}) yields a direct path to an improved Carbon Score.</li>
              )}
            </ul>
          </div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{tonsYearly} t</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO₂ / year</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{kgMonthly} kg</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO₂ / month</div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE SECTION: 3-Column Desktop Grid */}
      <div className="dashboard-grid-middle">
        
        {/* Footprint Breakdown Chart */}
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Carbon Score Projection</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Simulated companion score trajectory towards target zone.
          </p>
          
          <div style={{ position: 'relative', width: '100%', height: '140px', marginTop: '10px' }}>
            <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              
              {/* Baseline Path */}
              <path 
                d={`M 0,${100 - baselinePoints[0].score * 0.8} L 100,${100 - baselinePoints[1].score * 0.8} L 200,${100 - baselinePoints[2].score * 0.8} L 300,${100 - baselinePoints[3].score * 0.8} L 400,${100 - baselinePoints[4].score * 0.8}`} 
                fill="none" 
                stroke="var(--error)" 
                strokeWidth="2" 
                strokeDasharray="4"
                style={{ opacity: 0.7 }}
              />
              
              {/* Target Path */}
              <path 
                d={`M 0,${100 - projectionPoints[0].score * 0.8} L 100,${100 - projectionPoints[1].score * 0.8} L 200,${100 - projectionPoints[2].score * 0.8} L 300,${100 - projectionPoints[3].score * 0.8} L 400,${100 - projectionPoints[4].score * 0.8}`} 
                fill="none" 
                stroke="var(--success)" 
                strokeWidth="3.5" 
              />
              
              {/* Baseline Points */}
              {baselinePoints.map((pt, idx) => {
                const cy = 100 - pt.score * 0.8;
                return (
                  <circle 
                    key={`base-${idx}`}
                    cx={pt.x} 
                    cy={cy} 
                    r="4.5" 
                    fill="var(--error)" 
                    stroke="white" 
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                    onMouseEnter={() => setHoveredPoint({ ...pt, cy, clientX: pt.x, clientY: cy })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Target Points */}
              {projectionPoints.map((pt, idx) => {
                const cy = 100 - pt.score * 0.8;
                return (
                  <circle 
                    key={`proj-${idx}`}
                    cx={pt.x} 
                    cy={cy} 
                    r="5" 
                    fill="var(--success)" 
                    stroke="white" 
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                    onMouseEnter={() => setHoveredPoint({ ...pt, cy, clientX: pt.x, clientY: cy })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Interactive Tooltip Card Overlay */}
            {hoveredPoint && (
              <div style={{
                position: 'absolute',
                left: `${(hoveredPoint.clientX / 400) * 85}%`,
                top: `${hoveredPoint.clientY - 48}px`,
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 10px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 100,
                pointerEvents: 'none',
                minWidth: '110px'
              }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{hoveredPoint.month}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: hoveredPoint.type.includes('Target') ? 'var(--success)' : 'var(--error)' }}>
                  {hoveredPoint.type}: {hoveredPoint.score}
                </div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{hoveredPoint.co2} tons CO₂e</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Month 1 (Score {startScore})</span>
              <span>Month 6</span>
              <span>Month 12 (Target: 95)</span>
            </div>
          </div>
        </div>

        {/* Emission Sources */}
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Emissions breakdown</h3>
          <div className="breakdown-list" style={{ gap: '10px', marginTop: '6px' }}>
            {categories.map((cat) => {
              const isHighest = cat.id === primaryCategory.id;
              const hasActiveOffset = activeCategories.includes(cat.id);
              return (
                <div key={cat.id} className="breakdown-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {cat.icon} {cat.label}
                      {isHighest && (
                        <span style={{ fontSize: '0.58rem', padding: '1px 5px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--error)', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                          ⚠️ Highest
                        </span>
                      )}
                      {hasActiveOffset && (
                        <span style={{ fontSize: '0.58rem', padding: '1px 5px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                          ↓ Active Offset
                        </span>
                      )}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cat.pct}%
                      <button 
                        onClick={() => handleOpenExplainability(cat.id)}
                        aria-label={`Explain ${cat.label} score breakdown`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.68rem',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Why?
                      </button>
                    </span>
                  </div>
                  <div className="breakdown-bar-bg" style={{ height: '6px', borderRadius: '3px' }}>
                    <div className="breakdown-bar-fill" style={{ width: `${cat.pct}%`, backgroundColor: cat.color, height: '100%', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top AI Climate Recommendation Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--success)' }} /> Top AI Climate Recommendation
            </h3>
            
            {topRec && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Selected Decision:</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--primary-hover)', display: 'block', marginTop: '2px', marginBottom: '8px' }}>
                  {topRec.title}
                </strong>
                
                {/* Collapsible reasoning trigger */}
                <button
                  onClick={() => setWhyActionOpen(!whyActionOpen)}
                  aria-expanded={whyActionOpen}
                  aria-label="Toggle analysis of why this recommendation was chosen"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 0',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--accent)' }} /> Why This Action Was Chosen {whyActionOpen ? '▲' : '▼'}
                </button>

                {whyActionOpen && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '12px', 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>👁️ OBSERVED SITUATION:</strong>
                      • {topRec.currentSituation}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>📊 ASSISTANT ANALYSIS:</strong>
                      • Reduction potential: Impact Score {topRec.impact}/10
                      <br />• Ease of adoption: Difficulty Score {topRec.difficulty}/10
                      <br />• Cost consideration: Cost Score {topRec.cost}/10 (saves expenses)
                      <br />• Confidence level: {topRec.confidence}/10 certainty based on user profile
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>💡 EXPECTED IMPACT:</strong>
                      • Reduces footprint by <strong>{(topRec.co2Saved / 1000).toFixed(1)} tons CO₂/yr</strong>
                      <br />• Improves carbon score by <strong>+{topRec.scoreGain} points</strong>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>PRIORITY SCORE:</strong>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>{topRec.priority} / 10</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    backgroundColor: 'rgba(34, 197, 94, 0.08)', 
                    color: 'var(--success)', 
                    padding: '6px 8px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    whiteSpace: 'nowrap'
                  }}>
                    +{topRec.scoreGain} Score Points
                  </span>
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    backgroundColor: 'var(--primary-light)', 
                    color: 'var(--primary-hover)', 
                    padding: '6px 8px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(45, 106, 79, 0.15)',
                    whiteSpace: 'nowrap'
                  }}>
                    -{(topRec.co2Saved / 1000).toFixed(1)} Tons CO₂ / Year
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('coach')}
            style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', marginTop: '12px' }}
          >
            <span>Ask Coach for reductions</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* 4. BOTTOM SECTION: 3-Column Desktop Grid Previews */}
      <div className="dashboard-grid-bottom">
        
        {/* Missions Card Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} style={{ color: 'var(--primary)' }} /> Active Missions
            </h3>
            
            {activeQuestsSlice.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '10px 0' }}>
                All missions complete! Ask AI Coach to suggest more quests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeQuestsSlice.map(q => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)', padding: '8px 10px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{q.title}</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{q.xp} XP • save ₹{q.moneySaved || 100}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>-{q.carbonSaved} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('missions')}
            style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', marginTop: '10px' }}
          >
            <span>Open Missions Hub</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Progress Log Card Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} style={{ color: 'var(--secondary)' }} /> Recent completed
            </h3>
            
            {completedQuestsSlice.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '10px 0' }}>
                No completed logs yet. Check off a mission quest to see logs here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedQuestsSlice.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)', padding: '8px 10px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{log.title}</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.completedAt || 'Just now'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>-{log.carbonSaved} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('progress')}
            style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', marginTop: '10px' }}
          >
            <span>View Full Progress Log</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Leaderboard Lobbies Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={16} style={{ color: 'var(--primary)' }} /> Leaderboard Lobbies
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboardPreviewSlice.map((player, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: player.isUser ? 'var(--primary-light)' : 'var(--background)', padding: '8px 10px', borderRadius: '8px', border: player.isUser ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: player.isUser ? 800 : 600 }}>{player.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)' }}>+{player.reduction}%</span>
                </div>
              ))}
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('community')}
            style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', marginTop: '10px' }}
          >
            <span>Open Campus Lobbies</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Assistant Decision Logic (Judge Review Card) */}
      <div className="card" style={{ 
        border: '1px solid rgba(82, 183, 136, 0.3)', 
        background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.05) 0%, rgba(20, 20, 20, 0.35) 100%)',
        marginBottom: '20px',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={16} style={{ color: 'var(--success)' }} /> Assistant Decision Logic
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', marginBottom: '6px' }}>📥 INPUT</span>
            <ul style={{ paddingLeft: '14px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.45 }}>
              <li>Transportation: weekly commute mileage</li>
              <li>Home Energy: daily AC runtime & appliances</li>
              <li>Food: weekly delivery frequency & diet type</li>
              <li>Shopping: fashion & devices acquired</li>
              <li>Waste: wet/dry recycling & sorting habits</li>
            </ul>
          </div>
          <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', marginBottom: '6px' }}>⚙️ ANALYSIS</span>
            <ul style={{ paddingLeft: '14px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.45 }}>
              <li>Calculate category emission weights & totals</li>
              <li>Evaluate CO₂ reduction potential per action</li>
              <li>Score behaviors by Cost and Change Difficulty</li>
              <li>Compute Priority: Impact, Cost, Difficulty, Confidence</li>
              <li>Compare and rank all alternatives dynamically</li>
            </ul>
          </div>
          <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', marginBottom: '6px' }}>📤 OUTPUT</span>
            <ul style={{ paddingLeft: '14px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.45 }}>
              <li>Ranked recommendation with priority score</li>
              <li>Simulated Carbon Score Gain & Gap indicators</li>
              <li>Context-aware Carbon Twin forecast stories</li>
              <li>Phase-specific AI Roadmap milestones</li>
              <li>Collapsible reasoning and audit sections</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. MY WORLD IN 2035 STORYTELLING */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} /> My World in 2035 Storyboard
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Projections of your neighborhood environment based on cumulative action curves.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Current Path */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '2.2rem', padding: '4px' }}>🌡️</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--error)' }}>2035: Smoggy Heat Trap</h4>
                <span style={{ fontSize: '0.55rem', padding: '1px 5px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', borderRadius: '4px', fontWeight: 700 }}>UNMODIFIED</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Local temperatures average 1.8°C higher. Utility grids load high, spikes raise AC bill costs, and concrete thermal effects dry out neighborhood green fields.
              </p>
            </div>
          </div>

          {/* Improved Path */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '2.2rem', padding: '4px' }}>🌳</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>2035: Oasis Haven</h4>
                <span style={{ fontSize: '0.55rem', padding: '1px 5px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', borderRadius: '4px', fontWeight: 700 }}>COMPANION PATH</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Net air quality indexes clean. Switch to transit reduces urban heat, saving you over ₹1.4 Lakhs in cash and planting 400 new community trees.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ExplainabilityModal 
        isOpen={explainOpen} 
        onClose={() => setExplainOpen(false)} 
        initialMode={explainMode} 
        habits={habits}
      />
    </div>
  );
}
