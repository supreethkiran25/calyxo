"use client";

import React from 'react';
import { useStore } from '../store/useStore';
import { Check, X, Shield, Star, Crown, Zap, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free Basic',
    price: '₹0',
    duration: 'forever',
    icon: Shield,
    color: 'border-card-border bg-surface/20 text-muted',
    features: [
      { text: 'Basic food & calorie tracking', included: true },
      { text: 'Basic workout logging', included: true },
      { text: 'Daily water intake log', included: true },
      { text: '2D fallback Health Core visual', included: true },
      { text: 'Interactive 3D Health Core', included: false },
      { text: 'Daily AI Briefings & Coaching Insights', included: false },
      { text: 'Trainer & Dietitian hub access', included: false }
    ]
  },
  {
    id: 'PRO_LITE',
    name: 'Pro Lite',
    price: '₹49',
    duration: 'month',
    icon: Zap,
    color: 'border-blue-400/20 bg-blue-500/5 text-blue-400',
    features: [
      { text: 'Basic food & calorie tracking', included: true },
      { text: 'Basic workout logging', included: true },
      { text: 'Daily water intake log', included: true },
      { text: '2D fallback Health Core visual', included: true },
      { text: 'Custom workout & diet templates', included: true },
      { text: 'Interactive 3D Health Core', included: false },
      { text: 'Daily AI Briefings & Coaching Insights', included: false },
      { text: 'Trainer & Dietitian hub access', included: false }
    ]
  },
  {
    id: 'PRO',
    name: 'Pro Elite',
    price: '₹99',
    duration: 'month',
    icon: Star,
    color: 'border-acid-green/30 bg-acid-green/5 text-acid-green',
    popular: true,
    features: [
      { text: 'All Pro Lite Features Included', included: true },
      { text: 'Interactive 3D Health Core Visuals', included: true },
      { text: 'Daily AI Briefings & Reports', included: true },
      { text: 'Proactive AI Chat recommendations', included: true },
      { text: 'Weekly AI trend feedback', included: true },
      { text: 'Trainer & Dietitian hub access', included: false }
    ]
  },
  {
    id: 'PRO_PLUS',
    name: 'Pro Plus Connect',
    price: '₹199',
    duration: 'month',
    icon: Crown,
    color: 'border-orange/30 bg-orange/5 text-orange',
    features: [
      { text: 'All Pro Elite Features Included', included: true },
      { text: 'Trainer remote monitoring access', included: true },
      { text: 'Dietitian workout/diet assignments', included: true },
      { text: 'Priority AI generation speed', included: true },
      { text: 'Direct export to Google Fit / Apple', included: true }
    ]
  }
];

export default function MonetizationCenter({ onNotification }) {
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const currentPlan = userProfile?.subscriptionPlan || 'FREE';

  const handleSelectPlan = (planId) => {
    updateUserProfile({ subscriptionPlan: planId });
    if (onNotification) {
      onNotification(`Successfully switched to the ${planId.replace('_', ' ')} plan! 🎉`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Calyxo Subscription Plans</h2>
        <p className="text-[10px] text-muted font-medium">Upgrade your membership plan to unlock interactive 3D modeling and remote coach assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4 border-t border-card-border">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          return (
            <div 
              key={plan.id} 
              className={`glass rounded-2xl border p-5 flex flex-col justify-between relative shadow-md transition-all ${plan.color} ${
                plan.popular ? 'ring-2 ring-acid-green/40' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-acid-green text-accent-foreground text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-foreground uppercase tracking-wider block">{plan.name}</span>
                    <div className="flex items-baseline mt-2 gap-1">
                      <span className="text-2xl font-black text-foreground leading-none">{plan.price}</span>
                      <span className="text-[9px] text-muted font-bold uppercase">/ {plan.duration}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center border border-card-border">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-card-border/50 text-[10px] font-semibold text-foreground/80">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-2 items-start leading-relaxed">
                      {feat.included ? (
                        <Check className="w-3.5 h-3.5 text-acid-green shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted/65 shrink-0 mt-0.5" />
                      )}
                      <span className={feat.included ? 'text-foreground' : 'text-muted'}>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border-none transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-black/10 text-muted cursor-default' 
                      : 'btn-primary'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
