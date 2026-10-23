import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Camera, 
  Sparkles, 
  Droplet, 
  Trash2, 
  Clock, 
  ChevronRight, 
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Palette
} from 'lucide-react';
import { MealItem, UserProfile } from '../../types';
import { getScanAllowance, saveStoredWater, getStoredWater } from '../../utils/nutrition';

interface HomeDashboardProps {
  profile: UserProfile;
  meals: MealItem[];
  onOpenScanner: () => void;
  onOpenManualLog: (category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => void;
  onOpenPaywall: () => void;
  onDeleteMeal: (mealId: string) => void;
  onSelectTheme?: (theme: 'emerald' | 'sunset' | 'violet' | 'ocean') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  meals,
  onOpenScanner,
  onOpenManualLog,
  onOpenPaywall,
  onDeleteMeal,
  onSelectTheme,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [waterMl, setWaterMl] = useState<number>(() => getStoredWater(todayStr));
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  const activeTheme = profile.colorTheme || 'emerald';

  // Filter today's meals
  const todaysMeals = meals.filter((m) => {
    try {
      return new Date(m.loggedAt).toISOString().split('T')[0] === todayStr;
    } catch {
      return true;
    }
  });

  // Dynamic meal categorization for exact calorie formula
  const breakfastMeals = todaysMeals.filter((m) => m.category === 'Breakfast');
  const lunchMeals = todaysMeals.filter((m) => m.category === 'Lunch');
  const otherMealsList = todaysMeals.filter((m) => m.category !== 'Breakfast' && m.category !== 'Lunch');

  const breakfastCalories = breakfastMeals.reduce(
    (acc, m) => acc + Math.round(m.calories * (m.portionMultiplier || 1)),
    0
  );
  const lunchCalories = lunchMeals.reduce(
    (acc, m) => acc + Math.round(m.calories * (m.portionMultiplier || 1)),
    0
  );
  const otherMealsCalories = otherMealsList.reduce(
    (acc, m) => acc + Math.round(m.calories * (m.portionMultiplier || 1)),
    0
  );

  // Compute daily totals dynamically
  const consumedCalories = breakfastCalories + lunchCalories + otherMealsCalories;
  const consumedProtein = todaysMeals.reduce(
    (acc, m) => acc + Math.round(m.protein * (m.portionMultiplier || 1)),
    0
  );
  const consumedCarbs = todaysMeals.reduce(
    (acc, m) => acc + Math.round(m.carbs * (m.portionMultiplier || 1)),
    0
  );
  const consumedFat = todaysMeals.reduce(
    (acc, m) => acc + Math.round(m.fat * (m.portionMultiplier || 1)),
    0
  );

  // Dynamic budget calculation: targetBudget (default 2203) - (breakfast + lunch + other) = remaining
  const targetBudget = profile.dailyCalorieTarget || 2203;
  const caloriesLeft = Math.max(0, targetBudget - consumedCalories);
  const isOverBudget = consumedCalories > targetBudget;
  const percentageConsumed = Math.min(100, Math.round((consumedCalories / targetBudget) * 100));

  // Macros left
  const proteinLeft = Math.max(0, profile.targetProteinG - consumedProtein);
  const carbsLeft = Math.max(0, profile.targetCarbsG - consumedCarbs);
  const fatLeft = Math.max(0, profile.targetFatG - consumedFat);

  const scanAllowance = getScanAllowance(profile);

  const handleAddWater = (amount: number) => {
    const updated = Math.min(5000, waterMl + amount);
    setWaterMl(updated);
    saveStoredWater(todayStr, updated);
  };

  const mealCategories: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'> = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
  ];

  const themes: Array<{ id: 'emerald' | 'sunset' | 'violet' | 'ocean'; name: string; dot: string; subtitle: string }> = [
    { id: 'emerald', name: 'Calming Sage', dot: 'bg-emerald-500', subtitle: 'Serene botanical green' },
    { id: 'sunset', name: 'Warm Honey', dot: 'bg-gradient-to-r from-amber-400 to-amber-600', subtitle: 'Cozy comforting amber' },
    { id: 'violet', name: 'Soft Lavender', dot: 'bg-gradient-to-r from-purple-400 to-indigo-500', subtitle: 'Gentle iris & violet' },
    { id: 'ocean', name: 'Nordic Ocean', dot: 'bg-gradient-to-r from-teal-400 to-cyan-500', subtitle: 'Peaceful sea breeze' },
  ];

  return (
    <div className="space-y-6 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto pb-28 animate-fadeIn">
      {/* Header Greeting & Streak */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">Today's Summary</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Color Theme Switcher Button */}
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2 rounded-full bg-white border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition text-neutral-700 active:scale-95"
            title="Choose Color Palette"
          >
            <Palette className="w-4 h-4 text-emerald-600" />
          </button>

          {/* 7-Day Flame Streak */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-rose-500 text-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md shadow-amber-500/20">
            <Flame className="w-4 h-4 fill-white text-white animate-pulse" />
            <span className="text-xs font-black">7 Day Streak</span>
          </div>
        </div>
      </div>

      {/* Popover Color Themes Palette */}
      {showThemePicker && (
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200 rounded-[24px] p-3 shadow-xl animate-fadeIn space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Color Palette</span>
            </span>
            <button
              onClick={() => setShowThemePicker(false)}
              className="text-[10px] font-bold text-neutral-400 hover:text-neutral-700"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme?.(t.id);
                  setShowThemePicker(false);
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  activeTheme === t.id
                    ? 'border-neutral-950 bg-neutral-900 text-white shadow-sm'
                    : 'border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${t.dot} shadow-xs shrink-0`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{t.name}</div>
                  <div className={`text-[10px] truncate ${activeTheme === t.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {t.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Freemium Scan Status Bar (if not premium) */}
      {!profile.isPremium && (
        <div
          onClick={onOpenPaywall}
          className="cursor-pointer bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-[24px] p-4 flex items-center justify-between shadow-lg hover:shadow-xl transition active:scale-[0.99] border border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#000000] text-white flex items-center justify-center font-black shadow-md border border-neutral-800">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>{scanAllowance.remainingToday}/{scanAllowance.allowedToday} free scans left today</span>
                {scanAllowance.remainingToday === 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    Limit Reached
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-400">
                Unlock unlimited AI scans with Scancalai Pro
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPaywall();
            }}
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            className="text-[11px] font-bold text-[#FFFFFF] bg-[#000000] border border-neutral-700 px-3.5 py-1.5 rounded-full shadow-xs hover:bg-neutral-800 transition"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns on Desktop & Tablet, Single Column on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column on Desktop: Calorie Ring, Macros, Water */}
        <div className="md:col-span-5 lg:col-span-5 space-y-5 md:sticky md:top-24">
          {/* CALORIE RING CARD (Dynamic Circular Energy Gauge) */}
          <div className="card-glass border border-neutral-200/80 rounded-[32px] p-6 shadow-sm relative overflow-hidden text-center">
            {/* Subtle Ambient Background Orb */}
            <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              activeTheme === 'sunset' ? 'bg-amber-300/20' :
              activeTheme === 'violet' ? 'bg-purple-300/20' :
              activeTheme === 'ocean' ? 'bg-cyan-300/20' :
              'bg-emerald-300/20'
            }`} />

            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Daily Energy Budget
            </div>

            <div className="relative w-52 h-52 mx-auto flex items-center justify-center my-2">
              {/* Circular SVG Gauge with Dynamic Gradient */}
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="calorieGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="60%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="calorieGradientSunset" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="calorieGradientViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="calorieGradientOcean" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                  fill="transparent"
                />

                {/* Progress Stroke with Theme Gradient */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke={
                    isOverBudget
                      ? '#ef4444'
                      : activeTheme === 'sunset'
                      ? 'url(#calorieGradientSunset)'
                      : activeTheme === 'violet'
                      ? 'url(#calorieGradientViolet)'
                      : activeTheme === 'ocean'
                      ? 'url(#calorieGradientOcean)'
                      : 'url(#calorieGradientEmerald)'
                  }
                  strokeWidth="14"
                  strokeDasharray={427}
                  strokeDashoffset={427 - (427 * percentageConsumed) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Callout with Dynamic Remaining Number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isOverBudget
                    ? 'text-rose-600'
                    : activeTheme === 'sunset'
                    ? 'text-amber-600'
                    : activeTheme === 'violet'
                    ? 'text-violet-600'
                    : activeTheme === 'ocean'
                    ? 'text-cyan-700'
                    : 'text-emerald-700'
                }`}>
                  {isOverBudget ? `+${consumedCalories - targetBudget}` : caloriesLeft}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mt-0.5">
                  {isOverBudget ? 'Calories Over' : 'Remaining'}
                </span>
                <span className="text-[11px] font-semibold text-neutral-500 mt-1">
                  Budget: {targetBudget} kcal
                </span>
              </div>
            </div>

            {/* Dynamic Calorie Equation: 2203 - (290 breakfast + 480 lunch + other) = remaining */}
            <div className="my-2.5 px-3 py-1.5 rounded-full bg-neutral-100/90 text-neutral-700 text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs flex-wrap justify-center border border-neutral-200/50">
              <span className="text-neutral-900 font-extrabold">{targetBudget}</span>
              <span className="text-neutral-400">-</span>
              <span>
                ({breakfastCalories} breakfast + {lunchCalories} lunch{otherMealsCalories > 0 ? ` + ${otherMealsCalories} other` : ''})
              </span>
              <span className="text-neutral-400">=</span>
              <span className="text-emerald-700 font-black">{caloriesLeft} remaining</span>
            </div>

            {/* Consumed vs Remaining bottom bar (Flexbox for cross-browser stability) */}
            <div className="flex divide-x divide-neutral-100 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex-1 text-center">
                <div className="text-neutral-400 font-medium">Consumed</div>
                <div className="text-base font-black text-neutral-950 mt-0.5">{consumedCalories} kcal</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-neutral-400 font-medium">Remaining</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">{caloriesLeft} kcal</div>
              </div>
            </div>
          </div>

          {/* MACRO PROGRESS CARDS (Protein, Carbs, Fat) */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Protein */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white border border-indigo-100/90 rounded-[24px] overflow-hidden p-3.5 shadow-sm text-center">
              <div className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Protein</div>
              <div className="text-xl font-black text-indigo-950 mt-1">{proteinLeft}g</div>
              <div className="text-[10px] text-indigo-500/80 font-bold">left</div>
              <div className="w-full bg-indigo-100/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all shadow-xs"
                  style={{ width: `${Math.min(100, (consumedProtein / profile.targetProteinG) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-indigo-700/80 mt-1.5 font-bold">
                {consumedProtein} / {profile.targetProteinG}g
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-white border border-amber-100/90 rounded-[24px] overflow-hidden p-3.5 shadow-sm text-center">
              <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Carbs</div>
              <div className="text-xl font-black text-amber-950 mt-1">{carbsLeft}g</div>
              <div className="text-[10px] text-amber-600/80 font-bold">left</div>
              <div className="w-full bg-amber-100/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 h-full rounded-full transition-all shadow-xs"
                  style={{ width: `${Math.min(100, (consumedCarbs / profile.targetCarbsG) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-amber-800/80 mt-1.5 font-bold">
                {consumedCarbs} / {profile.targetCarbsG}g
              </div>
            </div>

            {/* Fat */}
            <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-white border border-rose-100/90 rounded-[24px] overflow-hidden p-3.5 shadow-sm text-center">
              <div className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Fat</div>
              <div className="text-xl font-black text-rose-950 mt-1">{fatLeft}g</div>
              <div className="text-[10px] text-rose-600/80 font-bold">left</div>
              <div className="w-full bg-rose-100/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 h-full rounded-full transition-all shadow-xs"
                  style={{ width: `${Math.min(100, (consumedFat / profile.targetFatG) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-rose-800/80 mt-1.5 font-bold">
                {consumedFat} / {profile.targetFatG}g
              </div>
            </div>
          </div>

          {/* WATER TRACKER WIDGET */}
          <div className="bg-gradient-to-r from-cyan-50/90 via-sky-50/70 to-blue-50/90 border border-cyan-200/70 rounded-[28px] p-4.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Droplet className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-neutral-950">Water Intake</span>
                  <span className="text-[11px] font-extrabold text-cyan-800 bg-white/90 px-2.5 py-0.5 rounded-full shadow-2xs border border-cyan-200">
                    {waterMl} / 2,500 ml
                  </span>
                </div>
                <div className="text-[11px] text-cyan-700/80 font-medium mt-0.5">Hydration fuels metabolic rate</div>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => handleAddWater(250)}
                className="px-3 py-1.5 rounded-xl bg-white border border-cyan-200/90 hover:bg-cyan-100/50 text-xs font-extrabold text-cyan-800 transition active:scale-95 shadow-2xs"
              >
                +250ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold transition active:scale-95 shadow-xs hover:from-cyan-600 hover:to-blue-700"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>

        {/* Right Column on Desktop: Today's Meals & Quick Food Logger */}
        <div className="md:col-span-7 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-neutral-950 tracking-tight">Today's Meals</h2>
              <p className="text-xs text-neutral-400">Track and view your logged foods throughout the day</p>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-extrabold">
              {todaysMeals.length} logged
            </span>
          </div>

          {mealCategories.map((cat) => {
            const categoryMeals = todaysMeals.filter((m) => m.category === cat);
            const catCalories = categoryMeals.reduce(
              (acc, m) => acc + Math.round(m.calories * (m.portionMultiplier || 1)),
              0
            );

            const categoryStyles = {
              Breakfast: {
                badge: 'bg-amber-100 text-amber-800 border-amber-200',
                icon: '🌅',
                glow: 'hover:border-amber-200',
              },
              Lunch: {
                badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                icon: '🥗',
                glow: 'hover:border-emerald-200',
              },
              Dinner: {
                badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                icon: '🍽️',
                glow: 'hover:border-indigo-200',
              },
              Snack: {
                badge: 'bg-rose-100 text-rose-800 border-rose-200',
                icon: '🍎',
                glow: 'hover:border-rose-200',
              },
            }[cat];

            return (
              <div
                key={cat}
                className={`bg-white/95 backdrop-blur-sm border border-neutral-200/80 rounded-[28px] p-4.5 shadow-sm space-y-3 transition-colors ${categoryStyles.glow}`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" role="img" aria-label={cat}>{categoryStyles.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm text-neutral-950">{cat}</h3>
                        <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${categoryStyles.badge}`}>
                          {categoryMeals.length}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        {categoryMeals.length === 0
                          ? 'No food logged yet'
                          : `${catCalories} kcal total`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenManualLog(cat)}
                      className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                      title="Quick log"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onOpenScanner}
                      className="p-1.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white transition shadow-xs"
                      title="Scan photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                {categoryMeals.length > 0 && (
                  <div className="divide-y divide-neutral-100 pt-1">
                    {categoryMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="py-2.5 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt={meal.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-500 font-bold text-xs">
                              🍽️
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-neutral-900 truncate">
                              {meal.name}
                            </h4>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                              <span>{meal.portion}</span>
                              <span>·</span>
                              <span>{Math.round(meal.protein * (meal.portionMultiplier || 1))}g P</span>
                              <span>·</span>
                              <span>{Math.round(meal.carbs * (meal.portionMultiplier || 1))}g C</span>
                              <span>·</span>
                              <span>{Math.round(meal.fat * (meal.portionMultiplier || 1))}g F</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black text-xs text-neutral-950">
                            {Math.round(meal.calories * (meal.portionMultiplier || 1))} kcal
                          </span>
                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            className="text-neutral-300 hover:text-rose-500 transition p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Add Food Action Bar (Mobile Only) */}
      <div className="fixed bottom-20 inset-x-0 max-w-md mx-auto px-4 z-30 pointer-events-none md:hidden">
        <div className="flex justify-center pointer-events-auto gap-2">
          <button
            onClick={onOpenScanner}
            className="bg-neutral-950 text-white font-bold py-3.5 px-6 rounded-full hover:bg-neutral-800 transition active:scale-95 shadow-2xl flex items-center gap-2 border border-neutral-700/50"
          >
            <Camera className="w-5 h-5 text-emerald-400" />
            <span>Scan Food</span>
          </button>
          <button
            onClick={() => onOpenManualLog('Lunch')}
            className="bg-white text-neutral-900 font-bold py-3.5 px-4 rounded-full hover:bg-neutral-100 transition active:scale-95 shadow-xl flex items-center gap-1.5 border border-neutral-200"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
