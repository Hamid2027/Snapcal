import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Flame, 
  Scale, 
  Ruler, 
  Activity, 
  Target, 
  ShieldCheck, 
  Bell, 
  Zap, 
  RotateCcw, 
  FileSpreadsheet, 
  ChevronRight,
  HelpCircle,
  FileText,
  Lock,
  Mail,
  Cookie,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MealItem } from '../../types';
import { saveStoredProfile } from '../../utils/nutrition';
import { exportCalorieLogExcel } from '../../utils/excelExport';

interface ProfilePageProps {
  profile: UserProfile;
  meals: MealItem[];
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenPaywall: () => void;
  onOpenLegal: (type: 'privacy' | 'terms' | 'contact' | 'cookies' | 'faq') => void;
  onRestartOnboarding: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  meals,
  onProfileUpdated,
  onOpenPaywall,
  onOpenLegal,
  onRestartOnboarding,
}) => {
  const [editingTarget, setEditingTarget] = useState<boolean>(false);
  const [calorieInput, setCalorieInput] = useState<number>(profile.dailyCalorieTarget);
  const [burnedCalsToggle, setBurnedCalsToggle] = useState<boolean>(profile.addBurnedCaloriesBack);
  const [notificationsToggle, setNotificationsToggle] = useState<boolean>(profile.notificationsEnabled);

  const handleSaveCalorieTarget = () => {
    const updated: UserProfile = {
      ...profile,
      dailyCalorieTarget: Number(calorieInput) || profile.dailyCalorieTarget,
      addBurnedCaloriesBack: burnedCalsToggle,
      notificationsEnabled: notificationsToggle,
    };
    saveStoredProfile(updated);
    onProfileUpdated(updated);
    setEditingTarget(false);

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
    });
  };

  const handleToggleBurned = () => {
    const nextVal = !burnedCalsToggle;
    setBurnedCalsToggle(nextVal);
    const updated = { ...profile, addBurnedCaloriesBack: nextVal };
    saveStoredProfile(updated);
    onProfileUpdated(updated);
  };

  const handleToggleNotifications = () => {
    const nextVal = !notificationsToggle;
    setNotificationsToggle(nextVal);
    const updated = { ...profile, notificationsEnabled: nextVal };
    saveStoredProfile(updated);
    onProfileUpdated(updated);
  };

  const handleExport = () => {
    exportCalorieLogExcel(profile, meals, []);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Account & Settings
          </span>
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">Profile</h1>
        </div>

        {/* Membership Badge / Upgrade */}
        <button
          onClick={profile.isPremium ? undefined : onOpenPaywall}
          style={profile.isPremium ? undefined : { backgroundColor: '#000000', color: '#FFFFFF' }}
          className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition shadow-xs ${
            profile.isPremium
              ? 'bg-neutral-950 text-white border border-neutral-800'
              : 'bg-[#000000] text-[#FFFFFF] font-bold hover:bg-neutral-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-white fill-white" />
          <span className="font-bold">{profile.isPremium ? 'SnapCal Pro' : 'Free Plan (Upgrade)'}</span>
        </button>
      </div>

      {/* USER BIOMETRIC SUMMARY CARD */}
      <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-950 text-white flex items-center justify-center font-black text-xl shadow-md">
            S
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-neutral-950 leading-tight">
              SnapCal Member
            </h3>
            <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
              <span className="capitalize font-bold text-neutral-800">
                Goal: {profile.goal} weight
              </span>
              <span>·</span>
              <span>{profile.diet}</span>
            </div>
          </div>
        </div>

        {/* Biometrics Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-center">
          <div className="bg-neutral-50 p-2.5 rounded-2xl">
            <span className="text-[9px] font-bold uppercase text-neutral-400">Current</span>
            <div className="text-xs font-black text-neutral-900 mt-0.5">
              {profile.currentWeightKg} {profile.weightUnit}
            </div>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-2xl">
            <span className="text-[9px] font-bold uppercase text-neutral-400">Target</span>
            <div className="text-xs font-black text-emerald-600 mt-0.5">
              {profile.idealWeightKg} {profile.weightUnit}
            </div>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-2xl">
            <span className="text-[9px] font-bold uppercase text-neutral-400">Height</span>
            <div className="text-xs font-black text-neutral-900 mt-0.5">
              {profile.heightCm} cm
            </div>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-2xl">
            <span className="text-[9px] font-bold uppercase text-neutral-400">Age</span>
            <div className="text-xs font-black text-neutral-900 mt-0.5">
              {profile.age} yrs
            </div>
          </div>
        </div>
      </div>

      {/* NUTRITION TARGETS & MIFFLIN-ST JEOR */}
      <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Mifflin-St Jeor Engine
            </span>
            <h3 className="font-extrabold text-base text-neutral-950">Daily Calorie Target</h3>
          </div>
          <button
            onClick={() => setEditingTarget(!editingTarget)}
            className="text-xs font-bold text-neutral-900 underline hover:text-neutral-700"
          >
            {editingTarget ? 'Cancel' : 'Edit Target'}
          </button>
        </div>

        {editingTarget ? (
          <div className="space-y-3 p-3 bg-neutral-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1000"
                max="5000"
                value={calorieInput}
                onChange={(e) => setCalorieInput(Number(e.target.value) || 0)}
                className="w-32 px-3 py-2 rounded-xl border border-neutral-300 font-black text-lg text-center bg-white"
              />
              <span className="text-xs font-bold text-neutral-500">kcal / day</span>
            </div>
            <button
              onClick={handleSaveCalorieTarget}
              className="w-full bg-neutral-950 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-neutral-800 transition"
            >
              Save Custom Target
            </button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-neutral-950">
                {profile.dailyCalorieTarget}
              </span>
              <span className="text-sm font-bold text-neutral-400">kcal</span>
            </div>
            <div className="text-right text-xs text-neutral-400 space-y-0.5">
              <div>BMR: {profile.bmr} kcal</div>
              <div>TDEE: {profile.tdee} kcal</div>
            </div>
          </div>
        )}

        {/* Macro Distribution */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-neutral-100">
          <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="text-[10px] font-bold uppercase text-blue-700">Protein</div>
            <div className="font-black text-blue-950 text-sm mt-0.5">{profile.targetProteinG}g</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="text-[10px] font-bold uppercase text-amber-700">Carbs</div>
            <div className="font-black text-amber-950 text-sm mt-0.5">{profile.targetCarbsG}g</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
            <div className="text-[10px] font-bold uppercase text-rose-700">Fat</div>
            <div className="font-black text-rose-950 text-sm mt-0.5">{profile.targetFatG}g</div>
          </div>
        </div>
      </div>

      {/* PREFERENCES & TOGGLES */}
      <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-neutral-950">Preferences</h3>

        {/* Color Palette Selector */}
        <div className="py-1">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <div className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <span>App Color Palette</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-extrabold">
                  Comfort Colors
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">Choose your soothing eye-friendly theme</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'emerald' as const, name: 'Calming Sage', dot: 'bg-emerald-500', subtitle: 'Serene botanical green' },
              { id: 'sunset' as const, name: 'Warm Honey', dot: 'bg-gradient-to-r from-amber-400 to-amber-600', subtitle: 'Cozy comforting amber' },
              { id: 'violet' as const, name: 'Soft Lavender', dot: 'bg-gradient-to-r from-purple-400 to-indigo-500', subtitle: 'Gentle iris & violet' },
              { id: 'ocean' as const, name: 'Nordic Ocean', dot: 'bg-gradient-to-r from-teal-400 to-cyan-500', subtitle: 'Peaceful sea breeze' },
            ].map((t) => {
              const isSelected = (profile.colorTheme || 'emerald') === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    const updated = { ...profile, colorTheme: t.id };
                    saveStoredProfile(updated);
                    onProfileUpdated(updated);
                    confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    isSelected
                      ? 'border-neutral-950 bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${t.dot} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{t.name}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {t.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add burned calories back */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 pt-3">
          <div>
            <div className="font-bold text-xs text-neutral-900">Add Calories Burned Back</div>
            <div className="text-[11px] text-neutral-400">Expands budget when workouts are logged</div>
          </div>
          <button
            onClick={handleToggleBurned}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              burnedCalsToggle ? 'bg-neutral-950' : 'bg-neutral-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                burnedCalsToggle ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 pt-3">
          <div>
            <div className="font-bold text-xs text-neutral-900">Meal Logging Notifications</div>
            <div className="text-[11px] text-neutral-400">Daily gentle nudges to keep your streak</div>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notificationsToggle ? 'bg-neutral-950' : 'bg-neutral-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notificationsToggle ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* DATA EXPORT & ACTIONS */}
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="w-full bg-white border border-neutral-200/80 p-4 rounded-[24px] shadow-sm hover:bg-neutral-50 transition flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-neutral-950">Export Calorie Log (.xlsx)</div>
              <div className="text-[11px] text-neutral-400">3 formatted sheets (Log, Daily Summary, Settings)</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <button
          onClick={onRestartOnboarding}
          className="w-full bg-white border border-neutral-200/80 p-4 rounded-[24px] shadow-sm hover:bg-rose-50/50 hover:border-rose-200 transition flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 group-hover:bg-rose-100 text-neutral-600 group-hover:text-rose-600 flex items-center justify-center transition">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-neutral-950 group-hover:text-rose-600 transition">
                Reset Onboarding & Personal Plan
              </div>
              <div className="text-[11px] text-neutral-400">Recalculate your goals from scratch</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-rose-400" />
        </button>
      </div>

      {/* FOOTER LEGAL & INFO LINKS */}
      <div className="pt-4 border-t border-neutral-100 space-y-3 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Information & Compliance
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-neutral-500">
          <button
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-neutral-950 transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Policy</span>
          </button>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('terms')}
            className="hover:text-neutral-950 transition flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Terms of Service</span>
          </button>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('contact')}
            className="hover:text-neutral-950 transition flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5 text-purple-600" />
            <span>Contact Us</span>
          </button>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('cookies')}
            className="hover:text-neutral-950 transition flex items-center gap-1"
          >
            <Cookie className="w-3.5 h-3.5 text-amber-600" />
            <span>Cookie Policy</span>
          </button>
          <span>·</span>
          <button
            onClick={() => onOpenLegal('faq')}
            className="hover:text-neutral-950 transition flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-700" />
            <span>FAQ</span>
          </button>
        </div>
        <div className="text-[10px] text-neutral-400 pt-1">
          SnapCal Inc. · Version 2.4.0 · Production Ready
        </div>
      </div>
    </div>
  );
};
