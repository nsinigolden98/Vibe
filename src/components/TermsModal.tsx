import { useVibeStore } from '@/hooks/useVibeStore';
import { FileText, Check } from 'lucide-react';

export default function TermsModal() {
  const { acceptTerms, settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative w-full max-w-lg max-h-[85vh] ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl overflow-hidden scale-in`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ff2e2e]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#ff2e2e]" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Terms & Conditions
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Please read and accept to continue
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto max-h-[50vh] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing or using VIBE, you agree to be bound by these Terms of Service. 
                VIBE is an anonymous social platform designed for mood-based expression.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                2. Anonymous Nature
              </h3>
              <p>
                VIBE is built on anonymity. Usernames and avatars are randomly generated 
                and cannot be changed. We value your privacy above all.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                3. User Conduct
              </h3>
              <p>
                You agree not to use VIBE to harass, abuse, post illegal content, 
                share personal information of others, spam, or promote hate speech.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                4. Content Ownership
              </h3>
              <p>
                You retain ownership of content you post. Ghost Mode posts are 
                completely anonymous and cannot be attributed to any user.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5. Account Termination
              </h3>
              <p>
                We reserve the right to suspend accounts that violate these terms. 
                You may delete your account at any time.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={acceptTerms}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff2e2e] text-white font-semibold rounded-xl hover:bg-[#e62929] transition-colors"
          >
            <Check className="w-5 h-5" />
            I Accept the Terms
          </button>
          <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            By accepting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
