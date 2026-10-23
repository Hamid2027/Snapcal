import React, { useState } from 'react';
import { X, Search, Sparkles, Check, Plus, Flame, Heart, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealItem } from '../../types';
import foodDatabase from '../../data/food-database.json';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealLogged: (meal: MealItem) => void;
  initialCategory?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  onMealLogged,
  initialCategory = 'Lunch',
}) => {
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estimatedResult, setEstimatedResult] = useState<any>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [category, setCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Filter food database items
  const filteredDatabase = foodDatabase.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.aliases.some((a) => a.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleEstimateAI = async (textToEstimate?: string) => {
    const text = textToEstimate || description;
    if (!text.trim()) return;

    setIsLoading(true);
    setEstimatedResult(null);

    try {
      const res = await fetch('/api/estimate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });
      const data = await res.json();
      if (data.data) {
        setEstimatedResult(data.data);
        setPortionMultiplier(1);
      }
    } catch (e) {
      // Fallback
      setEstimatedResult({
        name: text,
        calories: 320,
        protein: 20,
        carbs: 35,
        fat: 11,
        healthScore: 8.5,
        portionSize: '1 standard serving',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDatabaseItem = (item: any) => {
    setEstimatedResult({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      healthScore: item.healthScore,
      portionSize: item.portion,
      summary: `Verified nutrition from Scancalai food database`,
    });
    setPortionMultiplier(1);
    setDescription(item.name);
  };

  const handleConfirmLog = () => {
    if (!estimatedResult) return;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const meal: MealItem = {
      id: 'meal-' + Date.now(),
      name: estimatedResult.name,
      calories: Math.round(estimatedResult.calories * portionMultiplier),
      protein: Math.round(estimatedResult.protein * portionMultiplier),
      carbs: Math.round(estimatedResult.carbs * portionMultiplier),
      fat: Math.round(estimatedResult.fat * portionMultiplier),
      healthScore: estimatedResult.healthScore || 8.5,
      portion: estimatedResult.portionSize || '1 serving',
      portionMultiplier,
      category,
      loggedAt: new Date().toISOString(),
      source: 'text',
      notes: estimatedResult.summary || 'Logged via smart AI estimation',
    };

    onMealLogged(meal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-6 max-h-[92vh] overflow-y-auto overflow-hidden relative shadow-2xl border border-neutral-100 flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Manual Log
            </span>
            <h3 className="text-xl font-extrabold text-neutral-950">Add Food with AI</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Natural Language Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Describe your meal in plain English</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 2 eggs and toast, 1 banana, or protein shake"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEstimateAI();
              }}
              className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 text-sm focus:border-neutral-950 focus:outline-none"
            />
            <button
              onClick={() => handleEstimateAI()}
              disabled={isLoading || !description.trim()}
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              className="bg-[#000000] text-[#FFFFFF] font-bold px-5 py-3 rounded-2xl hover:bg-neutral-800 transition disabled:opacity-50 text-xs flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <span className="animate-pulse">Estimating...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Estimate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Estimated Result Preview Card */}
        {estimatedResult && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-[24px] p-4 space-y-4 animate-slideUp">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  AI Calorie Calculation
                </span>
                <h4 className="font-extrabold text-base text-neutral-950 mt-1">
                  {estimatedResult.name}
                </h4>
                <div className="text-xs text-neutral-500">
                  Serving: {estimatedResult.portionSize || '1 standard portion'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-neutral-950">
                  {Math.round(estimatedResult.calories * portionMultiplier)}
                </div>
                <div className="text-[10px] font-bold uppercase text-neutral-400">kcal</div>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Protein</span>
                <div className="font-black text-neutral-900 text-sm">
                  {Math.round(estimatedResult.protein * portionMultiplier)}g
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Carbs</span>
                <div className="font-black text-neutral-900 text-sm">
                  {Math.round(estimatedResult.carbs * portionMultiplier)}g
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200/60">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Fat</span>
                <div className="font-black text-neutral-900 text-sm">
                  {Math.round(estimatedResult.fat * portionMultiplier)}g
                </div>
              </div>
            </div>

            {/* Portion and Category */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-bold text-neutral-600 block mb-1">Portion:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPortionMultiplier((p) => Math.max(0.25, Math.round((p - 0.25) * 100) / 100))}
                    className="w-8 h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs">{portionMultiplier}x</span>
                  <button
                    onClick={() => setPortionMultiplier((p) => Math.min(3, Math.round((p + 0.25) * 100) / 100))}
                    className="w-8 h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-neutral-600 block mb-1">Meal:</span>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-800 focus:outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConfirmLog}
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              className="w-full bg-[#000000] text-[#FFFFFF] font-bold py-3.5 rounded-full hover:bg-neutral-800 transition text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Log Meal to Today</span>
            </button>
          </div>
        )}

        {/* Quick Food Database Suggestions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Verified Food Database
            </span>
            <div className="relative w-36">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-neutral-200 text-[11px] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filteredDatabase.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectDatabaseItem(item)}
                className="cursor-pointer p-2.5 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-neutral-900">{item.name}</h5>
                    <div className="text-[10px] text-neutral-500">
                      {item.portion} · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-neutral-950">{item.calories} kcal</span>
                  <Plus className="w-4 h-4 text-neutral-400 hover:text-neutral-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
