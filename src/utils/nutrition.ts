import { UserProfile, GoalType, SexType, WorkoutFrequency, ActivityLevel, MealItem, WeightEntry, WaterLog } from '../types';
import { safeStorage } from './safeStorage';

export const STORAGE_KEYS = {
  PROFILE: 'scancalai_user_profile',
  MEALS: 'scancalai_meals',
  WEIGHTS: 'scancalai_weight_history',
  WATER: 'scancalai_water_logs',
  FAVORITES: 'scancalai_favorite_foods',
};

// Auto-migrate legacy 'snapcal_' keys to 'scancalai_' on initialization
export function migrateOldStorageKeys(): void {
  try {
    const keyPairs = [
      ['snapcal_user_profile', 'scancalai_user_profile'],
      ['snapcal_meals', 'scancalai_meals'],
      ['snapcal_weight_history', 'scancalai_weight_history'],
      ['snapcal_water_logs', 'scancalai_water_logs'],
      ['snapcal_favorite_foods', 'scancalai_favorite_foods'],
    ];

    for (const [oldKey, newKey] of keyPairs) {
      const oldVal = safeStorage.get(oldKey);
      if (oldVal !== null && safeStorage.get(newKey) === null) {
        safeStorage.set(newKey, oldVal);
      }
    }

    // Migrate any other snapcal_ keys
    const totalKeys = safeStorage.length;
    for (let i = 0; i < totalKeys; i++) {
      const key = safeStorage.key(i);
      if (key && key.startsWith('snapcal_')) {
        const correspondingNewKey = key.replace(/^snapcal_/, 'scancalai_');
        if (safeStorage.getItem(correspondingNewKey) === null) {
          const val = safeStorage.getItem(key);
          if (val !== null) {
            safeStorage.setItem(correspondingNewKey, val);
          }
        }
      }
    }
  } catch (err) {
    // Graceful fallback for restricted environments
  }
}

// Execute migration immediately
migrateOldStorageKeys();

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

// Safe Storage helpers (with Brave / private browsing in-memory fallback)
export function getStoredProfile(): UserProfile | null {
  try {
    const data = safeStorage.get(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    safeStorage.set(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Handled
  }
}

export function getStoredMeals(): MealItem[] {
  try {
    const data = safeStorage.get(STORAGE_KEYS.MEALS);
    if (!data) return getDefaultSeedMeals();
    return JSON.parse(data);
  } catch {
    return getDefaultSeedMeals();
  }
}

export function saveStoredMeals(meals: MealItem[]): void {
  try {
    safeStorage.set(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch {
    // Handled
  }
}

export function getStoredWeights(): WeightEntry[] {
  try {
    const data = safeStorage.get(STORAGE_KEYS.WEIGHTS);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveStoredWeights(weights: WeightEntry[]): void {
  try {
    safeStorage.set(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
  } catch {
    // Handled
  }
}

export function getStoredWater(date: string): number {
  try {
    const data = safeStorage.get(STORAGE_KEYS.WATER);
    if (!data) return 0;
    const logs: WaterLog[] = JSON.parse(data);
    const found = logs.find((l) => l.date === date);
    return found ? found.ml : 0;
  } catch {
    return 0;
  }
}

export function saveStoredWater(date: string, ml: number): void {
  try {
    const data = safeStorage.get(STORAGE_KEYS.WATER);
    let logs: WaterLog[] = data ? JSON.parse(data) : [];
    const index = logs.findIndex((l) => l.date === date);
    if (index >= 0) {
      logs[index].ml = ml;
    } else {
      logs.push({ date, ml });
    }
    safeStorage.set(STORAGE_KEYS.WATER, JSON.stringify(logs));
  } catch {
    // Handled
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
