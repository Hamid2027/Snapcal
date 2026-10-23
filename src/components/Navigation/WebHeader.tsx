import React, { useState } from 'react';
import { 
  Flame, 
  Camera, 
  TrendingUp, 
  User, 
  Home, 
  Zap, 
  Palette, 
  Plus, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { NavTab } from './BottomNav';
import { UserProfile, MealItem } from '../../types';

interface WebHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  meals: MealItem[];
  onOpenScanner: () => void;
  onOpenManualLog: () => void;
  onOpenPaywall: () => void;
  onSelectTheme: (theme: 'emerald' | 'sunset' | 'violet' | 'ocean') => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  meals,
  onOpenScanner,
  onOpenManualLog,
  onOpenPaywall,
  onSelectTheme,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'scan' as NavTab, label: 'Scan Food', icon: Camera },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  const themes: Array<{ id: 'emerald' | 'sunset' | 'violet' | 'ocean'; name: string; dot: string; subtitle: string }> = [
    { id: 'emerald', name: 'Calming Sage', dot: 'bg-emerald-500', subtitle: 'Soothing botanical green' },
    { id: 'sunset', name: 'Warm Honey', dot: 'bg-gradient-to-r from-amber-400 to-amber-600', subtitle: 'Gentle comforting warm glow' },
    { id: 'violet', name: 'Soft Lavender', dot: 'bg-gradient-to-r from-purple-400 to-indigo-500', subtitle: 'Relaxing violet & iris' },
    { id: 'ocean', name: 'Nordic Ocean', dot: 'bg-gradient-to-r from-teal-400 to-cyan-500', subtitle: 'Tranquil sea breeze & azure' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-200/70 shadow-xs">
      <div className="max-w-md md:max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & App Name */}
        <div 
          onClick={() => onSelectTab('home')}
          className="cursor-pointer flex items-center gap-2.5 shrink-0"
        >
          <div className="w-9 h-9 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-black text-base shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-neutral-950">
                Scancalai
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-semibold leading-none hidden sm:block">
              AI Calorie Tracker
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links (Home, Scan, Progress, Profile) */}
        <nav className="hidden sm:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controls: Color Theme + Pro Badge */}
        <div className="flex items-center gap-2">
          {/* Color Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 transition flex items-center gap-1.5 text-xs font-bold shadow-2xs active:scale-95"
              title="Soothing Colors & Themes"
            >
              <Palette className="w-4 h-4 text-emerald-600" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white/98 backdrop-blur-xl border border-neutral-200 rounded-3xl p-3 shadow-2xl z-50 animate-fadeIn space-y-2">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-neutral-100">
                  <span className="text-xs font-extrabold text-neutral-900">
                    Comfortable Color Palettes
                  </span>
                  <button
                    onClick={() => setShowThemeMenu(false)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-800"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`p-2 rounded-xl text-left transition flex items-center gap-2.5 ${
                        profile.colorTheme === t.id
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${t.dot} shrink-0`} />
                      <div className="text-xs">
                        <div>{t.name}</div>
                        <div className={`text-[10px] ${profile.colorTheme === t.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          {t.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Scan CTA */}
          <button
            onClick={onOpenScanner}
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            className="hidden sm:flex bg-[#000000] text-[#FFFFFF] font-extrabold px-3.5 py-1.5 rounded-full hover:bg-neutral-800 transition active:scale-95 text-xs items-center gap-1.5 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan</span>
          </button>

          {/* Pro Badge / Upgrade */}
          <button
            onClick={profile.isPremium ? undefined : onOpenPaywall}
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              profile.isPremium
                ? 'bg-[#000000] text-[#FFFFFF] border border-neutral-800'
                : 'bg-[#000000] text-[#FFFFFF] font-bold shadow-xs hover:bg-neutral-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current text-white" />
            <span className="font-bold">{profile.isPremium ? 'Pro' : 'Upgrade'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
