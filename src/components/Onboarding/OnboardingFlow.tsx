import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Flame, 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Dumbbell, 
  Footprints, 
  Bell, 
  Gift, 
  Star, 
  Sparkles, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, GoalType, SexType, WorkoutFrequency, ActivityLevel, DietType } from '../../types';
import { calculateNutritionTargets, kgToLbs, lbsToKg, cmToFeetInches, feetInchesToCm, saveStoredProfile } from '../../utils/nutrition';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  onSignIn?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSignIn }) => {
  const [step, setStep] = useState<number>(1);
  
  // Form State
  const [goal, setGoal] = useState<GoalType>('lose');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [currentWeight, setCurrentWeight] = useState<number>(78);
  const [idealWeight, setIdealWeight] = useState<number>(70);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [sex, setSex] = useState<SexType>('male');
  const [age, setAge] = useState<number>(27);
  const [workouts, setWorkouts] = useState<WorkoutFrequency>('3-5');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [diet, setDiet] = useState<DietType>('No specific diet');
  const [triedOtherApps, setTriedOtherApps] = useState<boolean>(true);
  const [referralSource, setReferralSource] = useState<string>('Instagram');
  const [showFakeIosModal, setShowFakeIosModal] = useState<boolean>(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(true);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralApplied, setReferralApplied] = useState<boolean>(false);
  const [potentialDays, setPotentialDays] = useState<'3' | '7' | '30'>('30');
  const [addBurnedCals, setAddBurnedCals] = useState<boolean>(false);

  // Calculation & Plan Generation State
  const [generatingProgress, setGeneratingProgress] = useState<number>(0);
  const [generatingStage, setGeneratingStage] = useState<string>('Analyzing your biological metrics...');
  const [calculatedPlan, setCalculatedPlan] = useState<any>(null);

  // Sync Height Ft/In with Cm
  useEffect(() => {
    if (heightUnit === 'ft') {
      const cm = feetInchesToCm(heightFt, heightIn);
      setHeightCm(cm);
    }
  }, [heightFt, heightIn, heightUnit]);

  // Handle fake iOS popup appearance at step 13
  useEffect(() => {
    if (step === 13) {
      setShowFakeIosModal(true);
    } else {
      setShowFakeIosModal(false);
    }
  }, [step]);

  // Handle 3-second generation at step 19
  useEffect(() => {
    if (step === 19) {
      setGeneratingProgress(0);
      const totalEffectiveWeight = weightUnit === 'lbs' ? lbsToKg(currentWeight) : currentWeight;
      const totalIdealWeight = weightUnit === 'lbs' ? lbsToKg(idealWeight) : idealWeight;
      const totalEffectiveHeight = heightUnit === 'ft' ? feetInchesToCm(heightFt, heightIn) : heightCm;

      const plan = calculateNutritionTargets(
        totalEffectiveWeight,
        totalEffectiveHeight,
        age,
        sex,
        workouts,
        activity,
        goal
      );
      setCalculatedPlan({
        ...plan,
        effectiveWeight: totalEffectiveWeight,
        effectiveIdeal: totalIdealWeight,
        effectiveHeight: totalEffectiveHeight,
      });

      const interval = setInterval(() => {
        setGeneratingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 10;
          if (next < 30) {
            setGeneratingStage('Calculating Basal Metabolic Rate (Mifflin-St Jeor)...');
          } else if (next < 65) {
            setGeneratingStage('Synthesizing optimal protein & macro allocation...');
          } else if (next < 90) {
            setGeneratingStage('Calibrating 90-day goal trajectory...');
          } else {
            setGeneratingStage('Plan finalized! Ready for launch.');
          }
          return next;
        });
      }, 280);

      return () => clearInterval(interval);
    }
  }, [step, weightUnit, currentWeight, idealWeight, heightUnit, heightCm, heightFt, heightIn, age, sex, workouts, activity, goal]);

  const handleNext = () => {
    // If step is 3 and goal is maintain, skip step 4 (ideal weight)
    if (step === 3 && goal === 'maintain') {
      setIdealWeight(currentWeight);
      setStep(5);
      return;
    }
    if (step < 19) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 5 && goal === 'maintain') {
      setStep(3);
      return;
    }
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinishOnboarding = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const now = new Date().toISOString();
    const todayStr = now.split('T')[0];

    const finalProfile: UserProfile = {
      name: 'SnapCal User',
      goal,
      currentWeightKg: weightUnit === 'lbs' ? lbsToKg(currentWeight) : currentWeight,
      idealWeightKg: goal === 'maintain' ? (weightUnit === 'lbs' ? lbsToKg(currentWeight) : currentWeight) : (weightUnit === 'lbs' ? lbsToKg(idealWeight) : idealWeight),
      weightUnit,
      heightCm: heightUnit === 'ft' ? feetInchesToCm(heightFt, heightIn) : heightCm,
      heightUnit,
      heightFeet: heightFt,
      heightInches: heightIn,
      sex,
      age,
      workoutsPerWeek: workouts,
      activityLevel: activity,
      diet,
      triedOtherApps,
      referralSource,
      referralCode: referralApplied ? referralCode : undefined,
      notificationsEnabled: notificationsAllowed,
      addBurnedCaloriesBack: addBurnedCals,
      bmr: calculatedPlan?.bmr || 1650,
      tdee: calculatedPlan?.tdee || 2350,
      dailyCalorieTarget: calculatedPlan?.dailyCalorieTarget || 2203,
      targetProteinG: calculatedPlan?.targetProteinG || 140,
      targetCarbsG: calculatedPlan?.targetCarbsG || 190,
      targetFatG: calculatedPlan?.targetFatG || 55,
      targetDate: calculatedPlan?.targetDate || 'Nov 14, 2026',
      onboardingCompleted: true,
      onboardingDate: now,
      firstDayDate: todayStr,
      isPremium: false,
      scansUsedToday: 0,
      lastScanDate: todayStr,
    };

    saveStoredProfile(finalProfile);
    onComplete(finalProfile);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-neutral-900 flex flex-col justify-between selection:bg-neutral-900 selection:text-white font-['Inter',sans-serif]">
      {/* Top Header / Progress Indicator */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 py-3 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {step > 1 && step < 19 ? (
            <button
              onClick={handleBack}
              aria-label="Previous step"
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 text-neutral-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg">
            <span className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-xs font-black shadow-sm">
              S
            </span>
            <span>SnapCal</span>
          </div>

          <div className="text-xs font-semibold text-neutral-400 w-12 text-right">
            {step > 1 && step < 19 ? `${step}/19` : ''}
          </div>
        </div>

        {/* Top Progress Line with vibrant gradient */}
        {step > 1 && step < 19 && (
          <div className="max-w-md mx-auto mt-2 h-1.5 w-full bg-neutral-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${(step / 19) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 sm:py-8">
        <div className="max-w-md w-full mx-auto">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center space-y-8 animate-fadeIn">
              <div className="relative inline-block mx-auto pt-4">
                <div className="w-24 h-24 rounded-3xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-xl shadow-black/10 ring-4 ring-neutral-100">
                  <Flame className="w-12 h-12 text-amber-400 fill-amber-400" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  AI Calorie
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
                  Calorie tracking <br />
                  <span className="text-neutral-500">made effortless</span>
                </h1>
                <p className="text-neutral-500 text-sm sm:text-base leading-relaxed px-4">
                  Snap a photo of your meal. Instant calorie & macro breakdown with personalized Mifflin-St Jeor nutrition goals.
                </p>
              </div>

              {/* Highlight cards */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-white p-3 rounded-[20px] border border-neutral-100 shadow-sm text-center">
                  <div className="text-lg font-bold text-neutral-950">0.8s</div>
                  <div className="text-[11px] text-neutral-400 font-medium">AI Photo Scan</div>
                </div>
                <div className="bg-white p-3 rounded-[20px] border border-neutral-100 shadow-sm text-center">
                  <div className="text-lg font-bold text-neutral-950">99.4%</div>
                  <div className="text-[11px] text-neutral-400 font-medium">Macro Precision</div>
                </div>
                <div className="bg-white p-3 rounded-[20px] border border-neutral-100 shadow-sm text-center">
                  <div className="text-lg font-bold text-neutral-950">10M+</div>
                  <div className="text-[11px] text-neutral-400 font-medium">Users Worldwide</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleNext}
                  className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-lg shadow-neutral-950/15 flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (onSignIn) {
                      onSignIn();
                    } else {
                      handleNext();
                    }
                  }}
                  className="w-full py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-950 transition"
                >
                  Already have an account? <span className="underline font-bold">Sign in</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHAT IS YOUR GOAL? */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step 1 of 4: Physical Baseline</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  What is your primary goal?
                </h2>
                <p className="text-sm text-neutral-500">
                  We'll customize your daily caloric intake and macro split accordingly.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'lose' as GoalType,
                    title: 'Lose Weight',
                    subtitle: 'Burn fat with a clinically calibrated 500 kcal deficit',
                    icon: <TrendingDown className="w-6 h-6 text-emerald-600" />,
                    badge: 'Most Popular',
                    bgActive: 'border-emerald-600 bg-gradient-to-r from-emerald-950 to-neutral-900 text-white shadow-lg shadow-emerald-950/20',
                    bgInactive: 'border-neutral-200/80 bg-white hover:border-emerald-300 text-neutral-900',
                    iconBg: 'bg-emerald-50 border border-emerald-100',
                  },
                  {
                    id: 'maintain' as GoalType,
                    title: 'Maintain Weight',
                    subtitle: 'Optimize metabolic health and eat at maintenance calories',
                    icon: <Minus className="w-6 h-6 text-sky-600" />,
                    badge: 'Longevity',
                    bgActive: 'border-sky-600 bg-gradient-to-r from-sky-950 to-neutral-900 text-white shadow-lg shadow-sky-950/20',
                    bgInactive: 'border-neutral-200/80 bg-white hover:border-sky-300 text-neutral-900',
                    iconBg: 'bg-sky-50 border border-sky-100',
                  },
                  {
                    id: 'gain' as GoalType,
                    title: 'Gain Weight / Build Muscle',
                    subtitle: 'Support lean muscle hypertrophy with a 400 kcal surplus',
                    icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
                    badge: 'Hypertrophy',
                    bgActive: 'border-violet-600 bg-gradient-to-r from-violet-950 to-neutral-900 text-white shadow-lg shadow-violet-950/20',
                    bgInactive: 'border-neutral-200/80 bg-white hover:border-violet-300 text-neutral-900',
                    iconBg: 'bg-violet-50 border border-violet-100',
                  },
                ].map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setGoal(option.id)}
                    className={`cursor-pointer p-4 rounded-[24px] border transition-all flex items-center justify-between ${
                      goal === option.id
                        ? option.bgActive
                        : option.bgInactive
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${goal === option.id ? 'bg-white/10' : option.iconBg}`}>
                        {option.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{option.title}</h3>
                          {option.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              goal === option.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {option.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${goal === option.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {option.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      goal === option.id ? 'border-white bg-white text-neutral-950' : 'border-neutral-300'
                    }`}>
                      {goal === option.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3: HOW MUCH DO YOU WEIGH? */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step 2 of 4: Physical Baseline</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  How much do you weigh?
                </h2>
                <p className="text-sm text-neutral-500">
                  Needed to calculate your baseline resting energy expenditure.
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex justify-center">
                <div className="bg-neutral-100 p-1 rounded-full flex gap-1">
                  <button
                    onClick={() => {
                      if (weightUnit === 'lbs') {
                        setCurrentWeight(lbsToKg(currentWeight));
                        setIdealWeight(lbsToKg(idealWeight));
                      }
                      setWeightUnit('kg');
                    }}
                    className={`px-6 py-1.5 text-xs font-bold rounded-full transition ${
                      weightUnit === 'kg' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    onClick={() => {
                      if (weightUnit === 'kg') {
                        setCurrentWeight(kgToLbs(currentWeight));
                        setIdealWeight(kgToLbs(idealWeight));
                      }
                      setWeightUnit('lbs');
                    }}
                    className={`px-6 py-1.5 text-xs font-bold rounded-full transition ${
                      weightUnit === 'lbs' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>

              {/* Weight Card & Stepper */}
              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value) || 0)}
                    className="text-5xl font-black text-neutral-950 text-center w-36 outline-none bg-transparent"
                  />
                  <span className="text-2xl font-bold text-neutral-400">{weightUnit}</span>
                </div>

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => setCurrentWeight((prev) => Math.max(30, Math.round((prev - 1) * 10) / 10))}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setCurrentWeight((prev) => Math.round((prev + 1) * 10) / 10)}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 4: WHAT IS YOUR IDEAL WEIGHT? (Only if Lose or Gain) */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Target Benchmark</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  What is your ideal weight?
                </h2>
                <p className="text-sm text-neutral-500">
                  We will project a healthy 90-day milestone curve for you.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    value={idealWeight}
                    onChange={(e) => setIdealWeight(Number(e.target.value) || 0)}
                    className="text-5xl font-black text-neutral-950 text-center w-36 outline-none bg-transparent"
                  />
                  <span className="text-2xl font-bold text-neutral-400">{weightUnit}</span>
                </div>

                <div className="text-xs font-semibold text-neutral-500 mt-2">
                  {goal === 'lose' ? (
                    <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                      Target to drop {Math.abs(Math.round((currentWeight - idealWeight) * 10) / 10)} {weightUnit}
                    </span>
                  ) : (
                    <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-bold">
                      Target to build {Math.abs(Math.round((idealWeight - currentWeight) * 10) / 10)} {weightUnit}
                    </span>
                  )}
                </div>

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => setIdealWeight((prev) => Math.max(30, Math.round((prev - 1) * 10) / 10))}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setIdealWeight((prev) => Math.round((prev + 1) * 10) / 10)}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 5: WHAT IS YOUR HEIGHT? */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step 3 of 4: Physical Baseline</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  What is your height?
                </h2>
                <p className="text-sm text-neutral-500">
                  Used in the Mifflin-St Jeor equation to compute body surface area.
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex justify-center">
                <div className="bg-neutral-100 p-1 rounded-full flex gap-1">
                  <button
                    onClick={() => setHeightUnit('cm')}
                    className={`px-6 py-1.5 text-xs font-bold rounded-full transition ${
                      heightUnit === 'cm' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    onClick={() => {
                      const { feet, inches } = cmToFeetInches(heightCm);
                      setHeightFt(feet);
                      setHeightIn(inches);
                      setHeightUnit('ft');
                    }}
                    className={`px-6 py-1.5 text-xs font-bold rounded-full transition ${
                      heightUnit === 'ft' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    ft + in
                  </button>
                </div>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 text-center shadow-sm">
                {heightUnit === 'cm' ? (
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      min="120"
                      max="240"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
                      className="text-5xl font-black text-neutral-950 text-center w-36 outline-none bg-transparent"
                    />
                    <span className="text-2xl font-bold text-neutral-400">cm</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="3"
                        max="7"
                        value={heightFt}
                        onChange={(e) => setHeightFt(Number(e.target.value) || 0)}
                        className="text-4xl font-black text-neutral-950 text-center w-16 outline-none bg-transparent"
                      />
                      <span className="text-lg font-bold text-neutral-400">ft</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={heightIn}
                        onChange={(e) => setHeightIn(Number(e.target.value) || 0)}
                        className="text-4xl font-black text-neutral-950 text-center w-16 outline-none bg-transparent"
                      />
                      <span className="text-lg font-bold text-neutral-400">in</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (heightUnit === 'cm') {
                        setHeightCm((prev) => Math.max(120, prev - 1));
                      } else {
                        const newIn = heightIn - 1;
                        if (newIn < 0) {
                          setHeightFt((f) => Math.max(3, f - 1));
                          setHeightIn(11);
                        } else {
                          setHeightIn(newIn);
                        }
                      }
                    }}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (heightUnit === 'cm') {
                        setHeightCm((prev) => prev + 1);
                      } else {
                        const newIn = heightIn + 1;
                        if (newIn > 11) {
                          setHeightFt((f) => f + 1);
                          setHeightIn(0);
                        } else {
                          setHeightIn(newIn);
                        }
                      }
                    }}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 6: CHOOSE YOUR SEX */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step 4 of 4: Physical Baseline</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Choose your biological sex
                </h2>
                <p className="text-sm text-neutral-500">
                  Essential for Mifflin-St Jeor metabolic rate formula accuracy.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'male' as SexType, title: 'Male', description: 'Metabolic baseline adjustment: +5' },
                  { id: 'female' as SexType, title: 'Female', description: 'Metabolic baseline adjustment: -161' },
                  { id: 'other' as SexType, title: 'Other / Non-Binary', description: 'Neutral composite biological average' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSex(item.id)}
                    className={`cursor-pointer p-5 rounded-[24px] border transition-all flex items-center justify-between ${
                      sex === item.id
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <p className={`text-xs mt-0.5 ${sex === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.description}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      sex === item.id ? 'border-white bg-white text-neutral-950' : 'border-neutral-300'
                    }`}>
                      {sex === item.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 7: HOW OLD ARE YOU? */}
          {step === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Demographics</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  How old are you?
                </h2>
                <p className="text-sm text-neutral-500">
                  Metabolic efficiency naturally shifts with age.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-8 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="14"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(Math.min(80, Math.max(14, Number(e.target.value) || 14)))}
                    className="text-6xl font-black text-neutral-950 text-center w-32 outline-none bg-transparent"
                  />
                  <span className="text-xl font-bold text-neutral-400">years</span>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => setAge((prev) => Math.max(14, prev - 1))}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setAge((prev) => Math.min(80, prev + 1))}
                    className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-xl font-bold hover:bg-neutral-100 transition active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 8: WORKOUTS PER WEEK */}
          {step === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Activity & Training</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  How many workouts per week?
                </h2>
                <p className="text-sm text-neutral-500">
                  Gym, running, sports, HIIT, or structured strength sessions.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: '0-2' as WorkoutFrequency,
                    title: '0 - 2 workouts / week',
                    desc: 'Occasional light exercise or walking',
                    badge: 'Casual',
                    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&auto=format&fit=crop&q=80',
                  },
                  {
                    id: '3-5' as WorkoutFrequency,
                    title: '3 - 5 workouts / week',
                    desc: 'Regular fitness regimen, lifting or cardio',
                    badge: 'Recommended',
                    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
                  },
                  {
                    id: '6+' as WorkoutFrequency,
                    title: '6+ workouts / week',
                    desc: 'Dedicated athlete or high volume training',
                    badge: 'Athlete',
                    img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setWorkouts(item.id)}
                    className={`cursor-pointer p-4 rounded-[24px] border transition-all flex items-center justify-between ${
                      workouts === item.id
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{item.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            workouts === item.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${workouts === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                      workouts === item.id ? 'border-white bg-white text-neutral-950' : 'border-neutral-300'
                    }`}>
                      {workouts === item.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 9: HOW ACTIVE ARE YOU DAILY? */}
          {step === 9 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Non-Exercise Activity</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  How active are you daily?
                </h2>
                <p className="text-sm text-neutral-500">
                  Your general movement outside of designated gym workouts.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'low' as ActivityLevel, title: 'Not very active', desc: 'Desk job, mostly sitting, under 5,000 steps/day' },
                  { id: 'moderate' as ActivityLevel, title: 'Moderately active', desc: 'Standing, walking frequently, 5,000 - 10,000 steps' },
                  { id: 'high' as ActivityLevel, title: 'Very active', desc: 'Constantly on feet, manual work, 10,000+ steps/day' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActivity(item.id)}
                    className={`cursor-pointer p-5 rounded-[24px] border transition-all flex items-center justify-between ${
                      activity === item.id
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <p className={`text-xs mt-0.5 ${activity === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      activity === item.id ? 'border-white bg-white text-neutral-950' : 'border-neutral-300'
                    }`}>
                      {activity === item.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 10: DO YOU FOLLOW A SPECIFIC DIET? */}
          {step === 10 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Dietary Preferences</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Do you follow a specific diet?
                </h2>
                <p className="text-sm text-neutral-500">
                  We'll suggest appropriate meal macro targets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'No specific diet',
                  'Flexitarian',
                  'Pescatarian',
                  'Vegetarian',
                  'Vegan',
                  'Low-carb',
                  'Keto',
                  'Paleo',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setDiet(item as DietType)}
                    className={`p-3.5 rounded-[20px] border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                      diet === item
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <span>{item}</span>
                    {diet === item && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 11: HAVE YOU TRIED OTHER CALORIE TRACKING APPS? */}
          {step === 11 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Experience</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Have you tried other calorie tracking apps?
                </h2>
                <p className="text-sm text-neutral-500">
                  Apps like MyFitnessPal, Lose It!, or Noom.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: true, label: 'Yes, I have', desc: 'Manual logging felt tedious and time consuming' },
                  { value: false, label: 'No, this is my first time', desc: 'Starting fresh with seamless AI visual logging' },
                ].map((item) => (
                  <div
                    key={String(item.value)}
                    onClick={() => setTriedOtherApps(item.value)}
                    className={`cursor-pointer p-5 rounded-[24px] border transition-all flex items-center justify-between ${
                      triedOtherApps === item.value
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-base">{item.label}</h3>
                      <p className={`text-xs mt-0.5 ${triedOtherApps === item.value ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      triedOtherApps === item.value ? 'border-white bg-white text-neutral-950' : 'border-neutral-300'
                    }`}>
                      {triedOtherApps === item.value && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 12: WHERE DID YOU HEAR ABOUT US? */}
          {step === 12 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Discovery</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Where did you hear about us?
                </h2>
                <p className="text-sm text-neutral-500">
                  Help us know how you found SnapCal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Instagram',
                  'Facebook',
                  'TikTok',
                  'YouTube',
                  'Google',
                  'X',
                  'Friend',
                  'Play Store',
                ].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => setReferralSource(channel)}
                    className={`p-4 rounded-[22px] border text-left font-medium text-sm transition-all flex items-center justify-between ${
                      referralSource === channel
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <span>{channel}</span>
                    {referralSource === channel && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-4 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 13: FAKE IOS NOTIFICATION POPUP */}
          {step === 13 && (
            <div className="space-y-6 animate-fadeIn relative">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Stay consistent with smart reminders
                </h2>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  Users who enable notifications are 3.8x more likely to hit their target goal weight.
                </p>
              </div>

              {/* Pointing hand indicator */}
              <div className="text-center text-3xl animate-bounce pt-2">
                👇
              </div>

              {/* Fake iOS System Dialog Box */}
              <div className="relative mx-auto max-w-xs bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-2xl rounded-[24px] overflow-hidden text-center transform transition-transform">
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-neutral-950 text-base leading-snug">
                    “SnapCal” Would Like to Send You Notifications
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Notifications may include meal logging nudges, streak updates, and milestone alerts.
                  </p>
                </div>
                <div className="border-t border-neutral-100 grid grid-cols-2 text-sm font-semibold divide-x divide-neutral-100">
                  <button
                    onClick={() => {
                      setNotificationsAllowed(false);
                      handleNext();
                    }}
                    className="py-3.5 text-blue-500 hover:bg-neutral-50 active:bg-neutral-100 transition"
                  >
                    Don’t Allow
                  </button>
                  <button
                    onClick={() => {
                      setNotificationsAllowed(true);
                      handleNext();
                    }}
                    className="py-3.5 text-blue-600 font-bold hover:bg-neutral-50 active:bg-neutral-100 transition"
                  >
                    Allow
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 14: ENTER REFERRAL CODE (OPTIONAL) */}
          {step === 14 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Bonus Perks</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Have a referral code?
                </h2>
                <p className="text-sm text-neutral-500">
                  Enter your friend or coach's invite code to unlock bonus scan perks.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 shadow-sm space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. VIP2026 or FRIEND"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 font-mono text-center tracking-widest text-lg font-bold uppercase focus:border-neutral-950 focus:outline-none"
                  />
                  {referralApplied && (
                    <div className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1 mt-2">
                      <Check className="w-3.5 h-3.5" /> Code applied successfully!
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (referralCode.trim().length > 0) {
                      setReferralApplied(true);
                    }
                  }}
                  className="w-full bg-neutral-100 text-neutral-900 font-bold py-3 rounded-full hover:bg-neutral-200 transition text-sm"
                >
                  Apply Code
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-lg shadow-neutral-950/10"
                >
                  Continue
                </button>
                <button
                  onClick={handleNext}
                  className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* STEP 15: SOCIAL PROOF */}
          {step === 15 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Trusted Community
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Join over 10 million people like you
                </h2>
                <p className="text-sm text-neutral-500">
                  Real users hitting sustainable body composition goals every single day.
                </p>
              </div>

              {/* Big Metrics Grid */}
              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 shadow-sm grid grid-cols-3 divide-x divide-neutral-100 text-center">
                <div className="px-2">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xl">
                    <span>4.8</span>
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium mt-0.5">Average Rating</div>
                </div>
                <div className="px-2">
                  <div className="font-black text-xl text-neutral-950">300K+</div>
                  <div className="text-[11px] text-neutral-400 font-medium mt-0.5">App Ratings</div>
                </div>
                <div className="px-2">
                  <div className="font-black text-xl text-neutral-950">10M+</div>
                  <div className="text-[11px] text-neutral-400 font-medium mt-0.5">Active Users</div>
                </div>
              </div>

              {/* Avatars */}
              <div className="flex items-center justify-center -space-x-3 py-1">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                ].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-neutral-950 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  +10M
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-[22px] border border-neutral-100 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">Sarah M., 29</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    “The camera scanning is unreal. I used to quit other apps after 3 days because typing every ingredient was annoying. Lost 14 lbs in 8 weeks!”
                  </p>
                </div>

                <div className="bg-white p-4 rounded-[22px] border border-neutral-100 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">David K., 34</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    “Finally an app with zero clutter. The macro target based on Mifflin-St Jeor hit my maintenance numbers perfectly.”
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 16: POTENTIAL SCREEN (Weight Transition Graph) */}
          {step === 16 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Projected Trajectory</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  You have great potential to crush your goal
                </h2>
                <p className="text-sm text-neutral-500">
                  Based on your metabolic data and commitment to SnapCal.
                </p>
              </div>

              {/* Time Horizon Selector */}
              <div className="flex justify-center">
                <div className="bg-neutral-100 p-1 rounded-full flex gap-1">
                  {(['3', '7', '30'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setPotentialDays(d)}
                      className={`px-5 py-1.5 text-xs font-bold rounded-full transition ${
                        potentialDays === d ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-500'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Transition SVG Graph */}
              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-400">Start: {currentWeight} {weightUnit}</span>
                  <span className="text-neutral-950 font-black">
                    {potentialDays === '3' ? (
                      goal === 'lose' ? `${(currentWeight - 0.5).toFixed(1)} ${weightUnit}` : `${(currentWeight + 0.3).toFixed(1)} ${weightUnit}`
                    ) : potentialDays === '7' ? (
                      goal === 'lose' ? `${(currentWeight - 1.2).toFixed(1)} ${weightUnit}` : `${(currentWeight + 0.7).toFixed(1)} ${weightUnit}`
                    ) : (
                      goal === 'lose' ? `${(currentWeight - 4.5).toFixed(1)} ${weightUnit}` : `${(currentWeight + 2.8).toFixed(1)} ${weightUnit}`
                    )}
                  </span>
                </div>

                {/* SVG Curve */}
                <div className="h-44 w-full relative flex items-center justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientCurve" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {goal === 'lose' ? (
                      <>
                        <path
                          d="M 10 20 Q 160 30 310 95 L 310 120 L 10 120 Z"
                          fill="url(#gradientCurve)"
                        />
                        <path
                          d="M 10 20 Q 160 30 310 95"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="10" cy="20" r="5" fill="#09090b" />
                        <circle cx="310" cy="95" r="6" fill="#10b981" />
                      </>
                    ) : goal === 'gain' ? (
                      <>
                        <path
                          d="M 10 95 Q 160 85 310 20 L 310 120 L 10 120 Z"
                          fill="url(#gradientCurve)"
                        />
                        <path
                          d="M 10 95 Q 160 85 310 20"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="10" cy="95" r="5" fill="#09090b" />
                        <circle cx="310" cy="20" r="6" fill="#3b82f6" />
                      </>
                    ) : (
                      <>
                        <path
                          d="M 10 60 Q 160 55 310 60"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="10" cy="60" r="5" fill="#09090b" />
                        <circle cx="310" cy="60" r="6" fill="#6366f1" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 flex items-center gap-3 text-xs text-neutral-600">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    {goal === 'lose'
                      ? 'Consistent calorie tracking predicts ~1.1 lbs fat loss per week without extreme hunger.'
                      : 'Structured macro tracking supports lean mass gains while preventing unwanted excess fat.'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 17: ADD CALORIES BURNED BACK? */}
          {step === 17 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Expenditure Logic</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                  Add calories burned back to your daily goal?
                </h2>
                <p className="text-sm text-neutral-500">
                  Choose how workouts affect your daily calorie budget.
                </p>
              </div>

              {/* Visual Example Card */}
              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Example Scenario</div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-100">
                  <span className="text-neutral-600">Base Daily Target:</span>
                  <span className="font-bold text-neutral-950">2,000 kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-100">
                  <span className="text-neutral-600 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Running Workout:
                  </span>
                  <span className="font-bold text-emerald-600">+400 kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold pt-1">
                  <span>If enabled:</span>
                  <span className="text-neutral-950 font-black">2,400 kcal budget</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setAddBurnedCals(false)}
                  className={`cursor-pointer p-5 rounded-[24px] border transition-all text-center ${
                    !addBurnedCals
                      ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                  }`}
                >
                  <h3 className="font-bold text-lg">No</h3>
                  <p className={`text-xs mt-1 ${!addBurnedCals ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Strict deficit (Recommended for fastest fat loss)
                  </p>
                </div>

                <div
                  onClick={() => setAddBurnedCals(true)}
                  className={`cursor-pointer p-5 rounded-[24px] border transition-all text-center ${
                    addBurnedCals
                      ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300 text-neutral-900'
                  }`}
                >
                  <h3 className="font-bold text-lg">Yes</h3>
                  <p className={`text-xs mt-1 ${addBurnedCals ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Add calories burned back to eat more
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base mt-2 shadow-lg shadow-neutral-950/10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 18: THANK YOU & PERSONALIZING */}
          {step === 18 && (
            <div className="text-center space-y-6 py-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">
                  Thank you for trusting us!
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-sm mx-auto">
                  Now let’s synthesize your biological parameters and generate your custom Mifflin-St Jeor plan...
                </p>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-[28px] p-5 shadow-sm space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-700">Mifflin-St Jeor metabolic model calibrated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-700">Lean muscle protein threshold optimized</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-700">Camera vision scanner initialized</span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-neutral-950 text-white font-semibold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-lg shadow-neutral-950/10"
              >
                Generate My Custom Plan
              </button>
            </div>
          )}

          {/* STEP 19: GENERATING / CALCULATION & PLAN REVEAL */}
          {step === 19 && (
            <div className="space-y-6 py-2 animate-fadeIn">
              {generatingProgress < 100 ? (
                <div className="text-center space-y-8 py-10">
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#f3f4f6"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#09090b"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * generatingProgress) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xl font-black text-neutral-950 font-mono">
                      {generatingProgress}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-neutral-950">
                      Time to generate your custom plan!
                    </h2>
                    <p className="text-sm text-neutral-500 animate-pulse font-medium">
                      {generatingStage}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Plan Ready
                    </span>
                    <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                      Your Personalized Nutrition Blueprint
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Calculated using clinical Mifflin-St Jeor energetics.
                    </p>
                  </div>

                  {/* Big Target Card */}
                  <div className="bg-neutral-950 text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                      Daily Calorie Target
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-black tracking-tight">
                        {calculatedPlan?.dailyCalorieTarget}
                      </span>
                      <span className="text-lg font-bold text-neutral-400">kcal / day</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-neutral-800 text-xs">
                      <div>
                        <div className="text-neutral-400">Basal Metabolic Rate (BMR)</div>
                        <div className="text-base font-bold text-white mt-0.5">{calculatedPlan?.bmr} kcal</div>
                      </div>
                      <div>
                        <div className="text-neutral-400">Total Expenditure (TDEE)</div>
                        <div className="text-base font-bold text-white mt-0.5">{calculatedPlan?.tdee} kcal</div>
                      </div>
                    </div>
                  </div>

                  {/* Macro Distribution Cards */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white p-4 rounded-[22px] border border-neutral-200/80 text-center shadow-sm">
                      <div className="text-xs text-neutral-400 font-bold uppercase">Protein</div>
                      <div className="text-xl font-black text-neutral-950 mt-1">{calculatedPlan?.targetProteinG}g</div>
                      <div className="text-[10px] text-neutral-500 font-medium">Muscle & Satiety</div>
                    </div>
                    <div className="bg-white p-4 rounded-[22px] border border-neutral-200/80 text-center shadow-sm">
                      <div className="text-xs text-neutral-400 font-bold uppercase">Carbs</div>
                      <div className="text-xl font-black text-neutral-950 mt-1">{calculatedPlan?.targetCarbsG}g</div>
                      <div className="text-[10px] text-neutral-500 font-medium">Daily Energy</div>
                    </div>
                    <div className="bg-white p-4 rounded-[22px] border border-neutral-200/80 text-center shadow-sm">
                      <div className="text-xs text-neutral-400 font-bold uppercase">Fat</div>
                      <div className="text-xl font-black text-neutral-950 mt-1">{calculatedPlan?.targetFatG}g</div>
                      <div className="text-[10px] text-neutral-500 font-medium">Hormonal Health</div>
                    </div>
                  </div>

                  {/* Milestone projection */}
                  <div className="bg-white p-4 rounded-[22px] border border-neutral-200/80 flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        90d
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900">Projected Milestone</div>
                        <div className="text-neutral-500">Hit target weight by {calculatedPlan?.targetDate}</div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      On Track
                    </span>
                  </div>

                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full bg-neutral-950 text-white font-bold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-xl shadow-neutral-950/15 flex items-center justify-center gap-2"
                  >
                    <span>Enter SnapCal Dashboard</span>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-neutral-400 border-t border-neutral-100">
        SnapCal · Clinical Mifflin-St Jeor Energy Formulation · Secure & Private
      </footer>
    </div>
  );
};
