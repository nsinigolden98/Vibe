// Paystack Service for VIBE Premium

/// <reference types="vite/client" />

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export interface PaymentResult {
  reference: string;
  status: 'success' | 'cancelled' | 'error';
  message?: string;
}

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });
};

export const initializePayment = async (
  email: string,
  amount: number,
  plan: string,
  userId: string,
  onSuccess: (result: PaymentResult) => void,
  onCancel: () => void
): Promise<void> => {
  await loadPaystackScript();
  
  const popup = new window.PaystackPop();
  
  popup.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Convert to kobo/cents
    reference: `vibe_${userId}_${Date.now()}`,
    metadata: {
      user_id: userId,
      plan,
      custom_fields: [
        {
          display_name: 'Plan',
          variable_name: 'plan',
          value: plan
        }
      ]
    },
    onSuccess: (transaction: any) => {
      onSuccess({
        reference: transaction.reference,
        status: 'success'
      });
    },
    onCancel: () => {
      onCancel();
    }
  });
};

export const verifyPayment = async (reference: string): Promise<boolean> => {
  // This should be done on the backend/edge function
  // For now, we'll assume success if we have a reference
  return !!reference;
};

export const createSubscription = async (
  userId: string,
  plan: 'monthly' | '6months' | 'yearly',
  reference: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Calculate expiry date based on plan
    const now = new Date();
    let expiresAt = new Date();
    
    switch (plan) {
      case 'monthly':
        expiresAt.setMonth(now.getMonth() + 1);
        break;
      case '6months':
        expiresAt.setMonth(now.getMonth() + 6);
        break;
      case 'yearly':
        expiresAt.setFullYear(now.getFullYear() + 1);
        break;
    }
    
    // This would be handled by a Supabase edge function in production
    // For now, we'll update the user record directly
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      plan,
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      paystack_reference: reference
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Update user premium status
    await supabase
      .from('users')
      .update({ premium: true, premium_expires_at: expiresAt.toISOString() })
      .eq('id', userId);
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Import supabase at the end to avoid circular dependency
import { supabase } from './supabaseClient';
