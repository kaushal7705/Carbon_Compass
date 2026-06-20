import { useState } from 'react';
import { Users, UserPlus, Gift, Trophy, Plus, Check } from 'lucide-react';

export default function CommunityChallenge({ leaderboardData = [], lobbiesData = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('individual'); // 'individual' or 'lobbies'
  const [activeCategory, setActiveCategory] = useState('hostel');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Joined state for shared milestones
  const [joinedChallenges, setJoinedChallenges] = useState({
    'sm1': true,
    'sm2': false
  });

  const handleJoinShared = (id) => {
    setJoinedChallenges(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteEmail('');
      setInviteSent(false);
      setShowInviteModal(false);
    }, 1500);
  };

  // Derive leaderboard data dynamically from lobbiesData
  const currentLeaderboard = (lobbiesData || [])
    .filter(team => team.category === activeCategory)
    .sort((a, b) => b.improvement - a.improvement)
    .map((team, idx) => ({
      ...team,
      rank: idx + 1
    }));

  // Shared milestones
  const sharedMilestones = [
    { id: 'sm1', title: 'Plant 100 Virtual Trees', target: 100, current: 67, rewardXP: 250 },
    { id: 'sm2', title: 'Switch Off 1,000 hrs of AC', target: 1000, current: 420, rewardXP: 400 }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ color: 'var(--primary)' }} /> Climate Standings & Lobbies
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Review individual progress rankings or collaborate in lobbies to cut carbon.
        </p>
      </div>

      {/* Sub-Tabs Switcher */}
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
          { id: 'individual', label: '👤 Individual Standings' },
          { id: 'lobbies', label: '🏢 Campus Group Lobbies' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            aria-pressed={activeSubTab === tab.id}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 4px',
              fontSize: '0.85rem',
              fontWeight: activeSubTab === tab.id ? 700 : 500,
              backgroundColor: activeSubTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeSubTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: INDIVIDUAL STANDINGS */}
      {activeSubTab === 'individual' && (
        <div className="card" style={{ padding: '24px 20px', marginBottom: '20px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={18} style={{ color: 'var(--primary)' }} /> 
              Leaderboard Rankings
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Ranked by Improvement %</span>
          </div>

          {/* Desktop Table Layout (Visible >= 768px) */}
          <div className="desktop-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '80px' }}>Rank</th>
                  <th scope="col">User</th>
                  <th scope="col" style={{ textAlign: 'center' }}>Carbon Score</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Improvement</th>
                  <th scope="col" style={{ textAlign: 'right', paddingRight: '20px' }}>Unlocked Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, idx) => {
                  const rank = idx + 1;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;
                  const medal = isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${rank}`;
                  const medalColor = isGold ? '#D4AF37' : isSilver ? '#C0C0C0' : isBronze ? '#CD7F32' : 'var(--text-muted)';
                  
                  return (
                    <tr key={player.name} className={player.isUser ? 'user-row' : ''} style={{ transition: 'var(--transition)' }}>
                      <td>
                        <span style={{ fontWeight: 800, color: medalColor, fontSize: rank <= 3 ? '1.25rem' : '0.85rem' }}>
                          {medal}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{player.isUser ? '🦊' : (rank === 1 ? '🐼' : rank === 2 ? '🐨' : rank === 4 ? '🦁' : '🐯')}</span>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{player.name}</span>
                            {player.isUser && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 700 }}>YOU</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{player.score || 75}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)' }}>+{player.reduction}%</td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {player.badges && player.badges.map((b, bidx) => (
                            <span key={bidx} style={{ fontSize: '1.25rem' }} title={`Badge ${bidx + 1}`}>{b}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List Layout (Visible < 768px) */}
          <div className="mobile-leaderboard-list" style={{ flexDirection: 'column', gap: '8px' }}>
            {leaderboardData.map((player, idx) => {
              const rank = idx + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
              const medalColor = rank === 1 ? '#D4AF37' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--border)';
              
              return (
                <div 
                  key={player.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 12px',
                    backgroundColor: player.isUser ? 'var(--primary-light)' : 'var(--surface-hover)',
                    borderRadius: '12px',
                    border: player.isUser ? '1px solid var(--primary)' : '1px solid var(--border)',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: rank <= 3 ? medalColor : 'var(--border)',
                      color: rank <= 3 ? '#000' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {medal}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {player.name} {player.isUser && <span style={{ fontSize: '0.65rem', color: 'var(--primary-hover)' }}>(You)</span>}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Score: {player.score || 75} • Badges: {player.badges && player.badges.join(' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>
                      +{player.reduction}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LOBBIES STANDINGS (PRESERVED FUNCTIONALITY) */}
      {activeSubTab === 'lobbies' && (
        <>
          {/* Battle Lobby Selector Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '8px',
            marginBottom: '24px'
          }}>
            {[
              { id: 'hostel', label: 'Hostel Lobbies', icon: '🏢' },
              { id: 'department', label: 'Dept Lobbies', icon: '📚' },
              { id: 'college', label: 'College Lobbies', icon: '🎓' },
              { id: 'friends', label: 'Friends Lobbies', icon: '👥' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                style={{
                  border: activeCategory === cat.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 4px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: activeCategory === cat.id ? 'var(--primary-light)' : 'var(--surface-card)',
                  color: activeCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Leaderboard Table Card */}
          <div className="card" style={{ padding: '24px 20px', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={18} style={{ color: 'var(--primary)' }} /> 
                {activeCategory.toUpperCase()} STANDINGS
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>RANKED BY IMPROVEMENT %</span>
            </div>

            {/* Desktop Table Layout (Visible >= 768px) */}
            <div className="desktop-table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Team / Lobby</th>
                    <th scope="col" style={{ textAlign: 'center' }}>Members</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Total Saved</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Quests Done</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Net Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaderboard.map((team) => (
                    <tr key={team.name} className={team.isUser ? 'user-row' : ''}>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          color: team.rank === 1 ? '#D4AF37' : team.rank === 2 ? '#C0C0C0' : team.rank === 3 ? '#CD7F32' : 'var(--text-muted)'
                        }}>
                          #{team.rank}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{team.name}</span>
                        {team.isUser && <span style={{ fontSize: '0.7rem', color: 'var(--primary-hover)', marginLeft: '6px', fontWeight: 700 }}>(You)</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>{team.members}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{team.carbonSaved} kg</td>
                      <td style={{ textAlign: 'right' }}>{team.missionsCompleted}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary-hover)' }}>+{team.improvement}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List Layout (Visible < 768px) */}
            <div className="mobile-leaderboard-list" style={{ flexDirection: 'column', gap: '8px' }}>
              {currentLeaderboard.map((team) => (
                <div 
                  key={team.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 10px',
                    backgroundColor: team.isUser ? 'var(--primary-light)' : 'var(--background)',
                    borderRadius: '12px',
                    border: team.isUser ? '1px solid var(--primary)' : '1px solid var(--border)',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: team.rank === 1 ? '#D4AF37' : team.rank === 2 ? '#C0C0C0' : team.rank === 3 ? '#CD7F32' : 'var(--border)',
                      color: team.rank <= 3 ? '#000' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {team.rank}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {team.name} {team.isUser && <span style={{ fontSize: '0.65rem', color: 'var(--primary-hover)' }}>(You)</span>}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        👤 {team.members} members • Done: {team.missionsCompleted} quests
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>
                      +{team.improvement}%
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({team.carbonSaved} kg saved)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Campus Milestones */}
          <div className="card" style={{ marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
            <h3 className="card-title">Shared Milestones</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Contribute to campus-wide saving goals. Every completed mission adds to these meters.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sharedMilestones.map((sm) => {
                const isJoined = joinedChallenges[sm.id];
                const percent = ((sm.current / sm.target) * 100).toFixed(0);
                return (
                  <div key={sm.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sm.title}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Progress: {sm.current} / {sm.target} • Reward: +{sm.rewardXP} XP
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleJoinShared(sm.id)}
                        aria-pressed={isJoined}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '5px 8px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: isJoined ? 'var(--primary)' : 'var(--border)',
                          color: isJoined ? '#FFFFFF' : 'var(--text-primary)',
                          transition: 'var(--transition)'
                        }}
                      >
                        {isJoined ? <Check size={12} /> : <Plus size={12} />}
                        {isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                    
                    <div className="breakdown-bar-bg" style={{ height: '8px', borderRadius: '4px' }}>
                      <div className="breakdown-bar-fill" style={{ width: `${percent}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Friends Section */}
          <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
            <div style={{
              backgroundColor: 'var(--primary-light)',
              padding: '12px',
              borderRadius: '12px',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <Gift size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem' }}>Challenge Friends Lobbies</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Invite friends to create a private eco group. Share streaks and reduction graphs.
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowInviteModal(true)}
                aria-haspopup="dialog"
                style={{ 
                  marginTop: '10px', 
                  fontSize: '0.75rem', 
                  padding: '6px 12px', 
                  width: 'auto',
                  display: 'flex',
                  gap: '6px'
                }}
              >
                <UserPlus size={14} /> Invite Friend
              </button>
            </div>
          </div>
        </>
      )}

      {/* Invite Modal Backdrop */}
      {showInviteModal && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: 0, padding: '24px 20px', animation: 'fadeIn 0.25s ease' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Invite to Group Battle</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enter your friend's email address to send a link to join your lobby challenge.
            </p>
            
            <form onSubmit={handleSendInvite}>
              <input 
                id="invite-email-input"
                type="email" 
                className="chat-input"
                style={{ width: '100%', marginBottom: '16px', border: '1px solid var(--border)' }}
                placeholder="friend@college.edu"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                disabled={inviteSent}
                aria-label="Friend's email address"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowInviteModal(false)}
                  style={{ flex: 1, padding: '10px' }}
                  disabled={inviteSent}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '10px', color: '#FFFFFF' }}
                  disabled={inviteSent}
                >
                  {inviteSent ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
