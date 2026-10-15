import React, { useState } from 'react';
import { X, Shield, FileText, Mail, Cookie, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | 'cookies' | 'faq' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Question', message: '' });

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-[28px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-neutral-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-2.5">
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-emerald-600" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-blue-600" />}
            {activeModal === 'contact' && <Mail className="w-5 h-5 text-purple-600" />}
            {activeModal === 'cookies' && <Cookie className="w-5 h-5 text-amber-600" />}
            {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-neutral-800" />}
            <h3 className="text-xl font-extrabold text-neutral-950">
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service'}
              {activeModal === 'contact' && 'Contact Support'}
              {activeModal === 'cookies' && 'Cookie Policy'}
              {activeModal === 'faq' && 'Frequently Asked Questions'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {/* PRIVACY POLICY */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl text-xs font-medium">
                <strong>GDPR & CCPA Compliant:</strong> Your privacy is paramount. Camera access is strictly utilized in real-time to analyze food items. <strong>Your meal photos are not stored permanently or sold to third parties.</strong>
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">1. Camera & Visual Data</h4>
              <p>
                When you grant camera access or upload food photos, the imagery is transmitted encrypted via HTTPS directly to our secure AI inference endpoint to calculate nutritional estimates (calories, protein, carbohydrates, fat). Once the macro breakdown is returned to your device, the image data is disposed of from memory and is <strong>never permanently stored on our servers</strong>.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">2. Local Storage</h4>
              <p>
                Your profile settings, meal history, daily water tracking, and calculated Mifflin-St Jeor targets are stored locally in your browser’s localStorage. You retain full autonomy to clear or export your logs at any time.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">3. GDPR Data Subject Rights</h4>
              <p>
                Under the EU General Data Protection Regulation (GDPR), you possess the right to access, rectify, export, or erase your personal information. You can use our built-in “Export Calorie Log (.xlsx)” button to download your complete data footprint.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">4. Data Security</h4>
              <p>
                All data transmission between your browser and our servers uses industry-standard TLS 1.3 encryption.
              </p>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {activeModal === 'terms' && (
            <div className="space-y-4">
              <h4 className="font-bold text-neutral-900 text-sm">1. Agreement to Terms</h4>
              <p>
                By accessing or using SnapCal, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may discontinue use of the application.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">2. Medical Disclaimer</h4>
              <p>
                SnapCal provides general nutritional calculations based on clinical formulas (e.g. Mifflin-St Jeor) and AI computer vision estimates. It is not intended as medical advice or clinical diagnosis. Always consult a certified physician or registered dietitian before undertaking any significant caloric restriction or dietary modification.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">3. Subscriptions & Freemium Policy</h4>
              <p>
                Users receive free daily scans (2 scans on day 1, followed by 1 scan per day). Unlocking SnapCal Pro grants unlimited scans, enhanced weekly analytics, and custom macro distribution. Subscriptions renew automatically unless cancelled prior to the renewal date via user settings.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">4. Cancellation & Refunds</h4>
              <p>
                You may cancel anytime without penalty. All fees are in USD.
              </p>
            </div>
          )}

          {/* CONTACT US */}
          {activeModal === 'contact' && (
            <div>
              {contactSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-neutral-900">Message Received!</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Thank you for reaching out. Our support team will get back to you at <strong>{contactForm.email || 'your email'}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="text-xs font-bold text-neutral-900 underline mt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <p className="text-xs text-neutral-500">
                    Have feedback, questions about your meal scans, or need assistance? Reach out directly:
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Subject</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:border-neutral-950 focus:outline-none bg-white"
                    >
                      <option>General Question</option>
                      <option>Camera / Food Scan Feedback</option>
                      <option>Subscription / Billing</option>
                      <option>Dietitian Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="How can we help you today?"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-neutral-950 text-white font-bold py-3 rounded-full hover:bg-neutral-800 transition text-xs mt-2"
                  >
                    Send Message
                  </button>
                  <div className="text-center text-[11px] text-neutral-400 pt-1">
                    Direct Email: <a href="mailto:support@snapcal.app" className="underline font-semibold">support@snapcal.app</a>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* COOKIE POLICY */}
          {activeModal === 'cookies' && (
            <div className="space-y-4">
              <h4 className="font-bold text-neutral-900 text-sm">How SnapCal Uses Storage</h4>
              <p>
                SnapCal uses browser localStorage and session cookies exclusively for essential functionality, such as keeping you logged in, persisting your custom Mifflin-St Jeor daily calorie budget, caching logged meals, and honoring your scan quota.
              </p>
              <h4 className="font-bold text-neutral-900 text-sm">No Advertising or 3rd Party Trackers</h4>
              <p>
                We do not sell advertising space or inject tracking pixels from third-party advertising networks. Your nutrition data belongs solely to you.
              </p>
            </div>
          )}

          {/* FAQ */}
          {activeModal === 'faq' && (
            <div className="space-y-2">
              {[
                {
                  q: 'How does AI food scanning work?',
                  a: 'SnapCal passes your meal photo to Gemini Vision AI to recognize individual ingredients, compute volumetric portion estimates, and calculate total calories, protein, carbohydrates, fat, and a micronutrient Health Score (1-10).'
                },
                {
                  q: 'What is the Mifflin-St Jeor equation?',
                  a: 'The Mifflin-St Jeor formula is the clinically accepted gold standard for determining Basal Metabolic Rate (BMR) from your height, weight, age, and sex. Multiplied by your weekly activity factor, it accurately computes your Total Daily Energy Expenditure (TDEE).'
                },
                {
                  q: 'How do the free scans work?',
                  a: 'All users receive 2 free AI photo scans on their first day, and 1 free scan every day thereafter. SnapCal Pro unlocks unlimited scans anytime.'
                },
                {
                  q: 'Can I export my logs to Microsoft Excel?',
                  a: 'Yes! In the Progress or Profile tab, tap "Export Calorie Log (.xlsx)". It creates a clean 3-sheet spreadsheet with your Food Log, Daily Calorie Summaries, and User Profile Settings.'
                },
                {
                  q: 'Are my food photos saved on your servers?',
                  a: 'No. Visual images are sent securely for immediate AI estimation and are discarded immediately after processing.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border border-neutral-200/80 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-xs sm:text-sm text-neutral-950 flex items-center justify-between hover:bg-neutral-50 transition"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${faqOpenIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpenIndex === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-neutral-600 bg-neutral-50/50 border-t border-neutral-100 pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-6 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
