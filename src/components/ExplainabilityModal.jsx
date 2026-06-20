import { useEffect, useState } from 'react';
import { X, Info, Sparkles } from 'lucide-react';
import { calculateFootprint, EMISSION_FACTORS, getScoredRecommendations } from '../utils/carbonCalculations';

export default function ExplainabilityModal({ isOpen, onClose, initialMode = 'score', habits }) {

  const result = calculateFootprint(habits);
  const currentScore = result.score;
  const currentTotalTons = (result.total / 1000).toFixed(1);

  // 1. Category Calculations Helper
  const getCategoryDetails = (catId) => {
    const total = result.total || 1;
    switch (catId) {
      case 'transportation':
        return { label: 'Transportation', value: result.transportation, pct: Math.round((result.transportation / total) * 100), icon: '🚗' };
      case 'food':
        return { label: 'Diet & Food', value: result.food, pct: Math.round((result.food / total) * 100), icon: '🥗' };
      case 'energy':
        return { label: 'Home Energy', value: result.energy, pct: Math.round((result.energy / total) * 100), icon: '⚡' };
      case 'shopping':
        return { label: 'Shopping', value: result.shopping, pct: Math.round((result.shopping / total) * 100), icon: '🛍️' };
      case 'waste':
        return { label: 'Waste', value: result.waste, pct: Math.round((result.waste / total) * 100), icon: '♻️' };
      default:
        return { label: 'Overall', value: result.total, pct: 100, icon: '🧭' };
    }
  };

  const currentCatDetails = getCategoryDetails(initialMode);

  // Fetch top recommendations from central decision engine
  const recommendations = getScoredRecommendations(habits);
  const topThree = recommendations.slice(0, 3);
  const potentialScore = currentScore + topThree.reduce((sum, rec) => sum + rec.scoreGain, 0);
  const scoreGap = potentialScore - currentScore;

  // 3. Animated Counter State
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPotential, setAnimatedPotential] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 750; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      
      setAnimatedScore(Math.round(ease * currentScore));
      setAnimatedPotential(Math.round(ease * potentialScore));

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [currentScore, potentialScore]);

  // 4. Positive & Negative Driver Chips
  const getDriverChips = () => {
    const pos = [];
    const neg = [];

    // Commutes
    if (habits.car <= 20) {
      pos.push('Low Car Dependence');
    } else if (habits.car > 80) {
      neg.push('Frequent Car Commutes');
    }

    if (habits.metro >= 30 || habits.bus >= 30) {
      pos.push('Public Transit Rider');
    }

    // Energy
    if (habits.ac_usage <= 2) {
      pos.push('Low AC Footprint');
    } else if (habits.ac_usage > 6) {
      neg.push('High AC Runtime');
    }

    // Food
    if (habits.diet === 'vegan') {
      pos.push('Plant-Based Diet');
    } else if (habits.diet === 'high_meat') {
      neg.push('Meat-Heavy Diet');
    }

    if (habits.food_delivery <= 1) {
      pos.push('Low Delivery Frequency');
    } else if (habits.food_delivery >= 4) {
      neg.push('Frequent Food Delivery');
    }

    // Shopping
    if (habits.fast_fashion <= 1) {
      pos.push('Eco Shopping Habits');
    } else if (habits.fast_fashion >= 3) {
      neg.push('Frequent Fast Fashion');
    }

    // Waste
    if (habits.recycling || habits.separation) {
      pos.push('Active Waste Sorting');
    } else {
      neg.push('No Waste Recycling');
    }

    if (pos.length === 0) pos.push('Onboarding Complete');
    if (neg.length === 0) neg.push('Sustainable Baseline');

    return { pos, neg };
  };

  const { pos: positiveChips, neg: negativeChips } = getDriverChips();

  // 5. Category Contributors Details
  const getCategoryContributors = (catId) => {
    const list = [];
    const commuteModifier = Math.max(0.5, 1 - (habits.wfh_days * 0.1));
    const appliancesMultiplier = habits.appliances === 'efficient' ? 0.9 : habits.appliances === 'wasteful' ? 1.2 : 1.0;

    switch (catId) {
      case 'transportation':
        list.push({ label: '🚗 Private Vehicles (Car/Bike/Cab)', co2: (habits.car * EMISSION_FACTORS.transport.car * commuteModifier + habits.bike * EMISSION_FACTORS.transport.bike * commuteModifier + habits.cab * EMISSION_FACTORS.transport.cab) * 52 });
        list.push({ label: '🚇 Public Transit (Bus/Metro)', co2: (habits.bus * EMISSION_FACTORS.transport.bus + habits.metro * EMISSION_FACTORS.transport.metro) * 52 });
        list.push({ label: '✈️ Air Travel / Flights', co2: habits.flights * EMISSION_FACTORS.transport.flights });
        break;
      case 'energy':
        list.push({ label: '❄️ Air Conditioning (AC) usage', co2: habits.ac_usage * EMISSION_FACTORS.energy.ac * 365 * appliancesMultiplier });
        list.push({ label: '🔌 Baseline electricity usage', co2: (habits.electricity === 'low' ? 600 : habits.electricity === 'high' ? 3600 : 1800) * appliancesMultiplier });
        break;
      case 'food':
        list.push({ label: '🥗 Baseline dietary choice', co2: EMISSION_FACTORS.food[habits.diet] });
        list.push({ label: '🛵 Food delivery emissions', co2: habits.food_delivery * EMISSION_FACTORS.food.delivery * 52 });
        break;
      case 'shopping':
        list.push({ label: '📦 Online shopping baseline', co2: EMISSION_FACTORS.shopping.online[habits.online_freq] });
        list.push({ label: '👕 Fast fashion clothes purchases', co2: habits.fast_fashion * EMISSION_FACTORS.shopping.fashion * 12 });
        list.push({ label: '📱 New electronics manufacturing', co2: habits.electronics * EMISSION_FACTORS.shopping.electronics });
        break;
      case 'waste':
        list.push({ label: '🗑️ Household baseline waste', co2: EMISSION_FACTORS.waste.baseline });
        if (habits.recycling) list.push({ label: '♻️ Recycling offset credit', co2: EMISSION_FACTORS.waste.recyclingDiscount });
        if (habits.reuse) list.push({ label: '🛍️ Reusable bag offset credit', co2: EMISSION_FACTORS.waste.reuseDiscount });
        if (habits.separation) list.push({ label: '🗑️ Waste separation credit', co2: EMISSION_FACTORS.waste.separationDiscount });
        break;
      default:
        break;
    }
    return list;
  };

  // Highest emitting category
  const scoreCategories = [
    { label: 'Transportation', value: result.transportation || 0, icon: '🚗' },
    { label: 'Home Energy', value: result.energy || 0, icon: '⚡' },
    { label: 'Diet & Food', value: result.food || 0, icon: '🥗' },
    { label: 'Shopping', value: result.shopping || 0, icon: '🛍️' },
    { label: 'Waste', value: result.waste || 0, icon: '♻️' }
  ];
  const highestCategory = scoreCategories.reduce((prev, curr) => (curr.value > prev.value) ? curr : prev, scoreCategories[0]);

  // CSS Styles Injection
  const styles = `
    .exp-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }
    .exp-dialog {
      width: 100%;
      max-width: 540px;
      background-color: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow-y: auto;
      animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
    }
    .exp-title {
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .exp-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .exp-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .exp-card {
      background-color: var(--background);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 12px;
      text-align: center;
      transition: transform 0.2s, border-color 0.2s;
    }
    .exp-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary-light);
    }
    .exp-card-value {
      font-size: 1.4rem;
      font-weight: 900;
      color: var(--text-primary);
    }
    .exp-card-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      margin-top: 4px;
      display: block;
      letter-spacing: 0.5px;
    }
    .exp-section-title {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .exp-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .exp-chip {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 9999px;
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .exp-chip-pos {
      background-color: rgba(34, 197, 94, 0.08);
      color: var(--success);
      border-color: rgba(34, 197, 94, 0.15);
    }
    .exp-chip-neg {
      background-color: rgba(239, 68, 68, 0.08);
      color: var(--error);
      border-color: rgba(239, 68, 68, 0.15);
    }
    .exp-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--background);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      transition: border-color 0.2s;
    }
    .exp-row:hover {
      border-color: var(--primary);
    }
    .exp-badges {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .exp-badge {
      font-size: 0.62rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .exp-close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }
    .exp-close-btn:hover {
      color: var(--text-primary);
    }

    @keyframes scaleIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 640px) {
      .exp-overlay {
        padding: 0;
      }
      .exp-dialog {
        max-height: 100vh;
        height: 100%;
        border-radius: 0;
        border: none;
      }
      .exp-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  if (!isOpen) return null;

  return (
    <div className="exp-overlay">
      <style>{styles}</style>
      
      <div className="exp-dialog">
        {/* Header */}
        <div className="exp-header">
          <h3 className="exp-title">
            <Info size={18} style={{ color: 'var(--primary)' }} />
            {initialMode === 'score' ? 'Carbon Score Explained' : `${currentCatDetails.label} Contributors`}
          </h3>
          <button onClick={onClose} className="exp-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="exp-content">
          
          {/* 1. SCORE SUMMARY METRICS GRID */}
          {initialMode === 'score' && (
            <>
              <div className="exp-grid">
                <div className="exp-card">
                  <div className="exp-card-value" style={{ color: 'var(--primary)' }}>
                    {animatedScore}
                  </div>
                  <span className="exp-card-label">Current Score</span>
                </div>
                
                <div className="exp-card" style={{ borderColor: 'rgba(34, 197, 94, 0.25)' }}>
                  <div className="exp-card-value" style={{ color: 'var(--success)' }}>
                    {animatedPotential}
                  </div>
                  <span className="exp-card-label">Potential Score</span>
                </div>

                <div className="exp-card">
                  <div className="exp-card-value">
                    {currentTotalTons} t
                  </div>
                  <span className="exp-card-label">Annual Footprint</span>
                </div>

                <div className="exp-card">
                  <div className="exp-card-value" style={{ fontSize: '1.1rem', padding: '5px 0' }}>
                    {highestCategory.icon} {highestCategory.label}
                  </div>
                  <span className="exp-card-label">Highest Contributor</span>
                </div>
              </div>

              {/* 2. POSITIVE DRIVERS */}
              <div>
                <h4 className="exp-section-title">Main Positive Drivers</h4>
                <div className="exp-chips">
                  {positiveChips.map((chip, idx) => (
                    <span key={idx} className="exp-chip exp-chip-pos">
                      ✨ {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. NEGATIVE DRIVERS */}
              <div>
                <h4 className="exp-section-title">Main Negative Drivers</h4>
                <div className="exp-chips">
                  {negativeChips.map((chip, idx) => (
                    <span key={idx} className="exp-chip exp-chip-neg">
                      ⚠️ {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. SCORE OPTIMIZATION PATH */}
              <div style={{ backgroundColor: 'var(--background)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>
                  📈 Score Optimization Path
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Current: <strong>{currentScore}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                    Potential: <strong>{potentialScore}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-hover)', fontWeight: 'bold' }}>
                    Gap: +{scoreGap} points
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Potential Score Gain Breakdown:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {topThree.map(rec => (
                      <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>• {rec.title}</span>
                        <strong style={{ color: 'var(--success)' }}>+{rec.scoreGain} points</strong>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '4px', marginTop: '4px', fontWeight: 800, fontSize: '0.75rem' }}>
                      <span>Total Potential Gain</span>
                      <strong style={{ color: 'var(--success)' }}>+{scoreGap} points</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. TOP RECOMMENDATIONS LIST */}
              <div>
                <h4 className="exp-section-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} style={{ color: 'var(--primary)' }} /> Top Recommendations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topThree.map((rec, idx) => (
                    <div key={idx} className="exp-row">
                      <div style={{ flex: 1, paddingRight: '10px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{rec.title}</div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Estimated reduction: -{rec.co2Saved} kg CO₂/yr
                        </span>
                      </div>
                      
                      <div className="exp-badges">
                        <span className="exp-badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', border: '1px solid var(--primary-light)' }}>
                          Difficulty {rec.difficulty}/10
                        </span>
                        <span className="exp-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                          +{rec.scoreGain} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. DECISION COMPARISON: WHY RECOMMENDATION #1 WON */}
              {topThree.length >= 2 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
                  <h4 className="exp-section-title" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                    🏆 Why Recommendation #1 Won (Ranking Logic)
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    The assistant evaluated alternative pathways using our multi-variable scoring model:
                  </p>
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--background)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface-hover)' }}>
                          <th style={{ padding: '8px 10px' }}>Action Pathway</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Impact</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Diff</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cost</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center' }}>Conf</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topThree.map((rec, idx) => (
                          <tr key={rec.id} style={{ 
                            borderBottom: '1px solid var(--border)', 
                            backgroundColor: idx === 0 ? 'rgba(82, 183, 136, 0.08)' : 'transparent',
                            fontWeight: idx === 0 ? 800 : 500
                          }}>
                            <td style={{ padding: '8px 10px', color: idx === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                              {idx === 0 ? '👑 ' : `#${idx + 1} `}{rec.title}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--success)' }}>{rec.impact}/10</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{rec.difficulty}/10</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{rec.cost}/10</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>{rec.confidence}/10</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--primary-hover)', fontWeight: 'bold' }}>{rec.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.35 }}>
                    * Priority Score = (Impact × 0.5) + (Confidence × 0.2) + ((10 - Difficulty) × 0.2) + ((10 - Cost) × 0.1). Pathway #1 has the highest composite viability and is recommended first.
                  </p>
                </div>
              )}
            </>
          )}

          {/* CATEGORY CONTRIBUTOR MODE */}
          {initialMode !== 'score' && (
            <>
              {/* Category stats info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Contribution Share</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    {currentCatDetails.icon} {currentCatDetails.label}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-hover)' }}>
                    {currentCatDetails.pct}%
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    ({(currentCatDetails.value / 1000).toFixed(2)} t CO₂e/yr)
                  </span>
                </div>
              </div>

              {/* Specific Sub-Contributors */}
              <div>
                <h4 className="exp-section-title">Detailed Sub-Contributors</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {getCategoryContributors(initialMode).map((cont, idx) => {
                    const tons = cont.co2 / 1000;
                    const absTons = Math.abs(tons).toFixed(2);
                    const isCredit = tons < 0;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{cont.label}</span>
                        <strong style={{ color: isCredit ? 'var(--success)' : 'var(--text-primary)' }}>
                          {isCredit ? '-' : ''}{absTons} t CO₂/yr
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
          {/* Footer close button */}
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ width: '100%', padding: '12px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', color: '#FFFFFF', cursor: 'pointer', marginTop: '6px' }}
          >
            Got It
          </button>

        </div>
      </div>
    </div>
  );
}
