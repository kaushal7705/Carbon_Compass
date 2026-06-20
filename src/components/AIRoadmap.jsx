import { useState } from 'react';
import { Sparkles, Calendar, TrendingDown, Target, Check, Plus, DollarSign, FileText } from 'lucide-react';
import { calculateFootprint, getScoredRecommendations } from '../utils/carbonCalculations';

export default function AIRoadmap({ habits, onAddMission, onDownloadReport }) {
  const footprint = calculateFootprint(habits);
  const currentScore = footprint.score;
  const recommendations = getScoredRecommendations(habits);

  const [activePhase, setActivePhase] = useState('all'); // 'all', 'month', 'year', 'fiveYear'
  const [addedRoadmapQuests, setAddedRoadmapQuests] = useState({});
  const [expandedRoadmap, setExpandedRoadmap] = useState({});

  const toggleRoadmapReason = (id) => {
    setExpandedRoadmap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getMatchedRec = (act) => {
    if (act.category === 'energy') {
      return recommendations.find(r => r.id === 'rec-ac') || recommendations.find(r => r.category === 'energy');
    }
    if (act.category === 'transportation') {
      return recommendations.find(r => r.id === 'rec-transit') || recommendations.find(r => r.category === 'transportation');
    }
    if (act.category === 'food') {
      if (act.id === 'rm-3') {
        return recommendations.find(r => r.id === 'rec-delivery');
      }
      return recommendations.find(r => r.id === 'rec-diet') || recommendations.find(r => r.category === 'food');
    }
    if (act.category === 'shopping') {
      return recommendations.find(r => r.id === 'rec-shopping') || recommendations.find(r => r.category === 'shopping');
    }
    if (act.category === 'waste') {
      return recommendations.find(r => r.id === 'rec-waste') || recommendations.find(r => r.category === 'waste');
    }
    return null;
  };
  // DYNAMIC PHASE SCHEDULING BUILDER BASED ON SCORED RECOMMENDATIONS
  const buildDynamicPhases = () => {
    const p1Actions = [];
    const p2Actions = [];
    const p3Actions = [];

    // Categorize actual recommendations into the right phases based on difficulty
    recommendations.forEach((rec) => {
      const roadmapItem = {
        id: `rm-dyn-${rec.id}`,
        title: rec.title,
        desc: rec.desc,
        category: rec.category,
        impact: rec.impact >= 7 ? 'High' : rec.impact >= 4 ? 'Medium' : 'Low',
        co2: rec.co2Saved,
        money: rec.moneySaved,
        xp: rec.scoreGain * 10
      };

      if (rec.difficulty <= 3) {
        p1Actions.push(roadmapItem);
      } else if (rec.difficulty <= 5) {
        p2Actions.push(roadmapItem);
      } else {
        p3Actions.push(roadmapItem);
      }
    });

    // Fallbacks if user habits are already very clean and they have few recommendations
    if (p1Actions.length === 0) {
      p1Actions.push({
        id: 'rm-fb-1',
        title: 'Unplug Standby Devices',
        desc: 'Turn off power outlets for appliances on standby overnight.',
        category: 'energy',
        impact: 'Low',
        co2: 15,
        money: 250,
        xp: 30
      });
      p1Actions.push({
        id: 'rm-fb-2',
        title: 'Reusable Shopping Bags',
        desc: 'Bring a canvas bag on all shopping outings.',
        category: 'waste',
        impact: 'Low',
        co2: 5,
        money: 100,
        xp: 20
      });
    }

    if (p2Actions.length === 0) {
      p2Actions.push({
        id: 'rm-fb-3',
        title: 'Composting Organic Waste',
        desc: 'Begin backyard or local bin composting for wet kitchen waste.',
        category: 'waste',
        impact: 'Medium',
        co2: 80,
        money: 300,
        xp: 60
      });
    }

    if (p3Actions.length === 0) {
      p3Actions.push({
        id: 'rm-fb-4',
        title: 'Energy Star Upgrade',
        desc: 'Upgrade your primary household bulbs to high-lumen smart LEDs.',
        category: 'energy',
        impact: 'High',
        co2: 120,
        money: 1500,
        xp: 80
      });
    }

    return [
      {
        id: 'month',
        title: 'Phase 1: 30-Day Quick Start',
        timeframe: 'Immediate adjustments (Difficulty 1-3)',
        scoreTarget: Math.min(100, currentScore + p1Actions.reduce((sum, a) => sum + Math.max(1, Math.round(a.xp / 10)), 0)),
        co2Target: p1Actions.reduce((sum, a) => sum + a.co2, 0),
        cashTarget: p1Actions.reduce((sum, a) => sum + a.money, 0),
        actions: p1Actions
      },
      {
        id: 'year',
        title: 'Phase 2: 1-Year Consistency',
        timeframe: 'Behavioral and habit upgrades (Difficulty 4-5)',
        scoreTarget: Math.min(100, currentScore + p1Actions.reduce((sum, a) => sum + Math.max(1, Math.round(a.xp / 10)), 0) + p2Actions.reduce((sum, a) => sum + Math.max(1, Math.round(a.xp / 10)), 0)),
        co2Target: p2Actions.reduce((sum, a) => sum + a.co2, 0),
        cashTarget: p2Actions.reduce((sum, a) => sum + a.money, 0),
        actions: p2Actions
      },
      {
        id: 'fiveYear',
        title: 'Phase 3: 5-Year Net Zero Path',
        timeframe: 'Structural household upgrades (Difficulty 6-10)',
        scoreTarget: Math.min(100, currentScore + recommendations.reduce((sum, r) => sum + r.scoreGain, 0)),
        co2Target: p3Actions.reduce((sum, a) => sum + a.co2, 0) * 5,
        cashTarget: p3Actions.reduce((sum, a) => sum + a.money, 0) * 5,
        actions: p3Actions
      }
    ];
  };

  const phases = buildDynamicPhases();

  const handleAddRoadmapQuest = (act) => {
    onAddMission({
      title: act.title,
      desc: act.desc,
      xp: act.xp,
      carbonSaved: act.co2,
      moneySaved: act.money,
      category: act.category
    });
    setAddedRoadmapQuests(prev => ({ ...prev, [act.id]: true }));
  };

  const filteredPhases = activePhase === 'all' 
    ? phases 
    : phases.filter(p => p.id === activePhase);

  // Cumulative projection values
  const cumulativeCo2Saved = phases.reduce((sum, p) => sum + p.co2Target, 0);
  const cumulativeCashSaved = phases.reduce((sum, p) => sum + p.cashTarget, 0);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Sparkles style={{ color: 'var(--primary)', fill: 'var(--primary)' }} /> AI Sustainability Roadmap
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Your customized climate transition blueprint. Turn recommendations into active missions below.
          </p>
        </div>
        {onDownloadReport && (
          <button 
            onClick={onDownloadReport}
            className="btn btn-secondary" 
            style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', border: '1px solid var(--border)', alignItems: 'center', fontWeight: 700 }}
          >
            <FileText size={14} /> Download Report
          </button>
        )}
      </div>

      {/* Overview Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Score Target Card */}
        <div className="card" style={{ 
          margin: 0, 
          padding: '20px 18px', 
          background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.1) 0%, rgba(69, 123, 157, 0.05) 100%)',
          border: '1px solid var(--primary-light)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '8px', borderRadius: '10px' }}>
              <Target size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Carbon Score</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {currentScore} → {Math.min(100, currentScore + recommendations.reduce((sum, r) => sum + r.scoreGain, 0))} <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>(+{recommendations.reduce((sum, r) => sum + r.scoreGain, 0)} pts)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CO2 Savings Card */}
        <div className="card" style={{ 
          margin: 0, 
          padding: '20px 18px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--success)', color: '#FFFFFF', padding: '8px', borderRadius: '10px' }}>
              <TrendingDown size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Projected CO₂ Saved</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                -{(cumulativeCo2Saved / 1000).toFixed(1)} metric tons
              </div>
            </div>
          </div>
        </div>

        {/* Cash Savings Card */}
        <div className="card" style={{ 
          margin: 0, 
          padding: '20px 18px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(82, 183, 136, 0.05) 100%)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--warning)', color: '#FFFFFF', padding: '8px', borderRadius: '10px' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Estimated Cumulative Savings</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{cumulativeCashSaved.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Timeline Toggles */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'var(--surface-card)', 
        borderRadius: '12px', 
        padding: '4px', 
        marginBottom: '24px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {[
          { id: 'all', label: '📋 View Full Roadmap' },
          { id: 'month', label: '⚡ Phase 1 (30-Day)' },
          { id: 'year', label: '📅 Phase 2 (1-Year)' },
          { id: 'fiveYear', label: '🌳 Phase 3 (5-Year)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePhase(tab.id)}
            aria-pressed={activePhase === tab.id}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 4px',
              fontSize: '0.82rem',
              fontWeight: activePhase === tab.id ? 700 : 500,
              backgroundColor: activePhase === tab.id ? 'var(--primary)' : 'transparent',
              color: activePhase === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Phases Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        {/* Decorative Vertical Timeline Line */}
        {activePhase === 'all' && (
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '40px',
            bottom: '40px',
            width: '2px',
            backgroundColor: 'var(--border)',
            zIndex: 0
          }} />
        )}

        {filteredPhases.map((phase) => (
          <div key={phase.id} style={{ display: 'flex', gap: '24px', zIndex: 1, position: 'relative' }}>
            {/* Timeline Circle Marker */}
            {activePhase === 'all' && (
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface)',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--primary)',
                fontWeight: 800,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Calendar size={18} />
              </div>
            )}

            {/* Phase Content Box */}
            <div style={{ flex: 1 }}>
              <div className="card" style={{ margin: 0, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{phase.title}</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{phase.timeframe}</span>
                  </div>
                  
                  {/* Phase Targets */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Target Score</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary-hover)' }}>{phase.scoreTarget}</strong>
                    </div>
                    <div style={{ width: '1px', backgroundColor: 'var(--border)', height: '26px' }} />
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Est. Savings</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--success)' }}>₹{phase.cashTarget.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Implementing these targeted improvements shifts your climate projection index, securing significant compound carbon offsets.
                </p>

                {/* Actions Sub-Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {phase.actions.map((act) => {
                    const isAdded = addedRoadmapQuests[act.id];
                    return (
                      <div 
                        key={act.id}
                        style={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '140px',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>{act.title}</h4>
                            <span style={{ 
                              fontSize: '0.58rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 700,
                              backgroundColor: act.impact === 'High' ? 'rgba(239, 68, 68, 0.1)' : act.impact === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-light)',
                              color: act.impact === 'High' ? 'var(--error)' : act.impact === 'Medium' ? 'var(--warning)' : 'var(--primary-hover)'
                            }}>
                              {act.impact} Impact
                            </span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginBottom: '10px' }}>
                            {act.desc}
                          </p>

                          {/* Collapsible Roadmap Explainability Section */}
                          <div style={{ marginBottom: '12px' }}>
                            <button
                              onClick={() => toggleRoadmapReason(act.id)}
                              aria-expanded={expandedRoadmap[act.id] || false}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '0.68rem',
                                color: 'var(--primary)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 700
                              }}
                            >
                              💡 {expandedRoadmap[act.id] ? 'Hide explanation' : 'Why Recommended?'}
                            </button>
                            {expandedRoadmap[act.id] && (() => {
                              const matched = getMatchedRec(act);
                              return (
                                <div style={{ 
                                  marginTop: '8px', 
                                  padding: '10px 12px', 
                                  backgroundColor: 'var(--surface-hover)', 
                                  border: '1px solid var(--border)', 
                                  borderRadius: '8px',
                                  fontSize: '0.68rem',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  lineHeight: 1.35
                                }}>
                                  <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>👁️ CURRENT SITUATION:</strong>
                                    <br />{matched ? matched.currentSituation : 'Excellent baseline habits detected in this category.'}
                                  </div>
                                  <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>💡 EXPECTED IMPACT:</strong>
                                    <br />{matched ? `-${matched.co2Saved} kg CO₂/year (+${matched.scoreGain} score points)` : 'Already minimized.'}
                                  </div>
                                  <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>⚙️ REASON SELECTED:</strong>
                                    <br />{matched ? matched.reason : 'You have already achieved the optimal footprint level for this category.'}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '6px', marginTop: '4px' }}>
                                    <span><strong>CATEGORY AFFECTED:</strong> {act.category.toUpperCase()}</span>
                                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>
                                      <strong>PRIORITY SCORE:</strong> {matched ? `${matched.priority} / 10` : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Footer details & Action */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                              -{act.co2} kg CO₂
                            </span>
                            <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)', fontWeight: 700 }}>
                              ₹{act.money}
                            </span>
                          </div>

                          <button
                            onClick={() => !isAdded && handleAddRoadmapQuest(act)}
                            disabled={isAdded}
                            style={{
                              border: 'none',
                              backgroundColor: isAdded ? 'var(--border)' : 'var(--primary)',
                              color: isAdded ? 'var(--text-muted)' : '#FFFFFF',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: isAdded ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'var(--transition)'
                            }}
                          >
                            {isAdded ? (
                              <>
                                <Check size={12} /> Added
                              </>
                            ) : (
                              <>
                                <Plus size={12} /> Add to Quests
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
