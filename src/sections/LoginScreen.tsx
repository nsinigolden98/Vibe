import { useVibeStore } from '@/hooks/useVibeStore';
import { Zap, Chrome, User } from 'lucide-react';

export default function LoginScreen() {
  const { loginWithGoogle, loginAsGuest } = useVibeStore();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ff2e2e] rounded-full filter blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ff2e2e] rounded-full filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff2e2e] to-[#b91c1c] flex items-center justify-center mb-4 glow-red">
          <Zap className="w-10 h-10 text-white" fill="white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-wider">
          VIBE
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Anonymous. Mood-based. Real.
        </p>
      </div>

      {/* Login Options */}
      <div className="relative z-10 w-full max-w-sm space-y-4">
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors touch-feedback"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <button
          onClick={loginAsGuest}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 glass text-white font-semibold rounded-xl hover:bg-white/10 transition-colors touch-feedback"
        >
          <User className="w-5 h-5" />
          Enter as Guest
        </button>

        <p className="text-center text-gray-500 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 mt-12 flex gap-8 text-center">
        <div>
          <div className="text-2xl font-bold text-[#ff2e2e]">∞</div>
          <div className="text-xs text-gray-500">Anonymous</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#ff2e2e]">⚡</div>
          <div className="text-xs text-gray-500">Instant</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#ff2e2e]">🔒</div>
          <div className="text-xs text-gray-500">Private</div>
        </div>
      </div>
    </div>
  );
}
