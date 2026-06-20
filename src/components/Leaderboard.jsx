import { useState } from 'react';
import { Trophy, Users, Sparkles } from 'lucide-react';

export default function Leaderboard({ leaderboardData, onNavigate }) {
  const [filterType, setFilterType] = useState('reduction'); // reduction, streak, xp

  // Sort leaderboard mock data dynamically based on selection
  const sortedData = [...leaderboardData].sort((a, b) => {
    if (filterType === 'reduction') return b.reduction - a.reduction;
    if (filterType === 'streak') return b.streak - a.streak;
    return b.xp - a.xp;
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy style={{ color: 'var(--primary)' }} /> Climate Leaderboard
        </h2>
        <p style={{ fontSize: '0.85rem' }}>
          Compare your green progress. Rankings are based entirely on <strong>carbon reduction %</strong> and <strong>eco consistency</strong>, never high footprint.
        </p>
      </div>

      {/* Segmented control filter tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '16px'
      }}>
        {[
          { id: 'reduction', label: 'Reduction %' },
          { id: 'streak', label: 'Eco Streak' },
          { id: 'xp', label: 'Green XP' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: filterType === tab.id ? 'var(--primary)' : 'transparent',
              color: filterType === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard list container */}
      <div className="card" style={{ padding: '8px 12px' }}>
        <div className="leaderboard-table">
          {sortedData.map((player, idx) => {
            const isUser = player.isUser;
            const rank = idx + 1;
            
            return (
              <div 
                key={player.name} 
                className="leaderboard-row"
                style={{
                  backgroundColor: isUser ? 'var(--primary-light)' : 'transparent',
                  borderColor: isUser ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)',
                  borderWidth: isUser ? '1px' : '0 0 1px 0',
                  borderStyle: 'solid',
                  padding: '12px 8px',
                  borderRadius: isUser ? '12px' : '0'
                }}
              >
                {/* Rank indicator */}
                <div className="rank-col" style={{ 
                  color: rank === 1 ? 'var(--accent)' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : 'var(--text-muted)',
                  fontSize: rank <= 3 ? '1.1rem' : '0.9rem'
                }}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </div>

                {/* Name */}
                <div className="name-col" style={{ color: isUser ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isUser ? '700' : '600' }}>
                  {player.name}
                </div>

                {/* Metric value */}
                <div className="metric-col">
                  {filterType === 'reduction' && (
                    <span className="metric-value" style={{ color: 'var(--success)' }}>
                      -{player.reduction}%
                    </span>
                  )}
                  {filterType === 'streak' && (
                    <span className="metric-value" style={{ color: 'var(--secondary)' }}>
                      🔥 {player.streak}d
                    </span>
                  )}
                  {filterType === 'xp' && (
                    <span className="metric-value" style={{ color: 'var(--accent)' }}>
                      ⚡ {player.xp} XP
                    </span>
                  )}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {filterType === 'reduction' ? 'carbon cut' : filterType === 'streak' ? 'active streak' : 'weekly points'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation Tip */}
      <div className="card" style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--surface-hover)', borderStyle: 'dashed' }}>
        <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.75rem' }}>
          <strong>Tip:</strong> Log weekly missions to secure the daily green streak and earn XP multipliers! Reaching rank #1 unlocks the <em>Climate Champion</em> badge.
        </p>
      </div>

      {/* Community challenge navigations */}
      <button 
        className="btn btn-primary" 
        onClick={() => onNavigate('community')}
        style={{ marginTop: '10px' }}
      >
        <Users size={16} /> Enter Group Challenges
      </button>

    </div>
  );
}
