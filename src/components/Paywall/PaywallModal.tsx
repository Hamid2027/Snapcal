import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';
import { saveStoredProfile } from '../../utils/nutrition';

interface PaywallModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: UserProfile) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'quarterly'>('annual');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetWeightDisplay = `${profile.idealWeightKg} ${profile.weightUnit || 'kg'}`;
  const targetDateDisplay = profile.targetDate || 'in 90 days';

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
      const updated: UserProfile = {
        ...profile,
        isPremium: true,
        subscriptionPlan: selectedPlan,
      };
      saveStoredProfile(updated);
      setIsProcessing(false);
      onSuccess(updated);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-[36px] sm:rounded-[32px] p-6 sm:p-8 max-h-[96vh] overflow-y-auto relative shadow-2xl border border-neutral-100 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition active:scale-95 z-10"
          aria-label="Close premium paywall"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Monster Illustration holding Apple, Carrot, Broccoli */}
        <div className="flex justify-center pt-2 pb-3">
          <svg
            className="w-36 h-36 sm:w-44 sm:h-44"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Friendly Monster Body */}
            <defs>
              <linearGradient id="monsterGrad" x1="40" y1="30" x2="160" y2="180">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="bellyGrad" x1="70" y1="90" x2="130" y2="160">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>

            {/* Monster Horns */}
            <path d="M60 55 C50 35 35 40 45 65 Z" fill="#34d399" />
            <path d="M140 55 C150 35 165 40 155 65 Z" fill="#34d399" />

            {/* Monster Round Body */}
            <rect x="42" y="45" width="116" height="120" rx="58" fill="url(#monsterGrad)" />

            {/* Belly highlight */}
            <ellipse cx="100" cy="120" rx="38" ry="32" fill="url(#bellyGrad)" />

            {/* Eyes */}
            <circle cx="78" cy="85" r="14" fill="#ffffff" />
            <circle cx="122" cy="85" r="14" fill="#ffffff" />
            <circle cx="81" cy="85" r="7" fill="#09090b" />
            <circle cx="125" cy="85" r="7" fill="#09090b" />
            <circle cx="83" cy="82" r="2.5" fill="#ffffff" />
            <circle cx="127" cy="82" r="2.5" fill="#ffffff" />

            {/* Cheeks */}
            <circle cx="64" cy="98" r="6" fill="#f43f5e" opacity="0.4" />
            <circle cx="136" cy="98" r="6" fill="#f43f5e" opacity="0.4" />

            {/* Cute Smile with Tiny Fang */}
            <path d="M86 102 Q100 115 114 102" stroke="#09090b" strokeWidth="3" strokeLinecap="round" />
            <polygon points="98,104 102,104 100,109" fill="#ffffff" />

            {/* Left Arm holding Apple 🍎 */}
            <path d="M46 110 Q28 120 38 135" stroke="#059669" strokeWidth="12" strokeLinecap="round" />
            {/* Apple */}
            <circle cx="36" cy="138" r="14" fill="#ef4444" />
            <circle cx="44" cy="138" r="14" fill="#dc2626" />
            <path d="M40 124 C40 120 44 116 48 116" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 120 Q48 116 52 122 Z" fill="#22c55e" />

            {/* Right Arm holding Carrot 🥕 and Broccoli 🥦 */}
            <path d="M154 110 Q172 120 162 135" stroke="#059669" strokeWidth="12" strokeLinecap="round" />
            {/* Carrot */}
            <polygon points="152,148 168,142 166,168" fill="#f97316" />
            <path d="M152,148 L168,142" stroke="#ea580c" strokeWidth="2" />
            <path d="M157 142 L152 134 M162 141 L163 132 M166 143 L172 135" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />

            {/* Broccoli hovering near center hand */}
            <ellipse cx="100" cy="158" rx="10" ry="8" fill="#15803d" />
            <circle cx="94" cy="154" r="7" fill="#16a34a" />
            <circle cx="106" cy="154" r="7" fill="#22c55e" />
            <rect x="98" y="160" width="4" height="8" rx="2" fill="#86efac" />

            {/* Monster Feet */}
            <ellipse cx="75" cy="166" rx="14" ry="7" fill="#047857" />
            <ellipse cx="125" cy="166" rx="14" ry="7" fill="#047857" />
          </svg>
        </div>

        {/* Title & Goal Target Date */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 leading-tight">
            We'll help you {profile.goal === 'gain' ? 'build muscle' : 'lose weight'} to hit{' '}
            <span className="text-emerald-600 underline decoration-emerald-300">{targetWeightDisplay}</span> by{' '}
            <span className="text-neutral-900 font-black">{targetDateDisplay}</span>!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            Unlimited AI food scanning, custom macro adjustments, and advanced weekly analytics.
          </p>
        </div>

        {/* 2 PRICING OPTIONS ONLY */}
        <div className="space-y-3 mb-6">
          {/* OPTION 1: 12 MONTHS (MOST POPULAR - GREEN BADGE - SELECTED BY DEFAULT) */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`cursor-pointer relative p-4 sm:p-5 rounded-[24px] border-2 transition-all flex items-center justify-between ${
              selectedPlan === 'annual'
                ? 'border-neutral-950 bg-neutral-50 shadow-md ring-1 ring-neutral-950'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            {/* Green Badge */}
            <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>MOST POPULAR · SAVE 50%</span>
            </div>

            <div className="flex items-center gap-3 mt-1 sm:mt-0">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPlan === 'annual'
                    ? 'border-neutral-950 bg-neutral-950 text-white'
                    : 'border-neutral-300'
                }`}
              >
                {selectedPlan === 'annual' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div>
                <div className="font-extrabold text-neutral-950 text-base">12 Months (Annual)</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <span className="line-through text-neutral-400 font-semibold">$59.99</span>
                  <span className="font-bold text-neutral-900">$29.99 / year</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    $2.50/mo
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-neutral-950">$2.50</div>
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">per month</div>
            </div>
          </div>

          {/* OPTION 2: 3 MONTHS */}
          <div
            onClick={() => setSelectedPlan('quarterly')}
            className={`cursor-pointer p-4 sm:p-5 rounded-[24px] border-2 transition-all flex items-center justify-between ${
              selectedPlan === 'quarterly'
                ? 'border-neutral-950 bg-neutral-50 shadow-md ring-1 ring-neutral-950'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPlan === 'quarterly'
                    ? 'border-neutral-950 bg-neutral-950 text-white'
                    : 'border-neutral-300'
                }`}
              >
                {selectedPlan === 'quarterly' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div>
                <div className="font-extrabold text-neutral-950 text-base">3 Months (Quarterly)</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  <span className="font-bold text-neutral-900">$19.99 billed every 3 months</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-black text-neutral-950">$6.66</div>
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">per month</div>
            </div>
          </div>
        </div>

        {/* 5-Star Review */}
        <div className="bg-neutral-50 rounded-[22px] p-3.5 mb-5 border border-neutral-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 shrink-0">
            A
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-neutral-900">Adam, 24</span>
              <span className="text-neutral-400 text-[10px]">· Verified User</span>
            </div>
            <p className="text-neutral-600 font-medium italic">
              “The best calorie counting app on the market!”
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-neutral-950 text-white font-bold py-4 px-6 rounded-full hover:bg-neutral-800 transition active:scale-[0.99] text-base shadow-xl shadow-neutral-950/20 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="animate-pulse">Activating SnapCal Pro...</span>
            ) : (
              <>
                <span>Continue</span>
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cancel anytime in your settings. No questions asked.</span>
            </div>

            <div className="flex justify-center items-center gap-3 text-[11px] text-neutral-400">
              <button
                type="button"
                onClick={onOpenTerms}
                className="underline hover:text-neutral-700"
              >
                Terms of Use
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="underline hover:text-neutral-700"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
