'use client';

import { Home, Calendar, MessageCircle, Heart } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'rephrase', label: 'Rephrase', icon: MessageCircle },
    { id: 'connection', label: 'Verbindung', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-t border-black/5 nav-safe-area z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 text-xs font-medium ${
              activeTab === id ? 'text-couple-primary' : 'text-gray-500'
            }`}
            aria-label={label}
          >
            <Icon size={24} className="mb-1" strokeWidth={activeTab === id ? 2.25 : 1.75} />
            <span className="text-[11px] tracking-tight">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
