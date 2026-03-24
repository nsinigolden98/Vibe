import { useVibeStore } from '@/hooks/useVibeStore';
import { Shield, Check } from 'lucide-react';

export default function PrivacyModal() {
  const { acceptPrivacy, settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative w-full max-w-lg max-h-[85vh] ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl overflow-hidden scale-in`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                How we protect your data
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto max-h-[50vh] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Our Commitment to Privacy
              </h3>
              <p>
                At VIBE, privacy is our foundation. We built this platform to provide 
                a space for authentic expression without permanent digital footprints.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Information We Collect
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generated Identity (random username & avatar)</li>
                <li>Content you create (Drops, Echoes, Pulses)</li>
                <li>Interactions (Feels, Flows, Vibe relationships)</li>
                <li>Optional: Google account for recovery</li>
              </ul>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                What We Don't Collect
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your real name or personal identifiers</li>
                <li>Precise location data</li>
                <li>Device contacts</li>
                <li>Browsing history</li>
              </ul>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ghost Mode
              </h3>
              <p>
                When using Ghost Mode, your posts are completely dissociated from 
                your account. Even we cannot trace Ghost Mode content back to you.
              </p>
            </section>

            <section>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Data Retention
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Space messages auto-delete after 1 hour</li>
                <li>Fade Drops delete after selected time</li>
                <li>Account deletion removes all data within 30 days</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            onClick={acceptPrivacy}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff2e2e] text-white font-semibold rounded-xl hover:bg-[#e62929] transition-colors"
          >
            <Check className="w-5 h-5" />
            I Understand & Accept
          </button>
          <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Your privacy is our priority
          </p>
        </div>
      </div>
    </div>
  );
}
