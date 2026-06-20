import { Settings, User, Moon, Sun, ShieldAlert, Heart, RefreshCw } from 'lucide-react';

export default function SettingsProfile({ 
  profile, 
  setProfile, 
  darkMode, 
  setDarkMode, 
  onResetAll 
}) {
  const handleNameChange = (e) => {
    setProfile(prev => ({ ...prev, name: e.target.value }));
  };

  const handleAvatarChange = (avatar) => {
    setProfile(prev => ({ ...prev, avatar }));
  };

  const avatars = ['🦊', '🐼', '🐸', '🐨', '🐯', '🦉'];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings style={{ color: 'var(--primary)' }} /> Profile & Settings
        </h2>
        <p style={{ fontSize: '0.85rem' }}>
          Customize your experience, adjust targets, and manage your Carbon Compass data.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="card">
        <h3 className="card-title"><User size={18} /> Personal Profile</h3>
        
        <div style={{ margin: '14px 0' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            YOUR NAME
          </label>
          <input 
            type="text" 
            className="chat-input"
            style={{ width: '100%', border: '1px solid var(--border)', fontSize: '0.9rem' }}
            value={profile.name}
            onChange={handleNameChange}
            placeholder="Tanya Sen"
          />
        </div>

        {/* Avatar selector */}
        <div style={{ margin: '14px 0' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            CHOOSE ECO AVATAR
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {avatars.map(av => (
              <button
                key={av}
                onClick={() => handleAvatarChange(av)}
                style={{
                  fontSize: '1.5rem',
                  padding: '8px',
                  borderRadius: '12px',
                  border: profile.avatar === av ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: profile.avatar === av ? 'var(--primary-light)' : 'var(--surface)',
                  cursor: 'pointer',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)'
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="card">
        <h3 className="card-title">Appearance</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Theme Mode</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle between light and dark modes</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {darkMode ? <Moon size={16} style={{ color: 'var(--secondary)' }} /> : <Sun size={16} style={{ color: 'var(--accent)' }} />}
            <label className="theme-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Target goals adjustments */}
      <div className="card">
        <h3 className="card-title">My Eco Targets</h3>
        
        <div style={{ margin: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
            <span>Yearly Footprint Target</span>
            <span style={{ color: 'var(--primary)' }}>3.0 tons CO₂e</span>
          </div>
          <div className="breakdown-bar-bg" style={{ height: '8px' }}>
            <div className="breakdown-bar-fill" style={{ width: '66%', backgroundColor: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Standard target is 3.0 tons to align with IPCC 2030 climate goals.
          </span>
        </div>
      </div>

      {/* Danger Zone Reset */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--error-light)' }}>
        <h3 className="card-title" style={{ color: 'var(--error)' }}><ShieldAlert size={18} /> Danger Zone</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Clearing application data resets all onboarding answers, streak records, levels, and badge histories. This cannot be undone.
        </p>
        <button 
          className="btn btn-secondary" 
          onClick={onResetAll}
          style={{ 
            color: 'var(--error)', 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            display: 'flex',
            gap: '8px',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={14} /> Reset Application Data
        </button>
      </div>

      {/* Credits Footer */}
      <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.6 }}>
        <p style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          Made with <Heart size={10} style={{ fill: 'var(--error)', color: 'var(--error)' }} /> for Carbon Compass © 2026
        </p>
      </div>

    </div>
  );
}
