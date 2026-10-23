import React, { useState, useEffect } from 'react';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredMeals, 
  saveStoredMeals, 
  getDefaultSeedMeals 
} from './utils/nutrition';
import { UserProfile, MealItem } from './types';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { HomeDashboard } from './components/Dashboard/HomeDashboard';
import { FoodScanner } from './components/Scanner/FoodScanner';
import { ProgressPage } from './components/Progress/ProgressPage';
import { ProfilePage } from './components/Profile/ProfilePage';
import { BottomNav, NavTab } from './components/Navigation/BottomNav';
import { PaywallModal } from './components/Paywall/PaywallModal';
import { ManualLogModal } from './components/ManualLog/ManualLogModal';
import { LegalModals, LegalModalType } from './components/Modals/LegalModals';
import { WebHeader } from './components/Navigation/WebHeader';
import { Download } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const stored = getStoredProfile();
    if (stored) {
      if (!stored.dailyCalorieTarget || stored.dailyCalorieTarget === 1950 || stored.dailyCalorieTarget === 1850) {
        stored.dailyCalorieTarget = 2203;
        saveStoredProfile(stored);
      }
      return stored;
    }
    const initial: UserProfile = {
      name: 'Scancalai Member',
      goal: 'lose',
      currentWeightKg: 78,
      idealWeightKg: 70,
      weightUnit: 'kg',
      heightCm: 175,
      heightUnit: 'cm',
      sex: 'male',
      age: 27,
      workoutsPerWeek: '3-5',
      activityLevel: 'moderate',
      diet: 'No specific diet',
      triedOtherApps: true,
      referralSource: 'Instagram',
      notificationsEnabled: true,
      addBurnedCaloriesBack: false,
      bmr: 1730,
      tdee: 2450,
      dailyCalorieTarget: 2203,
      targetProteinG: 156,
      targetCarbsG: 195,
      targetFatG: 60,
      targetDate: 'Nov 14, 2026',
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString(),
      firstDayDate: new Date().toISOString().split('T')[0],
      isPremium: false,
      scansUsedToday: 0,
      lastScanDate: new Date().toISOString().split('T')[0],
      colorTheme: 'emerald',
    };
    saveStoredProfile(initial);
    return initial;
  });

  const [meals, setMeals] = useState<MealItem[]>(() => {
    const stored = getStoredMeals();
    if (!stored || stored.length === 0) {
      return getDefaultSeedMeals();
    }
    return stored;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Modals state
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isManualLogOpen, setIsManualLogOpen] = useState<boolean>(false);
  const [manualLogCategory, setManualLogCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    // Ensure seed meals (290 breakfast + 480 lunch = 770) are active for today if no today meals exist
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter((m) => {
      try {
        return new Date(m.loggedAt).toISOString().split('T')[0] === todayStr;
      } catch {
        return false;
      }
    });

    if (todayMeals.length === 0) {
      const seed = getDefaultSeedMeals();
      setMeals(seed);
      saveStoredMeals(seed);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleMealLogged = (newMeal: MealItem) => {
    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    saveStoredMeals(updatedMeals);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMeal = (mealId: string) => {
    const updated = meals.filter((m) => m.id !== mealId);
    setMeals(updated);
    saveStoredMeals(updated);
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleRestartOnboarding = () => {
    if (window.confirm('Restart onboarding? Your logged meals will be kept.')) {
      if (profile) {
        const resetProfile = { ...profile, onboardingCompleted: false };
        setProfile(resetProfile);
        saveStoredProfile(resetProfile);
      } else {
        setProfile(null);
      }
    }
  };

  // If onboarding not completed, render full 19-Step Onboarding Flow (Cal AI style)
  if (!profile || !profile.onboardingCompleted) {
    return (
      <OnboardingFlow
        onComplete={(newProfile) => {
          setProfile(newProfile);
          if (meals.length === 0) {
            const seed = getDefaultSeedMeals();
            setMeals(seed);
            saveStoredMeals(seed);
          }
          setCurrentTab('home');
        }}
        onSignIn={() => {
          const sampleProfile: UserProfile = {
            name: 'Scancalai Member',
            goal: 'lose',
            currentWeightKg: 78,
            idealWeightKg: 70,
            weightUnit: 'kg',
            heightCm: 175,
            heightUnit: 'cm',
            sex: 'male',
            age: 27,
            workoutsPerWeek: '3-5',
            activityLevel: 'moderate',
            diet: 'No specific diet',
            triedOtherApps: true,
            referralSource: 'Instagram',
            notificationsEnabled: true,
            addBurnedCaloriesBack: false,
            bmr: 1730,
            tdee: 2450,
            dailyCalorieTarget: 2203,
            targetProteinG: 156,
            targetCarbsG: 195,
            targetFatG: 60,
            targetDate: 'Nov 14, 2026',
            onboardingCompleted: true,
            onboardingDate: new Date().toISOString(),
            firstDayDate: new Date().toISOString().split('T')[0],
            isPremium: false,
            scansUsedToday: 0,
            lastScanDate: new Date().toISOString().split('T')[0],
            colorTheme: 'emerald',
          };
          setProfile(sampleProfile);
          saveStoredProfile(sampleProfile);
          if (meals.length === 0) {
            const seed = getDefaultSeedMeals();
            setMeals(seed);
            saveStoredMeals(seed);
          }
          setCurrentTab('home');
        }}
      />
    );
  }

  const themeClass = profile?.colorTheme ? `bg-theme-${profile.colorTheme}` : 'bg-theme-emerald';

  return (
    <div className={`min-h-screen ${themeClass} text-neutral-900 selection:bg-neutral-900 selection:text-white font-['Inter',system-ui,-apple-system,sans-serif] flex flex-col justify-between transition-colors duration-500`}>
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <aside aria-label="App Installation" className="bg-neutral-950 text-white px-4 py-2.5 text-xs flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white text-neutral-950 font-black flex items-center justify-center text-[10px]">
              S
            </span>
            <span className="font-semibold">Install Scancalai App for full-screen camera access</span>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-neutral-950 font-bold px-3 py-1 rounded-full text-[11px] hover:bg-neutral-100 transition active:scale-95 flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
        </aside>
      )}

      {/* App Top Bar */}
      <WebHeader
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        profile={profile}
        meals={meals}
        onOpenScanner={() => setCurrentTab('scan')}
        onOpenManualLog={() => {
          setManualLogCategory('Lunch');
          setIsManualLogOpen(true);
        }}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onSelectTheme={(theme) => {
          const updated = { ...profile, colorTheme: theme };
          handleProfileUpdated(updated);
        }}
      />

      {/* Main App Container (Mobile-First 4-Tab View) */}
      <main className="flex-1 w-full max-w-md md:max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* TAB 1: HOME DASHBOARD */}
        {currentTab === 'home' && (
          <HomeDashboard
            profile={profile}
            meals={meals}
            onOpenScanner={() => setCurrentTab('scan')}
            onOpenManualLog={(cat) => {
              setManualLogCategory(cat || 'Lunch');
              setIsManualLogOpen(true);
            }}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onDeleteMeal={handleDeleteMeal}
            onSelectTheme={(theme) => {
              const updated = { ...profile, colorTheme: theme };
              handleProfileUpdated(updated);
            }}
          />
        )}

        {/* TAB 2: SCAN FOOD */}
        {currentTab === 'scan' && (
          <FoodScanner
            profile={profile}
            onMealLogged={handleMealLogged}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {/* TAB 3: PROGRESS & ANALYTICS */}
        {currentTab === 'progress' && (
          <ProgressPage
            profile={profile}
            meals={meals}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        )}

        {/* TAB 4: PROFILE & SETTINGS */}
        {currentTab === 'profile' && (
          <ProfilePage
            profile={profile}
            meals={meals}
            onProfileUpdated={handleProfileUpdated}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenLegal={(type) => setLegalModal(type)}
            onRestartOnboarding={handleRestartOnboarding}
          />
        )}
      </main>

      {/* App Footer Links - Available on all screens */}
      <footer className="border-t border-neutral-200/60 mt-12 pt-6 pb-28 sm:pb-8 text-center">
        <div className="max-w-md mx-auto px-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-neutral-400 font-semibold">
          <button
            onClick={() => setLegalModal('privacy')}
            className="hover:text-neutral-700 transition"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setLegalModal('terms')}
            className="hover:text-neutral-700 transition"
          >
            Terms of Service
          </button>
          <span>·</span>
          <button
            onClick={() => setLegalModal('contact')}
            className="hover:text-neutral-700 transition"
          >
            Contact Us
          </button>
          <span>·</span>
          <button
            onClick={() => setLegalModal('cookies')}
            className="hover:text-neutral-700 transition"
          >
            Cookie Policy
          </button>
          <span>·</span>
          <button
            onClick={() => setLegalModal('faq')}
            className="hover:text-neutral-700 transition"
          >
            FAQ
          </button>
        </div>
        <div className="text-[10px] text-neutral-400 mt-2.5">
          © {new Date().getFullYear()} Scancalai · Cal AI Experience · All rights reserved
        </div>
      </footer>

      {/* Bottom Navigation (4 App Tabs: Home, Scan, Progress, Profile) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Full-Screen Paywall Modal */}
      <PaywallModal
        profile={profile}
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={(updated) => {
          setProfile(updated);
          setIsPaywallOpen(false);
        }}
        onOpenPrivacy={() => {
          setIsPaywallOpen(false);
          setLegalModal('privacy');
        }}
        onOpenTerms={() => {
          setIsPaywallOpen(false);
          setLegalModal('terms');
        }}
      />

      {/* Manual Add Food Modal */}
      <ManualLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        onMealLogged={handleMealLogged}
        initialCategory={manualLogCategory}
      />

      {/* Legal & Info Modals (Privacy, Terms, Contact, Cookies, FAQ) */}
      <LegalModals
        activeModal={legalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}
