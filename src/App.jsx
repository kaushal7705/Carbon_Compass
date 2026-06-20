import { useState, useEffect } from 'react';
import { LayoutDashboard, Compass, MessageSquare, Award, Users, History, Sun, Moon, Sparkles, FileText } from 'lucide-react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import AssessmentFlow from './components/AssessmentFlow';
import Dashboard from './components/Dashboard';
import CarbonTwin from './components/CarbonTwin';
import AICoach from './components/AICoach';
import AIRoadmap from './components/AIRoadmap';
import MissionsBadges from './components/MissionsBadges';
import CommunityChallenge from './components/CommunityChallenge';
import ProgressHistory from './components/ProgressHistory';
import SettingsProfile from './components/SettingsProfile';

import { 
  DEFAULT_HABITS, 
  MOCK_BADGES, 
  MOCK_LEADERBOARD,
  calculateFootprint,
  calculateLevel,
  getScoreLevel
} from './utils/carbonCalculations';

// Dynamic Quest Generator based on quiz inputs
const generatePersonalizedMissions = (h) => {
  const list = [
    {
      id: 'm-p-1',
      title: 'Walk Short Commutes',
      desc: 'Walk for all short errands under 1.5 km this week.',
      xp: 40,
      carbonSaved: 2.5,
      moneySaved: 50,
      category: 'transportation',
      completed: false
    }
  ];

  if (h.food_delivery > 1) {
    list.push({
      id: 'm-p-2',
      title: 'Skip Food Delivery',
      desc: 'Cook dinner at home to skip one food delivery order.',
      xp: 60,
      carbonSaved: 4.5,
      moneySaved: 250,
      category: 'food',
      completed: false
    });
  } else {
    list.push({
      id: 'm-p-2',
      title: 'Meatless Dinner',
      desc: 'Prepare a fully vegetarian or plant-based dinner tonight.',
      xp: 50,
      carbonSaved: 3.5,
      moneySaved: 100,
      category: 'food',
      completed: false
    });
  }

  if (h.ac_usage > 3) {
    list.push({
      id: 'm-p-3',
      title: 'AC Eco-Mode',
      desc: 'Set AC to 25°C or above and shorten usage time by 1 hour daily.',
      xp: 50,
      carbonSaved: 3.2,
      moneySaved: 80,
      category: 'energy',
      completed: false
    });
  } else {
    list.push({
      id: 'm-p-3',
      title: 'Unplug Standby',
      desc: 'Turn off standby wall power switches before going to bed.',
      xp: 30,
      carbonSaved: 1.2,
      moneySaved: 20,
      category: 'energy',
      completed: false
    });
  }

  if (h.car > 40) {
    list.push({
      id: 'm-p-4',
      title: 'Metro Commuter',
      desc: 'Swap 2 car drives for public bus or metro transit rides.',
      xp: 80,
      carbonSaved: 8.5,
      moneySaved: 180,
      category: 'transportation',
      completed: false
    });
  }

  if (h.fast_fashion > 1) {
    list.push({
      id: 'm-p-5',
      title: 'Wardrobe Cooling',
      desc: 'Commit to zero fast-fashion clothing purchases this month.',
      xp: 70,
      carbonSaved: 15.0,
      moneySaved: 1500,
      category: 'shopping',
      completed: false
    });
  }

  if (!h.recycling || !h.separation) {
    list.push({
      id: 'm-p-6',
      title: 'Sort Recyclables',
      desc: 'Separate plastic bottles and compost organic waste today.',
      xp: 40,
      carbonSaved: 2.0,
      moneySaved: 30,
      category: 'waste',
      completed: false
    });
  }

  return list;
};

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem('hasCompletedOnboarding') === 'true';
    } catch {
      return false;
    }
  });

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('habits');
      return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    } catch (e) {
      console.error("Failed to parse habits", e);
      return DEFAULT_HABITS;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    return hasCompletedOnboarding ? 'dashboard' : 'landing';
  });

  const [xp, setXp] = useState(() => {
    try {
      const saved = localStorage.getItem('xp');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem('streak');
      return saved ? Number(saved) : 5; // starting at 5 for active onboarding demo
    } catch {
      return 5;
    }
  });

  const [missions, setMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('missions');
      return saved ? JSON.parse(saved) : generatePersonalizedMissions(DEFAULT_HABITS);
    } catch (e) {
      console.error("Failed to parse missions", e);
      return generatePersonalizedMissions(DEFAULT_HABITS);
    }
  });

  const [badges, setBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('badges');
      return saved ? JSON.parse(saved) : MOCK_BADGES;
    } catch (e) {
      console.error("Failed to parse badges", e);
      return MOCK_BADGES;
    }
  });

  const [completedMissions, setCompletedMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('completedMissions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse completedMissions", e);
      return [];
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('profile');
      return saved ? JSON.parse(saved) : { name: 'Tanya Sen', avatar: '🦊' };
    } catch (e) {
      console.error("Failed to parse profile", e);
      return { name: 'Tanya Sen', avatar: '🦊' };
    }
  });

  const [lobbies, setLobbies] = useState(() => {
    try {
      const saved = localStorage.getItem('lobbies');
      return saved ? JSON.parse(saved) : [
        { id: 't1', name: 'Hostel A Eco-Riders', category: 'hostel', members: 42, carbonSaved: 1240, missionsCompleted: 18, improvement: 24.5, isUser: true },
        { id: 't2', name: 'Hostel B Solar Guild', category: 'hostel', members: 38, carbonSaved: 1195, missionsCompleted: 15, improvement: 18.2, isUser: false },
        { id: 't3', name: 'PG Block Bio-Dome', category: 'hostel', members: 29, carbonSaved: 850, missionsCompleted: 10, improvement: 12.4, isUser: false },
        { id: 't4', name: 'Girls Hostel Alpha', category: 'hostel', members: 32, carbonSaved: 720, missionsCompleted: 8, improvement: 9.1, isUser: false },
        
        { id: 't5', name: 'CS Department Green', category: 'department', members: 87, carbonSaved: 2850, missionsCompleted: 35, improvement: 21.4, isUser: true },
        { id: 't6', name: 'Mech Dept Turbo-Greens', category: 'department', members: 54, carbonSaved: 2100, missionsCompleted: 24, improvement: 16.2, isUser: false },
        { id: 't7', name: 'EE Department Voltage', category: 'department', members: 79, carbonSaved: 2310, missionsCompleted: 28, improvement: 14.2, isUser: false },
        { id: 't8', name: 'BioTech Enzymes', category: 'department', members: 21, carbonSaved: 980, missionsCompleted: 12, improvement: 8.5, isUser: false },
        
        { id: 't9', name: 'IIT Madras Green-Cell', category: 'college', members: 312, carbonSaved: 8900, missionsCompleted: 120, improvement: 28.4, isUser: false },
        { id: 't10', name: 'BITS Pilani Oasis-Eco', category: 'college', members: 245, carbonSaved: 7200, missionsCompleted: 95, improvement: 22.5, isUser: false },
        { id: 't11', name: 'Delhi University Green Guild', category: 'college', members: 198, carbonSaved: 5400, missionsCompleted: 74, improvement: 15.7, isUser: true },
        { id: 't12', name: 'VIT Vellore Eco-Knights', category: 'college', members: 164, carbonSaved: 4800, missionsCompleted: 62, improvement: 11.2, isUser: false },
        
        { id: 't13', name: 'Eco Warriors (You & Friends)', category: 'friends', members: 5, carbonSaved: 310, missionsCompleted: 9, improvement: 26.2, isUser: true },
        { id: 't14', name: 'Green Commuters', category: 'friends', members: 4, carbonSaved: 220, missionsCompleted: 6, improvement: 19.8, isUser: false },
        { id: 't15', name: 'Zero Waste Squad', category: 'friends', members: 6, carbonSaved: 140, missionsCompleted: 4, improvement: 11.4, isUser: false }
      ];
    } catch (e) {
      console.error("Failed to parse lobbies", e);
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  });

  // Calculate Level based on XP using utilities
  const { level } = calculateLevel(xp);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('hasCompletedOnboarding', hasCompletedOnboarding);
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('xp', xp);
      localStorage.setItem('streak', streak);
      localStorage.setItem('missions', JSON.stringify(missions));
      localStorage.setItem('badges', JSON.stringify(badges));
      localStorage.setItem('completedMissions', JSON.stringify(completedMissions));
      localStorage.setItem('profile', JSON.stringify(profile));
      localStorage.setItem('lobbies', JSON.stringify(lobbies));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [hasCompletedOnboarding, habits, xp, streak, missions, badges, completedMissions, profile, lobbies]);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLoadDemoProfile = () => {
    const demoHabits = {
      walking: 10,
      cycling: 5,
      bus: 15,
      metro: 20,
      car: 90,
      bike: 20,
      cab: 15,
      flights: 10,
      diet: 'high_meat',
      food_delivery: 4,
      electricity: 'medium',
      ac_usage: 8,
      appliances: 'standard',
      online_freq: 'weekly',
      fast_fashion: 3,
      electronics: 2,
      recycling: false,
      reuse: false,
      separation: false,
      wfh_days: 1,
      travel_freq: 'medium'
    };

    setHabits(demoHabits);
    setHasCompletedOnboarding(true);
    setXp(380);
    setStreak(14);
    
    const demoMissions = generatePersonalizedMissions(demoHabits);
    setMissions(demoMissions);

    const completed = [
      {
        id: 'm-demo-completed-1',
        title: 'Meatless Monday',
        desc: 'Go completely vegetarian or vegan for one full day.',
        xp: 50,
        carbonSaved: 5.2,
        moneySaved: 120,
        category: 'food',
        completed: true,
        completedAt: new Date(Date.now() - 86400000).toLocaleDateString()
      },
      {
        id: 'm-demo-completed-2',
        title: 'Unplug Standby',
        desc: 'Unplug all chargers, TVs, and appliances before going to sleep.',
        xp: 30,
        carbonSaved: 1.2,
        moneySaved: 20,
        category: 'energy',
        completed: true,
        completedAt: new Date(Date.now() - 172800000).toLocaleDateString()
      }
    ];
    setCompletedMissions(completed);
    
    setProfile({ name: 'Alex Cooper', avatar: '🌿' });

    setBadges(prev => 
      prev.map(b => {
        if (b.id === 'b1' || b.id === 'b2') return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        return b;
      })
    );

    setActiveTab('dashboard');
    showNotification("Demo profile loaded for Alex Cooper!", "info");
  };

  const handleDownloadReport = () => {
    const escapeHtml = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    const result = calculateFootprint(habits);
    const scoreLevel = getScoreLevel(result.score);
    const totalTons = (result.total / 1000).toFixed(1);
    
    const improvedHabits = {
      ...habits,
      car: Math.max(0, Math.round(habits.car * 0.3)),
      metro: habits.metro + Math.round(habits.car * 0.4),
      bus: habits.bus + Math.round(habits.car * 0.3),
      diet: habits.diet === 'high_meat' ? 'mixed' : habits.diet === 'mixed' ? 'vegan' : 'vegan',
      food_delivery: Math.max(0, habits.food_delivery - 2),
      ac_usage: Math.max(2, habits.ac_usage - 2),
      appliances: 'efficient',
      fast_fashion: Math.max(0, habits.fast_fashion - 1),
      electronics: Math.max(1, habits.electronics - 1),
      recycling: true,
      reuse: true,
      separation: true
    };
    const improvedResult = calculateFootprint(improvedHabits);
    const co2SavedTons = ((result.total - improvedResult.total) / 1000).toFixed(1);

    const financialSavings = 
      (habits.food_delivery * 180 * 52) +
      (habits.car * (8 - 2) * 52) +
      (habits.ac_usage * 11.04 * 365 * 0.2);

    const highestCategoryLabel = () => {
      const scoreCats = [
        { label: 'Transportation', value: result.transportation || 0, icon: '🚗' },
        { label: 'Home Energy', value: result.energy || 0, icon: '⚡' },
        { label: 'Diet & Food', value: result.food || 0, icon: '🥗' },
        { label: 'Shopping', value: result.shopping || 0, icon: '🛍️' },
        { label: 'Waste', value: result.waste || 0, icon: '♻️' }
      ];
      const highest = scoreCats.reduce((prev, curr) => (curr.value > prev.value) ? curr : prev, scoreCats[0]);
      return `${highest.icon} ${highest.label}`;
    };

    const getRecommendationsMarkup = () => {
      const recs = [];
      if (habits.ac_usage >= 2) recs.push('Reduce AC usage by 2 hrs/day (-803 kg CO₂/yr)');
      if (habits.car > 30) recs.push('Use public Metro commutes twice weekly (-624 kg CO₂/yr)');
      if (habits.food_delivery >= 1) recs.push('Skip food delivery order weekly (-104 kg CO₂/yr)');
      if (recs.length < 3) recs.push('Implement active waste separation (-80 kg CO₂/yr)');
      return recs.map((r, i) => `<li><strong>${i+1}. ${r}</strong></li>`).join('');
    };

    const printHtml = `
      <html>
        <head>
          <title>Carbon Compass - Sustainability Report</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1f2937;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header-sec {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #2D6A4F;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 1.6rem;
              font-weight: 800;
              color: #1B4332;
            }
            .title {
              font-size: 1.8rem;
              font-weight: 900;
              margin: 0;
              color: #111827;
            }
            .meta {
              font-size: 0.85rem;
              color: #6b7280;
              margin-top: 4px;
            }
            .section {
              margin-bottom: 32px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 1.25rem;
              font-weight: 800;
              color: #2D6A4F;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 6px;
              margin-bottom: 16px;
            }
            .grid-metrics {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-bottom: 20px;
            }
            .card-metric {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              padding: 16px;
            }
            .card-label {
              font-size: 0.72rem;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .card-val {
              font-size: 1.45rem;
              font-weight: 800;
              color: #111827;
              margin-top: 4px;
            }
            .tbl {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .tbl th, .tbl td {
              padding: 12px 14px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
              font-size: 0.85rem;
            }
            .tbl th {
              background-color: #f3f4f6;
              font-weight: 700;
              color: #374151;
            }
            .savings-box {
              background-color: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 12px;
              padding: 20px;
              margin-top: 10px;
            }
            .footer-notes {
              margin-top: 60px;
              font-size: 0.75rem;
              color: #9ca3af;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              padding-top: 15px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="background-color: #2D6A4F; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s;">
              Print / Save to PDF
            </button>
          </div>
          
          <div class="header-sec">
            <div>
              <h1 class="title">Sustainability Performance Report</h1>
              <div class="meta">Carbon Compass &bull; Executive Summary &bull; ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="logo">🧭 Carbon Compass</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">1. Executive Summary</h2>
            <div class="grid-metrics">
              <div class="card-metric">
                <span class="card-label">User Profile</span>
                 <div class="card-val">${escapeHtml(profile.name)}</div>
              </div>
              <div class="card-metric">
                <span class="card-label">Carbon Health Score</span>
                <div class="card-val" style="color: #2D6A4F;">${result.score} / 100 (${scoreLevel.label})</div>
              </div>
              <div class="card-metric">
                <span class="card-label">Annual Carbon Footprint</span>
                <div class="card-val">${totalTons} Tons CO₂e / year</div>
              </div>
              <div class="card-metric">
                <span class="card-label">Highest Contributor</span>
                <div class="card-val">${highestCategoryLabel()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">2. Category Emissions Breakdown</h2>
            <table class="tbl">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Emissions (kg CO₂e/yr)</th>
                  <th>Footprint Share (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🚗 Transportation</td>
                  <td>${result.transportation} kg</td>
                  <td>${Math.round((result.transportation / result.total) * 100)}%</td>
                </tr>
                <tr>
                  <td>⚡ Home Energy</td>
                  <td>${result.energy} kg</td>
                  <td>${Math.round((result.energy / result.total) * 100)}%</td>
                </tr>
                <tr>
                  <td>🥗 Diet & Food</td>
                  <td>${result.food} kg</td>
                  <td>${Math.round((result.food / result.total) * 100)}%</td>
                </tr>
                <tr>
                  <td>🛍️ Shopping</td>
                  <td>${result.shopping} kg</td>
                  <td>${Math.round((result.shopping / result.total) * 100)}%</td>
                </tr>
                <tr>
                  <td>♻️ Waste & Recycling</td>
                  <td>${result.waste} kg</td>
                  <td>${Math.round((result.waste / result.total) * 100)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">3. High-Impact Action Plan</h2>
            <div class="card-metric" style="border-left: 4px solid #f59e0b; margin-bottom: 15px;">
              <strong style="font-size: 0.95rem; color: #b45309; display: block; margin-bottom: 4px;">Top Improvement Recommendations:</strong>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.82rem; color: #4b5563; line-height: 1.6;">
                ${getRecommendationsMarkup()}
              </ul>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">4. Forecast & Future Projections</h2>
            <div class="grid-metrics">
              <div class="card-metric">
                <span class="card-label">Current Path Forecast (10-Yr Total)</span>
                <div class="card-val" style="color: #ef4444;">${(parseFloat(totalTons) * 10).toFixed(1)} Tons</div>
              </div>
              <div class="card-metric">
                <span class="card-label">Optimized Path Forecast (10-Yr Total)</span>
                <div class="card-val" style="color: #10b981;">${(parseFloat((improvedResult.total / 1000).toFixed(1)) * 10).toFixed(1)} Tons</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">5. Estimated Financial & Carbon Savings</h2>
            <div class="savings-box">
              <span class="card-label" style="color: #065f46;">Annual Consolidated Benefits</span>
              <div style="display: flex; gap: 40px; margin-top: 10px; border-top: 1px solid #a7f3d0; padding-top: 10px;">
                <div>
                  <div style="font-size: 0.72rem; color: #065f46; font-weight: 700; text-transform: uppercase;">Estimated Savings</div>
                  <div style="font-size: 1.45rem; font-weight: 800; color: #047857;">₹${financialSavings.toLocaleString()} / yr</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #065f46; font-weight: 700; text-transform: uppercase;">Carbon Diverted</div>
                  <div style="font-size: 1.45rem; font-weight: 800; color: #047857;">-${co2SavedTons} Tons CO₂ / yr</div>
                </div>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 0.78rem; color: #065f46; line-height: 1.4;">
                This represents a combined index of reduced AC utility loads, commute fuel reductions, restaurant markups, and electronics/apparel thrifting.
              </p>
            </div>
          </div>
          
          <div class="footer-notes">
            This performance report was generated dynamically by the Carbon Compass calculation engine.
            <br>&copy; 2026 Carbon Compass Climate-Tech Platform.
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const reportWindow = window.open(blobUrl, '_blank');
    
    if (reportWindow) {
      showNotification("Sustainability report downloaded successfully!", "success");
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } else {
      showNotification("Pop-up blocked! Please allow pop-ups to view the report.", "warning");
    }
  };

  const handleStartAssessment = () => {
    setActiveTab('assessment');
  };

  const handleAssessmentComplete = (answers) => {
    setHabits(answers);
    setHasCompletedOnboarding(true);
    
    // Generate personalized missions based on quiz answers
    const generated = generatePersonalizedMissions(answers);
    setMissions(generated);
    
    // Add XP for completing onboarding and unlock first badge
    setXp(prev => prev + 100);
    
    setBadges(prev => 
      prev.map(b => {
        if (b.id === 'b1') return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        if (b.id === 'b6' && (answers.recycling || answers.separation)) {
          return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
        }
        return b;
      })
    );

    setActiveTab('dashboard');
  };

  const handleToggleMission = (id) => {
    setMissions(prev => 
      prev.map(m => {
        if (m.id === id) {
          const newStatus = !m.completed;
          
          if (newStatus) {
            // Completed! Reward XP and add to history log
            const updatedXp = xp + m.xp;
            const updatedCompletedCount = completedMissions.length + 1;
            const { level: updatedLevel } = calculateLevel(updatedXp);

            setXp(updatedXp);
            setCompletedMissions(comp => [
              { ...m, completedAt: new Date().toLocaleDateString() },
              ...comp
            ]);
            
            // Increment streak
            setStreak(s => s + 1);
            showNotification(`Mission "${m.title}" completed! +${m.xp} XP earned.`, "success");

            // Update dynamic lobbies
            setLobbies(prevLobbies => 
              prevLobbies.map(team => {
                if (team.isUser) {
                  const newSaved = team.carbonSaved + m.carbonSaved;
                  const newMissions = team.missionsCompleted + 1;
                  // Dynamic improvement calculation based on emissions cut
                  const newImprovement = parseFloat((team.improvement + (m.carbonSaved / 50)).toFixed(1));
                  return {
                     ...team,
                     carbonSaved: Math.round(newSaved),
                     missionsCompleted: newMissions,
                     improvement: newImprovement
                  };
                }
                return team;
              })
            );

            // Unlock badge conditions for Category, XP and Level
            setBadges(badgesPrev => 
              badgesPrev.map(b => {
                if (b.unlocked) return b;
                let didUnlock = false;
                let badgeName = '';
                if (b.id === 'b3' && updatedXp >= 350 && updatedCompletedCount >= 5) {
                  didUnlock = true;
                  badgeName = b.title;
                }
                if (b.id === 'b7' && updatedLevel >= 4) {
                  didUnlock = true;
                  badgeName = b.title;
                }
                if (b.id === 'b4' && m.category === 'transportation') {
                  didUnlock = true;
                  badgeName = b.title;
                }
                if (b.id === 'b5' && m.category === 'energy') {
                  didUnlock = true;
                  badgeName = b.title;
                }
                if (didUnlock) {
                  showNotification(`New Badge Unlocked: ${badgeName}! 🏆`, "success");
                  return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() };
                }
                return b;
              })
            );
          } else {
            // Uncompleted (revert rewards)
            const updatedXp = Math.max(0, xp - m.xp);
            setXp(updatedXp);
            setCompletedMissions(comp => comp.filter(c => c.id !== id));
            setStreak(s => Math.max(0, s - 1));

            // Revert dynamic lobbies
            setLobbies(prevLobbies => 
              prevLobbies.map(team => {
                if (team.isUser) {
                  const newSaved = Math.max(0, team.carbonSaved - m.carbonSaved);
                  const newMissions = Math.max(0, team.missionsCompleted - 1);
                  const newImprovement = parseFloat(Math.max(0, team.improvement - (m.carbonSaved / 50)).toFixed(1));
                  return {
                     ...team,
                     carbonSaved: Math.round(newSaved),
                     missionsCompleted: newMissions,
                     improvement: newImprovement
                  };
                }
                return team;
              })
            );
          }
          return { ...m, completed: newStatus };
        }
        return m;
      })
    );
  };

  // Dynamically add a new mission suggested by the AI Coach
  const handleAddCoachMission = (actionData) => {
    const newMission = {
      id: `m-coach-${Date.now()}`,
      title: actionData.title,
      desc: actionData.desc,
      xp: actionData.xp,
      carbonSaved: actionData.carbonSaved,
      moneySaved: actionData.moneySaved,
      category: actionData.category,
      completed: false
    };
    setMissions(prev => [newMission, ...prev]);
  };

  const handleSetTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'twin' || tabId === 'coach') {
      setBadges(prev => 
        prev.map(b => b.id === 'b2' && !b.unlocked 
          ? { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() } 
          : b
        )
      );
    }
  };

  const handleRetakeAssessment = () => {
    handleSetTab('assessment');
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This deletes your profile history, levels, and score.')) {
      localStorage.clear();
      setHasCompletedOnboarding(false);
      setHabits(DEFAULT_HABITS);
      setXp(0);
      setStreak(5);
      setMissions(generatePersonalizedMissions(DEFAULT_HABITS));
      setBadges(MOCK_BADGES);
      setCompletedMissions([]);
      setProfile({ name: 'Tanya Sen', avatar: '🦊' });
      handleSetTab('landing');
    }
  };

  // Update dynamic user row in mock leaderboard to sync XP and reduction
  const userResult = calculateFootprint(habits);
  const baselineTons = 4.5;
  const userTons = (userResult.total / 1000).toFixed(1);
  const userReduction = Math.max(0, (((baselineTons - userTons) / baselineTons) * 100).toFixed(1));

  const syncedLeaderboard = MOCK_LEADERBOARD.map(player => {
    if (player.isUser) {
      return {
        ...player,
        name: `${profile.name} (You)`,
        reduction: Number(userReduction),
        streak,
        xp,
        score: userResult.score,
        badges: badges.filter(b => b.unlocked).map(b => b.icon)
      };
    }
    const mockDetails = {
      'Sonia Green': { score: 88, badges: ['🧭', '🌍', '⚔️', '🏆'] },
      'Rahul V': { score: 79, badges: ['🧭', '🌍', '⚡'] },
      'Amit Sharma': { score: 72, badges: ['♻️', '🧭'] },
      'Nikhil Roy': { score: 64, badges: ['🧭'] }
    };
    const details = mockDetails[player.name] || { score: 55, badges: ['🧭'] };
    return {
      ...player,
      score: details.score,
      badges: details.badges
    };
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'twin', label: 'Carbon Twin', icon: Compass },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare },
    { id: 'roadmap', label: 'AI Roadmap', icon: Sparkles },
    { id: 'missions', label: 'Missions', icon: Award },
    { id: 'community', label: 'Leaderboard', icon: Users },
    { id: 'progress', label: 'Progress', icon: History }
  ];

  return (
    <div className="app-shell">
      {/* 1. Desktop Left Sidebar (Visible >1024px) */}
      {hasCompletedOnboarding && activeTab !== 'landing' && activeTab !== 'assessment' && (
        <aside className="desktop-sidebar">
          <div>
            <div className="sidebar-logo" onClick={() => handleSetTab('landing')}>
              <span className="logo-emoji">🧭</span>
              <h2>Carbon Compass</h2>
            </div>
            
            <nav className="sidebar-nav">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                let activeClass = '';
                if (isActive) {
                  if (item.id === 'coach') {
                    activeClass = 'sidebar-item-active-ai';
                  } else {
                    activeClass = 'sidebar-item-active-green';
                  }
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSetTab(item.id)}
                    className={`sidebar-item ${activeClass}`}
                    aria-pressed={activeTab === item.id}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-profile" onClick={() => setActiveTab('settings')}>
              <span className="profile-avatar">{profile.avatar}</span>
              <div className="sidebar-profile-info">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-level">Level {level} Companion</div>
              </div>
            </div>
            
            <button 
              className="theme-toggle-btn" 
              onClick={handleDownloadReport}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '8px',
                justifyContent: 'center',
                transition: 'var(--transition)'
              }}
            >
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              <span>Download Report</span>
            </button>

            <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. Mobile Header (Visible <1024px) */}
      {hasCompletedOnboarding && activeTab !== 'landing' && activeTab !== 'assessment' && (
        <header className="app-header">
          <div className="app-title-group" onClick={() => handleSetTab('landing')} style={{ cursor: 'pointer' }}>
            <span className="app-logo">🧭</span>
            <h1 className="app-title">Carbon Compass</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn-icon" 
              onClick={() => handleSetTab('community')}
              title="Team Lobbies"
              aria-label="Team Lobbies"
              aria-pressed={activeTab === 'community'}
              style={{ color: activeTab === 'community' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <Users size={20} />
            </button>
            <button 
              className="btn-icon" 
              onClick={() => handleSetTab('progress')}
              title="Progress Log"
              aria-label="Progress Log"
              aria-pressed={activeTab === 'progress'}
              style={{ color: activeTab === 'progress' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <History size={20} />
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              aria-label="Toggle Theme"
              aria-pressed={darkMode}
              style={{ cursor: 'pointer' }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => handleSetTab('settings')}
              style={{
                fontSize: '1.25rem',
                border: activeTab === 'settings' ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: 'var(--surface-card)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              title="My Profile"
              aria-label={`My Profile settings. Selected avatar: ${profile.avatar}`}
              aria-pressed={activeTab === 'settings'}
            >
              {profile.avatar}
            </button>
          </div>
        </header>
      )}

      {/* 3. Main Content Area */}
      <main className="app-content">
        <div className="desktop-max-container">
          {activeTab === 'landing' && (
            <LandingPage onStart={handleStartAssessment} onLoadDemo={handleLoadDemoProfile} />
          )}
          
          {activeTab === 'assessment' && (
            <AssessmentFlow 
              initialHabits={habits}
              onComplete={handleAssessmentComplete} 
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              habits={habits} 
              missions={missions}
              completedMissions={completedMissions}
              leaderboardData={syncedLeaderboard}
              streak={streak}
              xp={xp}
              profile={profile}
              onRetake={handleRetakeAssessment}
              onNavigate={handleSetTab}
              onDownloadReport={handleDownloadReport}
            />
          )}

          {activeTab === 'twin' && (
            <CarbonTwin habits={habits} />
          )}

          {activeTab === 'coach' && (
            <AICoach habits={habits} onAddMission={handleAddCoachMission} />
          )}

          {activeTab === 'roadmap' && (
            <AIRoadmap habits={habits} onAddMission={handleAddCoachMission} onDownloadReport={handleDownloadReport} />
          )}

          {activeTab === 'missions' && (
            <MissionsBadges 
              xp={xp}
              streak={streak}
              missions={missions}
              badges={badges}
              completedMissions={completedMissions}
              onToggleMission={handleToggleMission}
              onNavigate={handleSetTab}
            />
          )}

          {activeTab === 'community' && (
            <CommunityChallenge 
              leaderboardData={syncedLeaderboard} 
              badges={badges} 
              lobbiesData={lobbies}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressHistory 
              habits={habits} 
              completedMissions={completedMissions} 
            />
          )}

          {activeTab === 'settings' && (
            <SettingsProfile 
              profile={profile}
              setProfile={setProfile}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onResetAll={handleResetAll}
            />
          )}
        </div>
      </main>

      {/* 4. Mobile Bottom Nav (Visible <1024px) */}
      {hasCompletedOnboarding && activeTab !== 'landing' && activeTab !== 'assessment' && (
        <Navigation activeTab={activeTab} setActiveTab={handleSetTab} />
      )}

      {/* Floating Success Notifications */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: notification.type === 'error' ? 'var(--error)' : notification.type === 'info' ? '#1E3A8A' : 'var(--primary)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {notification.type === 'error' ? '⚠️' : notification.type === 'info' ? '🧭' : '✨'}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontWeight: 900,
              padding: '0 0 0 6px',
              fontSize: '1rem'
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
