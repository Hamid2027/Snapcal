import * as XLSX from 'xlsx';
import { MealItem, UserProfile, WeightEntry } from '../types';

export function exportCalorieLogExcel(
  profile: UserProfile,
  meals: MealItem[],
  weights: WeightEntry[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. SHEET: Log (all logged food items)
  const logRows = meals.map((meal) => {
    const dateObj = new Date(meal.loggedAt);
    return {
      'Date': dateObj.toLocaleDateString(),
      'Time': dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      'Category': meal.category,
      'Food Name': meal.name,
      'Portion': meal.portion,
      'Multiplier': meal.portionMultiplier || 1,
      'Calories (kcal)': Math.round(meal.calories * (meal.portionMultiplier || 1)),
      'Protein (g)': Math.round(meal.protein * (meal.portionMultiplier || 1)),
      'Carbs (g)': Math.round(meal.carbs * (meal.portionMultiplier || 1)),
      'Fat (g)': Math.round(meal.fat * (meal.portionMultiplier || 1)),
      'Health Score (/10)': meal.healthScore || 8.5,
      'Source': meal.source,
      'Notes': meal.notes || '',
    };
  });
  const wsLog = XLSX.utils.json_to_sheet(logRows.length > 0 ? logRows : [
    { 'Date': 'No meals logged yet', 'Calories (kcal)': 0 }
  ]);
  XLSX.utils.book_append_sheet(wb, wsLog, 'Log');

  // 2. SHEET: Daily Summary (aggregated per calendar day)
  const groupedByDate: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    count: number;
  }> = {};

  meals.forEach((m) => {
    const dayKey = new Date(m.loggedAt).toISOString().split('T')[0];
    const mult = m.portionMultiplier || 1;
    if (!groupedByDate[dayKey]) {
      groupedByDate[dayKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    }
    groupedByDate[dayKey].calories += Math.round(m.calories * mult);
    groupedByDate[dayKey].protein += Math.round(m.protein * mult);
    groupedByDate[dayKey].carbs += Math.round(m.carbs * mult);
    groupedByDate[dayKey].fat += Math.round(m.fat * mult);
    groupedByDate[dayKey].count += 1;
  });

  const dailySummaryRows = Object.keys(groupedByDate).sort().reverse().map((day) => {
    const stats = groupedByDate[day];
    const diff = stats.calories - profile.dailyCalorieTarget;
    const isHit = Math.abs(diff) <= 100 || (profile.goal === 'lose' && diff <= 0) || (profile.goal === 'gain' && diff >= 0);
    return {
      'Date': day,
      'Total Consumed (kcal)': stats.calories,
      'Target Budget (kcal)': profile.dailyCalorieTarget,
      'Difference (kcal)': diff > 0 ? `+${diff}` : `${diff}`,
      'Target Status': isHit ? 'Target Hit ✅' : 'Off Target',
      'Total Protein (g)': stats.protein,
      'Total Carbs (g)': stats.carbs,
      'Total Fat (g)': stats.fat,
      'Meals Logged': stats.count,
    };
  });

  const wsDaily = XLSX.utils.json_to_sheet(dailySummaryRows.length > 0 ? dailySummaryRows : [
    { 'Date': new Date().toISOString().split('T')[0], 'Total Consumed (kcal)': 0, 'Target Budget (kcal)': profile.dailyCalorieTarget }
  ]);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Summary');

  // 3. SHEET: Settings (user personal targets & Mifflin-St Jeor configuration)
  const settingsRows = [
    { 'Setting': 'Application', 'Value': 'SnapCal AI Calorie Tracker' },
    { 'Setting': 'Export Date', 'Value': new Date().toLocaleString() },
    { 'Setting': 'User Goal', 'Value': profile.goal.toUpperCase() },
    { 'Setting': 'Current Weight', 'Value': `${profile.currentWeightKg} kg (${Math.round(profile.currentWeightKg * 2.20462)} lbs)` },
    { 'Setting': 'Ideal Target Weight', 'Value': `${profile.idealWeightKg} kg (${Math.round(profile.idealWeightKg * 2.20462)} lbs)` },
    { 'Setting': 'Height', 'Value': `${profile.heightCm} cm` },
    { 'Setting': 'Age', 'Value': `${profile.age} years old` },
    { 'Setting': 'Sex', 'Value': profile.sex.toUpperCase() },
    { 'Setting': 'Workouts per Week', 'Value': profile.workoutsPerWeek },
    { 'Setting': 'Daily Activity Level', 'Value': profile.activityLevel },
    { 'Setting': 'Diet Preference', 'Value': profile.diet },
    { 'Setting': 'Mifflin-St Jeor BMR', 'Value': `${profile.bmr} kcal/day` },
    { 'Setting': 'Total Daily Energy Expenditure (TDEE)', 'Value': `${profile.tdee} kcal/day` },
    { 'Setting': 'Daily Calorie Target', 'Value': `${profile.dailyCalorieTarget} kcal` },
    { 'Setting': 'Target Protein', 'Value': `${profile.targetProteinG} g` },
    { 'Setting': 'Target Carbohydrates', 'Value': `${profile.targetCarbsG} g` },
    { 'Setting': 'Target Fat', 'Value': `${profile.targetFatG} g` },
    { 'Setting': 'Add Burned Calories Back', 'Value': profile.addBurnedCaloriesBack ? 'Yes' : 'No' },
    { 'Setting': '90-Day Target Milestone Date', 'Value': profile.targetDate },
    { 'Setting': 'Membership Tier', 'Value': profile.isPremium ? 'SnapCal Premium Pro' : 'Free Tier' },
  ];

  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

  // Download XLSX file
  XLSX.writeFile(wb, 'calorie-log.xlsx');
}
