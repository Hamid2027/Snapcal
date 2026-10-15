import { UserProfile, GoalType, SexType, WorkoutFrequency, ActivityLevel, MealItem, WeightEntry, WaterLog } from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'snapcal_user_profile',
  MEALS: 'snapcal_meals',
  WEIGHTS: 'snapcal_weight_history',
  WATER: 'snapcal_water_logs',
  FAVORITES: 'snapcal_favorite_foods',
};

// Conversions
export const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 10) / 10;
export const lbsToKg = (lbs: number): number => Math.round((lbs / 2.20462) * 10) / 10;
export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};
export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

// Mifflin-St Jeor Formula
export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: SexType): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') {
    return Math.round(base + 5);
  } else if (sex === 'female') {
    return Math.round(base - 161);
  } else {
    // Other / non-binary standard average
    return Math.round(base - 78);
  }
}

export function getActivityMultiplier(workouts: WorkoutFrequency, activity: ActivityLevel): number {
  if (activity === 'low') {
    if (workouts === '0-2') return 1.2;
    if (workouts === '3-5') return 1.35;
    return 1.45;
  } else if (activity === 'moderate') {
    if (workouts === '0-2') return 1.375;
    if (workouts === '3-5') return 1.55;
    return 1.65;
  } else {
    // High activity
    if (workouts === '0-2') return 1.5;
    if (workouts === '3-5') return 1.7;
    return 1.85;
  }
}

export function calculateNutritionTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: SexType,
  workouts: WorkoutFrequency,
  activity: ActivityLevel,
  goal: GoalType
): {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetDate: string;
} {
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  const multiplier = getActivityMultiplier(workouts, activity);
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.max(1200, tdee - 500); // 500 kcal safe deficit
  } else if (goal === 'gain') {
    targetCalories = tdee + 400; // 400 kcal lean muscle surplus
  }

  // Protein: High quality ~ 2.0g per kg of weight (ideal for satiety & muscle retention)
  let proteinGrams = Math.round(weightKg * 2.0);
  const minProtein = Math.round((targetCalories * 0.20) / 4);
  const maxProtein = Math.round((targetCalories * 0.35) / 4);
  proteinGrams = Math.min(Math.max(proteinGrams, minProtein), maxProtein);

  // Fat: 28% of total calories (9 kcal/g)
  const fatGrams = Math.round((targetCalories * 0.28) / 9);

  // Carbs: Remaining calories (4 kcal/g)
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const remainingCals = Math.max(200, targetCalories - (proteinCals + fatCals));
  const carbsGrams = Math.round(remainingCals / 4);

  // Target Date: 90 days from today
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + 90);
  const targetDateStr = targetDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    bmr,
    tdee,
    dailyCalorieTarget: targetCalories,
    targetProteinG: proteinGrams,
    targetCarbsG: carbsGrams,
    targetFatG: fatGrams,
    targetDate: targetDateStr,
  };
}

// LocalStorage helpers
export function getStoredProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading user profile from localStorage', e);
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed writing user profile to localStorage', e);
  }
}

export function getStoredMeals(): MealItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!data) return getDefaultSeedMeals();
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed reading meals from localStorage', e);
    return [];
  }
}

export function saveStoredMeals(meals: MealItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed writing meals to localStorage', e);
  }
}

export function getStoredWeights(): WeightEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveStoredWeights(weights: WeightEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
  } catch (e) {
    console.error('Failed writing weight entries', e);
  }
}

export function getStoredWater(date: string): number {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATER);
    if (!data) return 0;
    const logs: WaterLog[] = JSON.parse(data);
    const found = logs.find((l) => l.date === date);
    return found ? found.ml : 0;
  } catch (e) {
    return 0;
  }
}

export function saveStoredWater(date: string, ml: number): void {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATER);
    let logs: WaterLog[] = data ? JSON.parse(data) : [];
    const index = logs.findIndex((l) => l.date === date);
    if (index >= 0) {
      logs[index].ml = ml;
    } else {
      logs.push({ date, ml });
    }
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed saving water log', e);
  }
}

// Freemium scan allowance logic
export function getScanAllowance(profile: UserProfile): {
  allowedToday: number;
  usedToday: number;
  remainingToday: number;
  canScan: boolean;
  isFirstDay: boolean;
} {
  if (profile.isPremium) {
    return {
      allowedToday: 9999,
      usedToday: profile.scansUsedToday || 0,
      remainingToday: 9999,
      canScan: true,
      isFirstDay: false,
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDay = profile.firstDayDate || profile.onboardingDate?.split('T')[0] || todayStr;
  const isFirstDay = firstDay === todayStr;

  const allowedToday = isFirstDay ? 2 : 1;
  const usedToday = profile.lastScanDate === todayStr ? (profile.scansUsedToday || 0) : 0;
  const remainingToday = Math.max(0, allowedToday - usedToday);

  return {
    allowedToday,
    usedToday,
    remainingToday,
    canScan: remainingToday > 0,
    isFirstDay,
  };
}

export function recordScanUsed(profile: UserProfile): UserProfile {
  if (profile.isPremium) {
    return profile;
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const isSameDay = profile.lastScanDate === todayStr;
  const updatedProfile: UserProfile = {
    ...profile,
    lastScanDate: todayStr,
    scansUsedToday: isSameDay ? (profile.scansUsedToday || 0) + 1 : 1,
  };
  saveStoredProfile(updatedProfile);
  return updatedProfile;
}

// Initial realistic seed meals for a pleasant first impression
export function getDefaultSeedMeals(): MealItem[] {
  const today = new Date().toISOString();
  return [
    {
      id: 'seed-1',
      name: '2 Soft Boiled Eggs & Sourdough Toast',
      category: 'Breakfast',
      calories: 290,
      protein: 18,
      carbs: 24,
      fat: 12,
      healthScore: 9.3,
      portion: '1 plate',
      portionMultiplier: 1,
      loggedAt: today,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
      source: 'database',
      notes: 'Whole grain sourdough with pasture-raised eggs'
    },
    {
      id: 'seed-2',
      name: 'Grilled Herb Chicken Bowl with Quinoa',
      category: 'Lunch',
      calories: 480,
      protein: 46,
      carbs: 42,
      fat: 11,
      healthScore: 9.6,
      portion: '1 bowl (350g)',
      portionMultiplier: 1,
      loggedAt: today,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      source: 'camera',
      notes: 'High protein lean lunch'
    }
  ];
}
