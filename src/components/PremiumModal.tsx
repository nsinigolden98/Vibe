import React, { useState } from 'react';
import { X, Crown, Sparkles, Palette, BarChart3, Lock, VolumeX, Pin, Edit3, Check } from 'lucide-react';
import { initializePayment, createSubscription } from '@/services/paystackService';
import { soundManager } from '@/sounds/SoundManager';
import type { User } from '@/types';
import { PREMIUM_PRICES } from '@/types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpgrade: () => void;
}

type PlanType = 'monthly' | '6months' | 'yearly';

const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgrade
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const features = [
    { icon: Palette, text: 'Custom AURA themes & colors' },
    { icon: Sparkles, text: 'Multiple personas' },
    { icon: Lock, text: 'Private Spaces' },
    { icon: BarChart3, text: 'Analytics dashboard' },
    { icon: Edit3, text: 'Edit Drops anytime' },
    { icon: Pin, text: 'Pin Drops to profile' },
    { icon: Crown, text: 'Premium badge' },
    { icon: VolumeX, text: 'Disable sounds' }
  ];

  const plans: { id: PlanType; name: string; price: number; period: string; savings?: string }[] = [
    { id: 'monthly', name: 'Monthly', price: PREMIUM_PRICES.monthly, period: '/month' },
    { id: '6months', name: '6 Months', price: PREMIUM_PRICES['6months'], period: ' total', savings: 'Save 15%' },
    { id: 'yearly', name: 'Yearly', price: PREMIUM_PRICES.yearly, period: ' total', savings: 'Save 30%' }
  ];

  const handlePayment = async () => {
    if (!currentUser?.email) {
      setError('Please sign in to upgrade');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await initializePayment(
        currentUser.email,
        plans.find(p => p.id === selectedPlan)!.price,
        selectedPlan,
        currentUser.id,
        async (result) => {
          // Payment success
          const subResult = await createSubscription(currentUser.id, selectedPlan, result.reference);
          
          if (subResult.success) {
            soundManager.playPost();
            onUpgrade();
            onClose();
          } else {
            setError(subResult.error || 'Failed to activate subscription');
          }
          setLoading(false);
        },
        () => {
          // Payment cancelled
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 to-black border border-[#ff2e2e]/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ff2e2e]/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/50" />
        </button>
        
        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-6 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-white/60">Unlock the full VIBE experience</p>
        </div>
        
        {/* Features */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                <feature.icon className="w-4 h-4 text-[#ff2e2e]" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Plans */}
        <div className="px-6 mb-6">
          <p className="text-sm text-white/50 mb-3">Choose your plan</p>
          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedPlan === plan.id
                    ? 'border-[#ff2e2e] bg-[#ff2e2e]/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-[#ff2e2e]' : 'border-white/30'
                  }`}>
                    {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-[#ff2e2e]" />}
                  </div>
                  <div className="text-left">
                    <span className="text-white font-medium block">{plan.name}</span>
                    {plan.savings && (
                      <span className="text-xs text-green-400">{plan.savings}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">${plan.price}</span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="px-6 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}
        
        {/* CTA */}
        <div className="px-6 pb-8">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#ff2e2e] to-[#ff6b35] hover:from-[#ff4545] hover:to-[#ff7b45] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Upgrade Now - ${plans.find(p => p.id === selectedPlan)?.price}
              </>
            )}
          </button>
          <p className="text-center text-white/40 text-xs mt-3">
            Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
