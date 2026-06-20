import { History, CheckCircle } from 'lucide-react';
import { calculateFootprint } from '../utils/carbonCalculations';

export default function ProgressHistory({ habits, completedMissions }) {
  const initialResult = calculateFootprint(habits);
  
  // Calculate total carbon saved from completed missions (kg)
  const totalSavedKg = completedMissions.reduce((sum, m) => sum + m.carbonSaved, 0);
  
  // Current footprint (After offsets)
  const currentTotalKg = Math.max(100, initialResult.total - totalSavedKg);
  const currentTons = (currentTotalKg / 1000).toFixed(1);
  const initialTons = (initialResult.total / 1000).toFixed(1);

  // Score improvement based on the exact same formula as calculateFootprint
  let currentScore = Math.round(100 - (currentTotalKg / 18000) * 80);
  currentScore = Math.max(10, Math.min(100, currentScore));

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History style={{ color: 'var(--primary)' }} /> Progress History Logs
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Track your cumulative carbon cuts and monitor your eco milestones over time.
        </p>
      </div>

      {/* Desktop Responsive Layout grid split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Before vs After & Reduction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px 20px', margin: 0 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px' }}>Before vs After Diagnostics</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Observe how your actual footprint drops dynamically as you complete eco-actions:
            </p>

            <div className="comparison-grid" style={{ margin: '12px 0' }}>
              <div className="comparison-box" style={{ borderColor: 'var(--border)', padding: '14px 10px' }}>
                <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Initial Quiz</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                  {initialTons} t
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Score: {initialResult.score}</span>
              </div>

              <div className="comparison-box" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '14px 10px' }}>
                <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--primary-hover)' }}>Current Level</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '4px 0', color: 'var(--success)' }}>
                  {currentTons} t
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)' }}>Score: {currentScore}</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Footprint Cut:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                {initialResult.total > 0 ? ((totalSavedKg / initialResult.total) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>

          {/* KPI Stats list */}
          <div className="card" style={{ padding: '24px 20px', margin: 0 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>Accumulated Eco Impact</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  {totalSavedKg.toFixed(1)} kg
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CO₂ Saved</span>
              </div>

              <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>
                  {completedMissions.length}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quests Done</span>
              </div>

              <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '10px', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Trees Equivalent</div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Matured absorption rate</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {(totalSavedKg / 22).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Quest Logs list */}
        <div className="card" style={{ padding: '24px 20px', margin: 0 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Action Logs Ledger
          </h3>

          {completedMissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📋</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No completed actions logged yet.</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Complete tasks in the <strong>Missions</strong> tab to build your record.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedMissions.map((m, idx) => (
                <div 
                  key={`${m.id}-${idx}`} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    backgroundColor: 'var(--surface-hover)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px' 
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{m.title}</div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Category: {m.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--success)', display: 'block' }}>
                      -{m.carbonSaved} kg
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--primary)' }}>+{m.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
