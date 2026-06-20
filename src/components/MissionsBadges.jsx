import { useState } from 'react';
import { Award, Calendar, Sparkles } from 'lucide-react';
import { calculateLevel } from '../utils/carbonCalculations';

export default function MissionsBadges({ 
  xp, 
  streak, 
  missions, 
  onToggleMission, 
  badges, 
  completedMissions,
  onNavigate 
}) {
  const [activeTab, setActiveTab] = useState('missions');
  const levelInfo = calculateLevel(xp);

  // Difficulty colors
  const getDifficultyTag = (m) => {
    if (m.xp >= 100) return { label: 'Hard', color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)' };
    if (m.xp >= 60) return { label: 'Medium', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Easy', color: 'var(--success)', bg: 'var(--primary-light)' };
  };

  const activeMissions = missions.filter(m => !m.completed);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award style={{ color: 'var(--primary)' }} /> Missions & Achievements Hub
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Complete quest challenges, level up your climate companion, and unlock premium badges.
        </p>
      </div>

      {/* Level Card */}
      <div className="card" style={{ 
        padding: '24px 20px', 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid var(--primary-light)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '1.4rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {levelInfo.level}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.1 }}>Level {levelInfo.level}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {levelInfo.level >= 10 ? 'Eco Mastermind' : levelInfo.level >= 5 ? 'Carbon Crusader' : 'Green Seedling'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔥 {streak} Days
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Eco Streak</span>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border)', height: '30px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚡ {xp} XP
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total XP</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
            <span>Level Milestone Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{levelInfo.currentXPInLevel} / {levelInfo.xpNeeded} XP</span>
          </div>
          <div className="xp-bar-bg" style={{ height: '10px', borderRadius: '5px' }}>
            <div className="xp-bar-fill" style={{ width: `${levelInfo.progressPercent}%`, height: '100%', borderRadius: '5px' }} />
          </div>
        </div>

        <div style={{ 
          marginTop: '14px', 
          backgroundColor: 'var(--background)', 
          padding: '10px 14px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '0.78rem' 
        }}>
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            Next level reward milestone: <strong>{levelInfo.nextReward}</strong> (at Level {levelInfo.level + 1})
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'var(--surface-card)', 
        borderRadius: '12px', 
        padding: '4px', 
        marginBottom: '20px',
        border: '1px solid var(--border)'
      }}>
        {[
          { id: 'missions', label: `Active Quests (${activeMissions.length})` },
          { id: 'badges', label: `Achievements (${badges.filter(b => b.unlocked).length})` },
          { id: 'history', label: 'Quest Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 4px',
              fontSize: '0.82rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ACTIVE QUESTS (Grid format on Desktop) */}
      {activeTab === 'missions' && (
        <div style={{ border: 'none', padding: 0 }}>
          {activeMissions.length === 0 ? (
            <div className="card" style={{ padding: '40px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🎉</span>
              <h4 style={{ marginTop: '14px', fontSize: '1.1rem' }}>All Quests Clear!</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                You have completed all active missions. Ask the AI Companion Coach for more custom actions!
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('coach')} style={{ marginTop: '16px', width: 'auto', display: 'inline-flex', gap: '6px' }}>
                Ask AI Coach
              </button>
            </div>
          ) : (
            <div className="quests-grid">
              {activeMissions.map((mission) => {
                const diff = getDifficultyTag(mission);
                return (
                  <div 
                    key={mission.id} 
                    className="card"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface-card)',
                      borderRadius: '16px',
                      padding: '20px',
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '190px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, flex: 1, paddingRight: '10px' }}>{mission.title}</h4>
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', color: diff.color, backgroundColor: diff.bg, fontWeight: 700, flexShrink: 0 }}>
                          {diff.label}
                        </span>
                      </div>
                      <p className="mission-desc" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                        {mission.desc}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="mission-tag" style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B 0%, #D4AF37 100%)', color: '#FFFFFF', fontWeight: 800 }}>+{mission.xp} XP</span>
                        <span className="mission-tag" style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', background: 'var(--gradient-success)', color: '#FFFFFF', fontWeight: 800 }}>-{mission.carbonSaved} kg</span>
                        <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', backgroundColor: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)', fontWeight: 700 }}>💰 ₹{mission.moneySaved || 100}</span>
                      </div>
                      
                      <button 
                        onClick={() => onToggleMission(mission.id)}
                        className="btn btn-primary"
                        style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}
                        title="Mark complete"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS BADGES */}
      {activeTab === 'badges' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title">Unlocked Achievements</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
              {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
            </span>
          </div>
          
          <div className="badge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`badge-item ${badge.unlocked ? 'badge-unlocked' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 10px',
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: '14px',
                  border: badge.unlocked ? '1px solid var(--primary-light)' : '1px solid var(--border)',
                  opacity: badge.unlocked ? 1 : 0.45,
                  textAlign: 'center'
                }}
                title={badge.desc}
              >
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '8px',
                  filter: badge.unlocked ? 'none' : 'grayscale(100%)'
                }}>
                  {badge.icon}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.1 }}>{badge.title}</div>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '6px', minHeight: '30px', lineHeight: 1.2 }}>
                  {badge.desc}
                </p>
                {badge.unlocked ? (
                  <span style={{ fontSize: '0.58rem', color: 'var(--success)', fontWeight: 700, marginTop: '8px' }}>Unlocked</span>
                ) : (
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '8px' }}>Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUEST HISTORY */}
      {activeTab === 'history' && (
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} /> Quest Log Book
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            A historical ledger of carbon reduction check-ins and completed goals.
          </p>

          {completedMissions.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No completed missions yet. Check off an active quest to populate your log!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {completedMissions.map((log, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '10px',
                    borderLeft: '4px solid var(--success)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{log.title}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Completed on {log.completedAt || new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--success)' }}>
                      -{log.carbonSaved} kg CO₂
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      +{log.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
