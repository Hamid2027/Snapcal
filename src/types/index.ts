export type GoalType = 'lose' | 'maintain' | 'gain';
export type SexType = 'male' | 'female' | 'other';
export type WorkoutFrequency = '0-2' | '3-5' | '6+';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type DietType =
  | 'No specific diet'
  | 'Flexitarian'
  | 'Pescatarian'
  | 'Vegetarian'
  | 'Vegan'
  | 'Low-carb'
  | 'Keto'
  | 'Paleo';

export interface UserProfile {
  name: string;
  goal: GoalType;
  currentWeightKg: number;
  idealWeightKg: number;
  weightUnit: 'kg' | 'lbs';
  heightCm: number;
  heightUnit: 'cm' | 'ft';
  heightFeet?: number;
  heightInches?: number;
  sex: SexType;
  age: number;
  workoutsPerWeek: WorkoutFrequency;
  activityLevel: ActivityLevel;
  diet: DietType;
  triedOtherApps: boolean;
  referralSource: string;
  referralCode?: string;
  notificationsEnabled: boolean;
  addBurnedCaloriesBack: boolean;
  // Calculated Nutrition Targets
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetDate: string; // 90 days projection
  // Onboarding status
  onboardingCompleted: boolean;
  onboardingDate: string;
  // Freemium / Subscription state
  isPremium: boolean;
  subscriptionPlan?: 'annual' | 'quarterly';
  firstDayDate: string;
  scansUsedToday: number;
  lastScanDate: string;
  colorTheme?: 'emerald' | 'sunset' | 'violet' | 'ocean';
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  portion: string;
  portionMultiplier: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  loggedAt: string; // ISO string
  imageUrl?: string;
  source: 'camera' | 'text' | 'database';
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
}

export interface DailySummary {
  date: string;
  consumedCalories: number;
  burnedCalories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealsCount: number;
  waterMl: number;
  isHit: boolean;
}
