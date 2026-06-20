import { useState } from 'react';
import { Compass, Leaf, AlertCircle, TrendingDown, DollarSign, Activity, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateFootprint, generateAIStories, generateBestFutureScenario, FINANCIAL_CONSTANTS, getScoredRecommendations } from '../utils/carbonCalculations';

export default function CarbonTwin({ habits }) {
  const [targetYear, setTargetYear] = useState(5);
  
  const recommendations = getScoredRecommendations(habits);
  const topRec = recommendations[0];

  
  // Interactive Scenario Simulator States
  const [deliveryAdjustment, setDeliveryAdjustment] = useState(0); 
  const [transitShift, setTransitShift] = useState(0); 
  const [acAdjustment, setAcAdjustment] = useState(0); 
  const [electronicsAdjustment, setElectronicsAdjustment] = useState(0); 

  // AI Scenario states
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarioData, setScenarioData] = useState(null);
  const [explainTwinOpen, setExplainTwinOpen] = useState(false);

  // Calculate simulated habits based on slider offsets
  const simulatedHabits = {
    ...habits,
    food_delivery: Math.max(0, habits.food_delivery - Math.round(deliveryAdjustment)),
    car: Math.max(0, Math.round(habits.car * (1 - transitShift / 100))),
    bus: habits.bus + Math.round(habits.car * (transitShift / 100) * 0.5),
    metro: habits.metro + Math.round(habits.car * (transitShift / 100) * 0.5),
    ac_usage: Math.max(0, habits.ac_usage - Math.round(acAdjustment)),
    electronics: Math.max(0, habits.electronics - Math.round(electronicsAdjustment))
  };

  const currentResult = calculateFootprint(habits);
  const simulatedResult = calculateFootprint(simulatedHabits);

  // Generate dynamic projections
  const currentPath = [];
  const improvedPath = [];
  for (let year = 1; year <= 10; year++) {
    const curYearCO2 = (currentResult.total * (1 + (year - 1) * 0.01)) / 1000;
    currentPath.push({ year, co2: parseFloat(curYearCO2.toFixed(1)) });
    
    const gap = currentResult.total - simulatedResult.total;
    const reductionAtYear = year >= 3 ? gap : (gap * (year / 3));
    const impYearCO2 = (currentResult.total - reductionAtYear) / 1000;
    improvedPath.push({ year, co2: parseFloat(impYearCO2.toFixed(1)) });
  }

  // Calculate cumulative CO2 up to targetYear
  const currentCumulative = currentPath
    .slice(0, targetYear)
    .reduce((sum, item) => sum + item.co2, 0)
    .toFixed(1);

  const improvedCumulative = improvedPath
    .slice(0, targetYear)
    .reduce((sum, item) => sum + item.co2, 0)
    .toFixed(1);

  // Future Impact metrics calculations
  const yearlyCarbonEmitted = (simulatedResult.total / 1000).toFixed(1);
  const yearlyCarbonSaved = Math.max(0, (currentResult.total - simulatedResult.total) / 1000).toFixed(1);
  const treesEquivalent = Math.round((currentResult.total - simulatedResult.total) / 22);

  // Energy Saved
  const acKWhSaved = acAdjustment * 1.38 * 365;
  const carKWhSaved = (habits.car * (transitShift / 100) * 52) * 0.08 * 8.9;
  const totalKWhSaved = Math.round(acKWhSaved + carKWhSaved);

  // Financial Savings
  const foodDeliverySavedCash = deliveryAdjustment * FINANCIAL_CONSTANTS.food_delivery_cost * 52;
  const transitSavedCash = (habits.car * (transitShift / 100) * 52) * (FINANCIAL_CONSTANTS.car_per_km_cost - FINANCIAL_CONSTANTS.transit_per_km_cost);
  const acElectricitySavedCash = acAdjustment * FINANCIAL_CONSTANTS.ac_per_hour_cost * 365;
  const electronicsSavedCash = electronicsAdjustment * FINANCIAL_CONSTANTS.electronics_cost;
  const totalCashSaved = Math.round(foodDeliverySavedCash + transitSavedCash + acElectricitySavedCash + electronicsSavedCash);



  const stories = generateAIStories(habits, simulatedHabits, targetYear);
  const [hoveredYear, setHoveredYear] = useState(null);

  // Auto slider animation
  const handleGenerateBestFuture = () => {
    const scenario = generateBestFutureScenario(habits);
    setScenarioData(scenario);
    setIsGenerating(true);
    setHasGenerated(true);

    const duration = 1500; 
    const startTime = Date.now();
    
    const startDelivery = deliveryAdjustment;
    const startTransit = transitShift;
    const startAc = acAdjustment;
    const startElectronics = electronicsAdjustment;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      const easeOut = 1 - (1 - progress) * (1 - progress);

      setDeliveryAdjustment(startDelivery + (scenario.deliveryAdjustment - startDelivery) * easeOut);
      setTransitShift(startTransit + (scenario.transitShift - startTransit) * easeOut);
      setAcAdjustment(startAc + (scenario.acAdjustment - startAc) * easeOut);
      setElectronicsAdjustment(startElectronics + (scenario.electronicsAdjustment - startElectronics) * easeOut);

      if (progress >= 1) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 30);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass style={{ color: 'var(--primary)' }} /> AI Climate Companion Twin
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Visualize and simulate the future impact of your choices. Tweak habits below or let the AI model generate your roadmap.
        </p>
      </div>

      {/* 1/5/10 Year Outlook Toggle Tab */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'var(--surface-card)', 
        borderRadius: '12px', 
        padding: '4px', 
        marginBottom: '20px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {[
          { id: 1, label: '⚡ 1-Year Forecast' },
          { id: 5, label: '📅 5-Year Forecast' },
          { id: 10, label: '🌳 10-Year Forecast' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTargetYear(tab.id)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 4px',
              fontSize: '0.82rem',
              fontWeight: targetYear === tab.id ? 700 : 500,
              backgroundColor: targetYear === tab.id ? 'var(--primary)' : 'transparent',
              color: targetYear === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive Desktop Layout split screen container */}
      <div className="twin-desktop-container">
        
        {/* LEFT COLUMN: Narrative Stories, Comparison Metrics and Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Side by side narrative story cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Current Future Story */}
            <div className="card" style={{ borderLeft: '4px solid var(--error)', background: 'rgba(239, 68, 68, 0.03)', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚗</span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--error)' }}>Current Future (Year {targetYear})</h4>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  "{stories.currentPath}"
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emissions</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--error)', fontFamily: 'var(--font-mono)' }}>{currentCumulative} tons</span>
              </div>
            </div>

            {/* Improved Future Story */}
            <div className="card" style={{ borderLeft: '4px solid var(--accent-green)', background: 'rgba(82, 183, 136, 0.03)', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌱</span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--success)' }}>Optimized Future (Year {targetYear})</h4>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  "{stories.improvedPath}"
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Emissions</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{improvedCumulative} tons</span>
              </div>
            </div>
          </div>

          {/* Comparison Metrics underneath story cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', margin: 0 }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '6px', borderRadius: '8px' }}><AlertCircle size={18} /></div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{yearlyCarbonEmitted} t</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CO₂ Output / yr</div>
              </div>
            </div>

            <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', margin: 0 }}>
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--success)', padding: '6px', borderRadius: '8px' }}><TrendingDown size={18} /></div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{yearlyCarbonSaved} t</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CO₂ Saved / yr</div>
              </div>
            </div>

            <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', margin: 0 }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', padding: '6px', borderRadius: '8px' }}><Leaf size={18} /></div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{treesEquivalent} trees</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trees Absorb / yr</div>
              </div>
            </div>

            <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', margin: 0 }}>
              <div style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', padding: '6px', borderRadius: '8px' }}><Zap size={18} /></div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{totalKWhSaved} kWh</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Grid Saved / yr</div>
              </div>
            </div>
          </div>

          {/* Cash Saved Banner */}
          <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.05))', border: '1px solid var(--primary)', margin: 0 }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '10px', borderRadius: '10px' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Estimated Yearly Cash Saved</h4>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                ₹{totalCashSaved.toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ year saved</span>
              </p>
            </div>
          </div>

          {/* Cumulative Projections Chart */}
          <div className="card" style={{ margin: 0 }}>
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Cumulative Carbon Path (10 Years)</h3>
            <div style={{ position: 'relative', width: '100%', height: '140px', marginTop: '10px' }}>
              <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />

                <path 
                  d={`M 0,110 L 40,${110 - currentPath[0].co2 * 1.5} L 80,${110 - currentPath[1].co2 * 1.5} L 120,${110 - currentPath[2].co2 * 1.5} L 160,${110 - currentPath[3].co2 * 1.5} L 200,${110 - currentPath[4].co2 * 1.5} L 240,${110 - currentPath[5].co2 * 1.5} L 280,${110 - currentPath[6].co2 * 1.5} L 320,${110 - currentPath[7].co2 * 1.5} L 360,${110 - currentPath[8].co2 * 1.5} L 400,${110 - currentPath[9].co2 * 1.5}`}
                  fill="none" 
                  stroke="var(--error)" 
                  strokeWidth="2.5" 
                />

                <path 
                  d={`M 0,110 L 40,${110 - improvedPath[0].co2 * 1.5} L 80,${110 - improvedPath[1].co2 * 1.5} L 120,${110 - improvedPath[2].co2 * 1.5} L 160,${110 - improvedPath[3].co2 * 1.5} L 200,${110 - improvedPath[4].co2 * 1.5} L 240,${110 - improvedPath[5].co2 * 1.5} L 280,${110 - improvedPath[6].co2 * 1.5} L 320,${110 - improvedPath[7].co2 * 1.5} L 360,${110 - improvedPath[8].co2 * 1.5} L 400,${110 - improvedPath[9].co2 * 1.5}`}
                  fill="none" 
                  stroke="var(--success)" 
                  strokeWidth="3" 
                />

                <line 
                  x1={(targetYear * 40)} 
                  y1="0" 
                  x2={(targetYear * 40)} 
                  y2="120" 
                  stroke="var(--primary)" 
                  strokeWidth="1.5" 
                  strokeDasharray="2"
                />

                {currentPath.map((pt, index) => {
                  const cx = pt.year * 40;
                  const cy = 110 - pt.co2 * 1.5;
                  return (
                    <circle 
                      key={`cur-dot-${index}`}
                      cx={cx} 
                      cy={cy} 
                      r="4" 
                      fill="var(--error)" 
                      stroke="white" 
                      strokeWidth="1" 
                      style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                      onMouseEnter={() => setHoveredYear({
                        year: pt.year,
                        current: pt.co2,
                        improved: improvedPath[index].co2,
                        x: cx,
                        y: cy
                      })}
                      onMouseLeave={() => setHoveredYear(null)}
                      onClick={() => setTargetYear(pt.year)}
                    />
                  );
                })}

                {improvedPath.map((pt, index) => {
                  const cx = pt.year * 40;
                  const cy = 110 - pt.co2 * 1.5;
                  return (
                    <circle 
                      key={`imp-dot-${index}`}
                      cx={cx} 
                      r="4.5" 
                      cy={cy} 
                      fill="var(--success)" 
                      stroke="white" 
                      strokeWidth="1" 
                      style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                      onMouseEnter={() => setHoveredYear({
                        year: pt.year,
                        current: currentPath[index].co2,
                        improved: pt.co2,
                        x: cx,
                        y: cy
                      })}
                      onMouseLeave={() => setHoveredYear(null)}
                      onClick={() => setTargetYear(pt.year)}
                    />
                  );
                })}
              </svg>

              {hoveredYear && (
                <div style={{
                  position: 'absolute',
                  left: `${(hoveredYear.x / 400) * 85}%`,
                  top: `${hoveredYear.y - 70}px`,
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                  pointerEvents: 'none',
                  minWidth: '130px'
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Year {hoveredYear.year} Outlook</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: 700 }}>Current: {hoveredYear.current}t</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>Optimized: {hoveredYear.improved}t</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700, borderTop: '1px dashed var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                    Savings: {(hoveredYear.current - hoveredYear.improved).toFixed(1)}t CO₂
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>Year 1 ({currentPath[0].co2}t)</span>
                <span>Year 5 ({currentPath[4].co2}t)</span>
                <span>Year 10 ({currentPath[9].co2}t)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Panel (Fades in once generated) */}
          {hasGenerated && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
              border: '2px solid var(--success)',
              borderRadius: '16px',
              padding: '20px 18px',
              margin: 0,
              animation: 'fadeIn 0.6s ease-out'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={20} /> YOUR BEST FUTURE ROADMAP
              </h3>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--background)', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score Jump</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-hover)' }}>
                    {currentResult.score} → {simulatedResult.score} <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>(+{simulatedResult.score - currentResult.score} pts)</span>
                  </div>
                </div>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />
                <div style={{ flex: 1, paddingLeft: '8px' }}>
                  <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>5-Year Saved</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>
                    -{(yearlyCarbonSaved * 5).toFixed(1)} tons CO₂
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                {scenarioData?.story}
              </div>

              {/* Recommended Actions */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: '8px' }}>Top AI Recommended Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scenarioData?.topActions.map((action, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>#{idx + 1} {action.title}</div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{action.desc}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
                        -{action.co2Saved} kg/yr
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why This Future Was Selected Section */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button 
                  onClick={() => setExplainTwinOpen(!explainTwinOpen)}
                  aria-expanded={explainTwinOpen}
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.82rem'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ❓ Why This Future Was Selected & Optimized
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {explainTwinOpen ? '▲ Hide' : '▼ Expand'}
                  </span>
                </button>

                {explainTwinOpen && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '12px', 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>👁️ OBSERVED:</strong>
                      • Largest footprint category: <strong>{topRec ? topRec.category.toUpperCase() : 'ENERGY'}</strong>
                      <br />• {topRec ? topRec.currentSituation : 'Home energy accounts for the largest baseline emission contribution.'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>📊 ANALYSIS:</strong>
                      • Highest reduction opportunity: Targeting this category yields the maximum rate of carbon reduction.
                      <br />• The assistant simulated slider adjustments: Food Delivery (-{Math.round(deliveryAdjustment)} orders/wk), Transit Shift (+{Math.round(transitShift)}%), AC usage (-{Math.round(acAdjustment)} hrs/day), and Electronics (-{Math.round(electronicsAdjustment)} devices/yr).
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>⚙️ DECISION:</strong>
                      • Optimization strategy: Automatically select the highest priority action ({topRec ? topRec.title : 'Reduce AC Runtime'}) and adjust parameters to project a sustainable lifestyle pathway.
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '6px', marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Estimated Reduction:</strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>
                          -{yearlyCarbonSaved} t CO₂/yr
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Confidence Level:</strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-hover)' }}>
                          {topRec ? topRec.confidence : 10} / 10
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Controls Panel (Sticky on Desktop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          
          {/* Flagship AI Primary CTA Section */}
          <div className="card flagship-ai-card" style={{ 
            padding: '24px 20px', 
            textAlign: 'center', 
            background: 'var(--gradient-primary)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'var(--shadow-ai)',
            margin: 0,
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Soft decorative glow background element */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(82, 183, 136, 0.35) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }} />
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#FFFFFF' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-green)', fill: 'var(--accent-green)' }} /> Generate My Best Future
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '18px', lineHeight: 1.45 }}>
              Let the AI model automatically optimize all sliders to your best possible sustainability scenario.
            </p>
            <button 
              className="btn"
              onClick={handleGenerateBestFuture}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 800,
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isGenerating ? 'default' : 'pointer',
                backgroundColor: 'var(--accent-green)',
                color: 'var(--primary)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(82, 183, 136, 0.4)',
                transition: 'var(--transition)'
              }}
            >
              {isGenerating ? 'Optimizing Sliders...' : '✨ Optimize My Future'}
            </button>
          </div>

          {/* Interactive Scenario Simulator Controls */}
          <div className="card" style={{ padding: '20px 16px', background: 'var(--surface-hover)', border: '1px solid var(--border)', margin: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--primary)' }} /> Scenario Adjustment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Slider 1: Food Delivery */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  <label htmlFor="twin-slider-delivery" id="label-twin-slider-delivery">🍔 Food Delivery</label>
                  <span id="val-twin-slider-delivery" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>-{Math.round(deliveryAdjustment)} orders/wk</span>
                </div>
                <input 
                  id="twin-slider-delivery"
                  type="range" min="0" max={habits.food_delivery} step="0.1"
                  value={deliveryAdjustment} onChange={e => setDeliveryAdjustment(Number(e.target.value))} 
                  className="custom-range"
                  disabled={isGenerating}
                  aria-describedby="val-twin-slider-delivery"
                />
              </div>

              {/* Slider 2: Shift to Public Transit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  <label htmlFor="twin-slider-transit" id="label-twin-slider-transit">🚇 Transit Shift</label>
                  <span id="val-twin-slider-transit" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{Math.round(transitShift)}% shifted</span>
                </div>
                <input 
                  id="twin-slider-transit"
                  type="range" min="0" max="100" step="1"
                  value={transitShift} onChange={e => setTransitShift(Number(e.target.value))} 
                  className="custom-range"
                  disabled={isGenerating}
                  aria-describedby="val-twin-slider-transit"
                />
              </div>

              {/* Slider 3: Reduce AC Usage */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  <label htmlFor="twin-slider-ac" id="label-twin-slider-ac">❄️ AC Runtime</label>
                  <span id="val-twin-slider-ac" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>-{Math.round(acAdjustment)} hrs/day</span>
                </div>
                <input 
                  id="twin-slider-ac"
                  type="range" min="0" max={habits.ac_usage} step="0.1"
                  value={acAdjustment} onChange={e => setAcAdjustment(Number(e.target.value))} 
                  className="custom-range"
                  disabled={isGenerating}
                  aria-describedby="val-twin-slider-ac"
                />
              </div>

              {/* Slider 4: Electronics Purchases */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  <label htmlFor="twin-slider-electronics" id="label-twin-slider-electronics">📱 Electronics</label>
                  <span id="val-twin-slider-electronics" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>-{Math.round(electronicsAdjustment)} devices/yr</span>
                </div>
                <input 
                  id="twin-slider-electronics"
                  type="range" min="0" max={habits.electronics} step="0.1"
                  value={electronicsAdjustment} onChange={e => setElectronicsAdjustment(Number(e.target.value))} 
                  className="custom-range"
                  disabled={isGenerating}
                  aria-describedby="val-twin-slider-electronics"
                />
              </div>
            </div>
          </div>

          {/* Projections Info Box */}
          <div className="card" style={{ padding: '14px 16px', margin: 0, backgroundColor: 'var(--surface-hover)', borderStyle: 'dashed' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} /> Projections Info
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
              Use the forecast buttons at the top or hover/click any year dot on the graph to travel through your carbon twin projections!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
