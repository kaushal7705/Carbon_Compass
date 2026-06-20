import { LayoutDashboard, Compass, MessageSquare, Award, Users, Sparkles } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'twin', label: 'Twin', icon: Compass },
    { id: 'coach', label: 'Coach', icon: MessageSquare },
    { id: 'roadmap', label: 'Roadmap', icon: Sparkles },
    { id: 'missions', label: 'Quests', icon: Award },
    { id: 'community', label: 'Lobbies', icon: Users }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            aria-label={item.label}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
