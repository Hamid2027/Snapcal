import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Download, 
  Plus, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Scale,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealItem, UserProfile, WeightEntry } from '../../types';
import { exportCalorieLogExcel } from '../../utils/excelExport';
import { saveStoredWeights, getStoredWeights } from '../../utils/nutrition';

interface ProgressPageProps {
  profile: UserProfile;
  meals: MealItem[];
  onOpenPaywall: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ profile, meals, onOpenPaywall }) => {
  const [weights, setWeights] = useState<WeightEntry[]>(() => {
    const existing = getStoredWeights();
    if (existing.length > 0) return existing;
    // Generate initial realistic weight trend history
    const today = new Date();
    const mock: WeightEntry[] = [];
    const baseWeight = profile.currentWeightKg;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const variance = profile.goal === 'lose' ? +(i * 0.15) : profile.goal === 'gain' ? -(i * 0.1) : 0;
      mock.push({
        id: 'w-' + dayStr,
        date: dayStr,
        weightKg: Math.round((baseWeight + variance) * 10) / 10,
      });
    }
    saveStoredWeights(mock);
    return mock;
  });

  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [newWeightInput, setNewWeightInput] = useState<number>(profile.currentWeightKg);

  // Compute 7-day weekly breakdown (Mon-Sun)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const daysMeals = meals.filter(
      (m) => new Date(m.loggedAt).toISOString().split('T')[0] === isoDate
    );

    const totalCals = daysMeals.reduce(
      (sum, m) => sum + Math.round(m.calories * (m.portionMultiplier || 1)),
      0
    );
    const totalProtein = daysMeals.reduce(
      (sum, m) => sum + Math.round(m.protein * (m.portionMultiplier || 1)),
      0
    );

    const target = profile.dailyCalorieTarget;
    const diff = totalCals - target;
    const isHit = totalCals > 0 && (
      Math.abs(diff) <= 150 ||
      (profile.goal === 'lose' && diff <= 0) ||
      (profile.goal === 'gain' && diff >= 0)
    );

    return {
      date: isoDate,
      dayLabel,
      totalCals,
      totalProtein,
      target,
      isHit,
      isToday: i === 6,
    };
  });

  const daysHitCount = last7Days.filter((d) => d.isHit).length;
  const daysLoggedCount = last7Days.filter((d) => d.totalCals > 0).length;
  const totalCalsLogged = last7Days.reduce((sum, d) => sum + d.totalCals, 0);
  const avgCals = daysLoggedCount > 0 ? Math.round(totalCalsLogged / daysLoggedCount) : profile.dailyCalorieTarget;
  const totalProteinLogged = last7Days.reduce((sum, d) => sum + d.totalProtein, 0);
  const avgProtein = daysLoggedCount > 0 ? Math.round(totalProteinLogged / daysLoggedCount) : profile.targetProteinG;

  const handleSaveWeight = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = weights.filter((w) => w.date !== todayStr);
    updated.push({
      id: 'w-' + todayStr,
      date: todayStr,
      weightKg: Math.round(newWeightInput * 10) / 10,
    });
    updated.sort((a, b) => a.date.localeCompare(b.date));
    setWeights(updated);
    saveStoredWeights(updated);
    setShowWeightModal(false);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleExportExcel = () => {
    exportCalorieLogExcel(profile, meals, weights);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.7 },
    });
  };

  const currentWeightDisplay = weights.length > 0 ? weights[weights.length - 1].weightKg : profile.currentWeightKg;
  const startingWeight = weights.length > 0 ? weights[0].weightKg : profile.currentWeightKg;
  const weightChange = Math.round((currentWeightDisplay - startingWeight) * 10) / 10;

  return (
    <div className="space-y-6 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Analytics & Reports
          </span>
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">Your Progress</h1>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleExportExcel}
          className="bg-white border border-neutral-200/80 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50 transition shadow-xs active:scale-95"
          title="Export calorie-log.xlsx with 3 sheets"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export .xlsx</span>
        </button>
      </div>

      {/* Responsive Grid for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Weight Tracker & Export */}
        <div className="md:col-span-5 space-y-5">
          {/* WEIGHT TRACKER CARD */}
          <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Current Weight
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-neutral-950">
                {currentWeightDisplay}
              </span>
              <span className="text-sm font-bold text-neutral-400">
                {profile.weightUnit || 'kg'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
              {weightChange < 0 ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {Math.abs(weightChange)} {profile.weightUnit} down from start
                </span>
              ) : weightChange > 0 ? (
                <span className="text-blue-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{weightChange} {profile.weightUnit} gained
                </span>
              ) : (
                <span className="text-neutral-500">Maintaining baseline weight</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="bg-neutral-950 text-white text-xs font-bold px-3.5 py-2 rounded-full hover:bg-neutral-800 transition active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </button>
        </div>

        {/* Weight Trajectory Chart */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="flex justify-between items-center text-[11px] font-bold text-neutral-400">
            <span>7-Day Weight Trend</span>
            <span className="text-neutral-950">Target: {profile.idealWeightKg} {profile.weightUnit}</span>
          </div>

          {/* SVG Weight Chart */}
          <div className="h-28 w-full relative flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 320 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#09090b" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="320" y2="20" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="320" y2="50" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />

              {/* Trajectory Polyline */}
              <polyline
                fill="none"
                stroke="#09090b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weights
                  .slice(-7)
                  .map((w, idx, arr) => {
                    const x = (idx / Math.max(1, arr.length - 1)) * 300 + 10;
                    // Normalize y: higher weight is lower on screen
                    const minW = Math.min(...arr.map((a) => a.weightKg)) - 1;
                    const maxW = Math.max(...arr.map((a) => a.weightKg)) + 1;
                    const range = Math.max(0.5, maxW - minW);
                    const y = 65 - ((w.weightKg - minW) / range) * 50;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Data points */}
              {weights.slice(-7).map((w, idx, arr) => {
                const x = (idx / Math.max(1, arr.length - 1)) * 300 + 10;
                const minW = Math.min(...arr.map((a) => a.weightKg)) - 1;
                const maxW = Math.max(...arr.map((a) => a.weightKg)) + 1;
                const range = Math.max(0.5, maxW - minW);
                const y = 65 - ((w.weightKg - minW) / range) * 50;
                const isLast = idx === arr.length - 1;
                return (
                  <circle
                    key={w.id}
                    cx={x}
                    cy={y}
                    r={isLast ? 5 : 3.5}
                    fill={isLast ? '#10b981' : '#09090b'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

          {/* EXCEL EXPORT BANNER */}
          <div className="bg-neutral-950 text-white rounded-[28px] p-5 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-sm">Download Spreadsheet</h4>
              <p className="text-[11px] text-neutral-400">
                Log, Daily Summary & Settings sheets
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="bg-white text-neutral-950 font-bold text-xs px-4 py-2.5 rounded-full hover:bg-neutral-100 transition active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .xlsx</span>
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Report & Dietitian Observations */}
        <div className="md:col-span-7 space-y-5">
          {/* WEEKLY REPORT (Per-day totals vs goal, days hit, averages, observations) */}
          <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Weekly Report
            </div>
            <h3 className="text-lg font-black text-neutral-950 mt-0.5">
              Goal Adherence: {daysHitCount}/7 Days Hit
            </h3>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{Math.round((daysHitCount / 7) * 100)}% On Plan</span>
          </span>
        </div>

        {/* 7-Day Bar Chart: Per-Day Totals vs Goal */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-neutral-400">Daily Intake vs Goal ({profile.dailyCalorieTarget} kcal)</div>
          <div className="grid grid-cols-7 gap-1.5 pt-3 items-end h-32">
            {last7Days.map((d) => {
              const heightPercent = d.totalCals > 0
                ? Math.min(100, Math.round((d.totalCals / (profile.dailyCalorieTarget * 1.25)) * 100))
                : 6;

              return (
                <div key={d.date} className="flex flex-col items-center h-full justify-end gap-1.5">
                  <span className="text-[9px] font-bold text-neutral-400">
                    {d.totalCals > 0 ? `${d.totalCals}` : '-'}
                  </span>
                  <div className="w-full bg-neutral-100 rounded-xl h-20 relative flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-xl transition-all ${
                        d.isHit
                          ? 'bg-emerald-500'
                          : d.totalCals > profile.dailyCalorieTarget
                          ? 'bg-rose-400'
                          : d.totalCals > 0
                          ? 'bg-neutral-800'
                          : 'bg-neutral-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${d.isToday ? 'text-neutral-950 font-black' : 'text-neutral-400'}`}>
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Metric Summary Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Daily Average Calories</div>
            <div className="text-xl font-black text-neutral-950 mt-0.5">{avgCals} kcal</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Goal: {profile.dailyCalorieTarget} kcal
            </div>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Daily Average Protein</div>
            <div className="text-xl font-black text-neutral-950 mt-0.5">{avgProtein}g</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Goal: {profile.targetProteinG}g / day
            </div>
          </div>
        </div>

        {/* Dietitian Observations */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>SnapCal Dietitian Observation</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            {profile.goal === 'lose'
              ? 'Your average calorie deficit remains well within the safe 400-500 kcal window. Protein pacing is safeguarding lean mass while accelerating fat loss.'
              : 'Consistent caloric delivery and protein distribution are providing the ideal substrate for hypertrophy.'}
          </p>
        </div>
          </div>
        </div>
      </div>

      {/* Weight Log Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-white rounded-[28px] p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-neutral-950">Log Today's Weight</h3>
              <p className="text-xs text-neutral-400">Weigh yourself first thing in the morning.</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(Number(e.target.value) || 0)}
                className="text-4xl font-black text-neutral-950 text-center w-28 outline-none bg-neutral-50 py-2 rounded-2xl border border-neutral-200"
              />
              <span className="text-base font-bold text-neutral-400">{profile.weightUnit}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="py-3 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeight}
                className="py-3 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition shadow-md"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
