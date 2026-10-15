import React from 'react';
import { Home, Camera, TrendingUp, User } from 'lucide-react';

export type NavTab = 'home' | 'scan' | 'progress' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'scan' as NavTab, label: 'Scan', icon: Camera, isPrimary: true },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/70 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group transition active:scale-95"
                aria-label="Scan Food"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-xl shadow-neutral-950/30 ring-4 ring-emerald-400/40'
                      : 'bg-gradient-to-tr from-neutral-950 to-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.3] text-emerald-400" />
                </div>
                <span className="text-[10px] font-extrabold text-neutral-900 mt-0.5">
                  Scan
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition active:scale-95 py-1 px-3 rounded-2xl ${
                isActive
                  ? 'text-emerald-700 font-black'
                  : 'text-neutral-400 hover:text-neutral-700 font-semibold'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
