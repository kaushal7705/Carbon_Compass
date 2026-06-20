import { Compass, ArrowRight, ShieldCheck, Users, Sparkles, HelpCircle, LayoutDashboard, Globe, DollarSign } from 'lucide-react';

export default function LandingPage({ onStart, onLoadDemo }) {
  // Styles for clean premium design
  const styles = `
    .landing-scroll-container {
      display: flex;
      flex-direction: column;
      gap: 64px;
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px 80px 20px;
      animation: fadeIn 0.5s ease-out;
      color: var(--text-primary);
    }
    .hero-sec {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }
    .logo-emblem {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12));
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border);
    }
    .hero-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -1px;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      max-width: 600px;
      line-height: 1.5;
    }
    .cta-group {
      display: flex;
      gap: 16px;
      margin-top: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn-demo {
      background-color: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--text-primary);
      transition: all 0.2s;
    }
    .btn-demo:hover {
      background-color: var(--background);
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    .section-title {
      font-size: 1.8rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 8px;
    }
    .section-desc {
      font-size: 0.95rem;
      color: var(--text-secondary);
      text-align: center;
      max-width: 600px;
      margin: 0 auto 32px auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .feature-card {
      background-color: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary-light);
    }
    .feature-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .feature-card h3 {
      font-size: 1rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .feature-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }
    .impact-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .impact-card {
      background: linear-gradient(135deg, var(--surface-card) 0%, var(--background) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .impact-val {
      font-size: 2.2rem;
      font-weight: 900;
      font-family: var(--font-mono);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .impact-card h4 {
      font-size: 0.9rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }
    .impact-card p {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    
    /* Interactive Preview Cards */
    .preview-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .preview-card {
      background-color: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }
    .preview-badge-label {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 0.55rem;
      font-weight: 800;
      background-color: var(--primary-light);
      color: var(--primary);
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .preview-score-dial {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 8px solid var(--border);
      border-top-color: var(--primary);
      border-right-color: var(--primary);
      margin: 16px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .preview-score-text {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--primary);
    }
    .preview-bar-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 16px;
    }
    .preview-bar-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .preview-bar-bg {
      height: 6px;
      background-color: var(--background);
      border-radius: 3px;
      overflow: hidden;
    }
    .preview-bar-fill {
      height: 100%;
      border-radius: 3px;
    }
    
    .footer-sec {
      border-top: 1px solid var(--border);
      padding-top: 40px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 40px;
      font-size: 0.85rem;
    }
    .footer-brand {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 12px;
    }
    .footer-col h5 {
      font-weight: 800;
      margin-bottom: 16px;
      color: var(--text-primary);
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: var(--text-secondary);
    }
    .footer-links a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: var(--primary);
    }
    
    @media (max-width: 768px) {
      .footer-sec {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }
  `;

  return (
    <div className="landing-scroll-container">
      <style>{styles}</style>
      
      {/* 1. HERO SECTION */}
      <section className="hero-sec">
        <div className="logo-emblem">
          <Compass size={44} style={{ color: 'var(--primary)', animation: 'float 3.5s ease-in-out infinite' }} />
        </div>
        
        <h1 className="hero-title">
          Carbon <span style={{ color: 'var(--primary)' }}>Compass</span>
        </h1>
        <p className="hero-subtitle">
          A premium, behavior-driven climate intelligence companion that maps your daily choices to a greener, net-zero future. Simulate paths, challenge colleagues, and trace scores instantly.
        </p>

        <div className="cta-group">
          <button className="btn btn-primary" onClick={onStart} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            Assess My Footprint <ArrowRight size={18} />
          </button>
          
          <button className="btn btn-demo" onClick={onLoadDemo} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            ✨ Load Demo Profile
          </button>
        </div>
        
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Takes 90 seconds. Demo mode populated with a sample footprint for instant preview.
        </span>
      </section>

      {/* 2. FEATURES GRID SECTION */}
      <section>
        <h2 className="section-title">Product Architecture</h2>
        <p className="section-desc">Carbon Compass delivers transparent, granular intelligence using a centralized calculation engine.</p>
        
        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <LayoutDashboard size={20} />
            </div>
            <h3>AI Climate Dashboard</h3>
            <p>Granular visualization of monthly and yearly CO₂ emissions. Highlights key behavior trends and score status at a single glance.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              <Compass size={20} />
            </div>
            <h3>Carbon Twin Forecasting</h3>
            <p>Side-by-side simulation modeling 1-year, 5-year, and 10-year environmental outputs. Adjust scenario sliders to see future changes.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Sparkles size={20} />
            </div>
            <h3>AI Sustainability Roadmap</h3>
            <p>Custom phase-based roadmap detailing 30-day, 1-year, and 5-year action steps. Each recommendation maps directly to quest logs.</p>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              <Users size={20} />
            </div>
            <h3>Missions & Gamification</h3>
            <p>Unlock achievements, complete active quests, accumulate XP, and climb hostel, department, or company-wide lobbies.</p>
          </div>

          {/* Card 5 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <HelpCircle size={20} />
            </div>
            <h3>Explainability Engine</h3>
            <p>Zero black boxes. Understand precisely how every score and emission factor is modeled. View contributions and preview recommendation impacts.</p>
          </div>

          {/* Card 6 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
              <ShieldCheck size={20} />
            </div>
            <h3>Deployment Quality</h3>
            <p>Designed as a fast, offline-first, responsive portfolio app utilizing robust local storage syncing and clean state design.</p>
          </div>
        </div>
      </section>

      {/* 3. IMPACT SECTION */}
      <section>
        <h2 className="section-title">Estimated Platform Impact</h2>
        <p className="section-desc">Average metrics recorded from simulated community campaigns and campus integrations.</p>
        
        <div className="impact-row">
          <div className="impact-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Globe size={20} />
            </div>
            <div className="impact-val">24.5%</div>
            <h4>Carbon Reduction</h4>
            <p>Average reduction in carbon emissions observed over 6 months of active habit tracking and quest completions.</p>
          </div>

          <div className="impact-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              <DollarSign size={20} />
            </div>
            <div className="impact-val">₹28,500</div>
            <h4>Annual Cost Savings</h4>
            <p>Financial savings in electricity bills, travel gasoline, and meal delivery packaging charges per household.</p>
          </div>

          <div className="impact-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Users size={20} />
            </div>
            <div className="impact-val">1,400+</div>
            <h4>Personalized Quests</h4>
            <p>Different custom missions generated dynamically based on specific user answers and travel patterns.</p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE CSS PREVIEW SECTION */}
      <section>
        <h2 className="section-title">System Interface Preview</h2>
        <p className="section-desc">Experience a live static representation of our core dashboard intelligence widgets.</p>
        
        <div className="preview-container">
          {/* Card 1: Score dial preview */}
          <div className="preview-card">
            <span className="preview-badge-label">Active Index</span>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Carbon score tracker</h4>
            <div className="preview-score-dial">
              <span className="preview-score-text">78</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
              <strong>Good rating</strong>. An increase of +4 points projected if active energy recommendations are checked.
            </p>
          </div>

          {/* Card 2: Chart breakdown preview */}
          <div className="preview-card">
            <span className="preview-badge-label">Contributors</span>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Emissions Breakdown</h4>
            
            <div className="preview-bar-group">
              <div>
                <div className="preview-bar-row">
                  <span>🚗 Commuting</span>
                  <span>42%</span>
                </div>
                <div className="preview-bar-bg"><div className="preview-bar-fill" style={{ width: '42%', backgroundColor: 'var(--secondary)' }} /></div>
              </div>
              
              <div>
                <div className="preview-bar-row">
                  <span>⚡ Home Energy</span>
                  <span>34%</span>
                </div>
                <div className="preview-bar-bg"><div className="preview-bar-fill" style={{ width: '34%', backgroundColor: 'var(--accent)' }} /></div>
              </div>

              <div>
                <div className="preview-bar-row">
                  <span>🥗 Diet & Food</span>
                  <span>18%</span>
                </div>
                <div className="preview-bar-bg"><div className="preview-bar-fill" style={{ width: '18%', backgroundColor: 'var(--primary)' }} /></div>
              </div>
            </div>
          </div>

          {/* Card 3: Roadmap preview */}
          <div className="preview-card">
            <span className="preview-badge-label">Timeline</span>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 12px 0' }}>AI roadmap milestones</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
              <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '10px', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', position: 'absolute', left: '-5px', top: '4px' }} />
                <strong>Phase 1: 30-Day Launch</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem' }}>Set AC Eco settings (-3.1 kg CO₂)</span>
              </div>
              
              <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '10px', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border)', position: 'absolute', left: '-5px', top: '4px' }} />
                <strong>Phase 2: 1-Year Commute Shift</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem' }}>Swap 2 car commutes for Metro (-8.5 kg CO₂)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="footer-sec">
        <div className="footer-col">
          <div className="footer-brand">🧭 Carbon Compass</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            An advanced portfolio project illustrating web interface responsive layout systems, offline-first synchronization, interactive SVG visualizer grids, and carbon calculations.
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            &copy; 2026 Carbon Compass. Released under the MIT License.
          </div>
        </div>

        <div className="footer-col">
          <h5>Technology Stack</h5>
          <div className="footer-links" style={{ fontSize: '0.8rem' }}>
            <span>Core: React 19 / JSX</span>
            <span>Bundler: Vite & ESBuild</span>
            <span>Icons: Lucide React</span>
            <span>Style: Vanilla CSS Variable Tokens</span>
            <span>Calculations: Pure JS Engine</span>
          </div>
        </div>

        <div className="footer-col">
          <h5>Developer Info</h5>
          <div className="footer-links" style={{ fontSize: '0.8rem' }}>
            <a href="https://github.com/developer/carbon-compass" target="_blank" rel="noopener noreferrer">🌐 GitHub Repository</a>
            <span>🦊 Designed for Portfolios</span>
            <span>🎓 Hackathon Showcase Ready</span>
            <span>🌱 100% Client-Side Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
