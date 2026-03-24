import { useVibeStore } from '@/hooks/useVibeStore';
import { Sparkles, Check } from 'lucide-react';

export default function IdentityModal() {
  const { currentUser, closeIdentityModal, settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl overflow-hidden scale-in`}>
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-r from-[#ff2e2e] via-[#ff6b6b] to-[#b91c1c]">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center border-4 ${isDark ? 'border-[#1a1a1a]' : 'border-white'} shadow-xl`}>
              <span className="text-white text-3xl font-bold">{currentUser.avatar.initial}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your VIBE Identity
            </h2>
            <Sparkles className="w-5 h-5 text-[#ff2e2e]" />
          </div>

          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            This is your anonymous identity on VIBE
          </p>

          {/* Username */}
          <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Username
            </p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentUser.username}
            </p>
          </div>

          {/* Avatar Info */}
          <div className={`p-4 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Avatar
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center`}>
                <span className="text-white font-bold">{currentUser.avatar.initial}</span>
              </div>
              <div className="text-left">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Symbol: {currentUser.avatar.symbol}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Gradient: {currentUser.avatar.gradient.split(' ')[1]?.replace('from-', '')}
                </p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
              <strong>Important:</strong> Your username and avatar cannot be changed. 
              This ensures complete anonymity.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={closeIdentityModal}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff2e2e] text-white font-semibold rounded-xl hover:bg-[#e62929] transition-colors"
          >
            <Check className="w-5 h-5" />
            Enter the VIBE
          </button>
        </div>
      </div>
    </div>
  );
}
