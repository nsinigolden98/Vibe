import { ArrowLeft } from 'lucide-react';
import { useVibeStore } from '@/hooks/useVibeStore';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  const { settings } = useVibeStore();
  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/90' : 'bg-[#f5f5f5]/90'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Privacy Policy
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: March 2024
          </p>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              1. Our Commitment to Privacy
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              At VIBE, privacy is not an afterthought—it's our foundation. We built this platform 
              to provide a space for authentic expression without the burden of permanent digital 
              footprints. This policy explains what data we collect, how we use it, and how we protect it.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              2. Information We Collect
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Minimal by Design:</strong> We collect only what's necessary:
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Generated Identity:</strong> Randomly assigned username and avatar</li>
              <li><strong>Content:</strong> Drops, Echoes, Pulses, and Space messages you create</li>
              <li><strong>Interactions:</strong> Feels, Flows, and Vibe relationships</li>
              <li><strong>Device Info:</strong> Basic technical data for app functionality</li>
              <li><strong>Google Account (Optional):</strong> Only if you choose to link for account recovery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              3. What We Don't Collect
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We explicitly do NOT collect:
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Your real name or personal identifiers (unless voluntarily provided via Google)</li>
              <li>Your precise location</li>
              <li>Contacts from your device</li>
              <li>Browsing history outside VIBE</li>
              <li>Biometric data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              4. How We Use Your Data
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your data is used solely for:
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Providing and improving the VIBE platform</li>
              <li>Personalizing your feed and recommendations</li>
              <li>Enabling social features (Vibing, Echoes, Spaces)</li>
              <li>Maintaining platform safety and enforcing our terms</li>
              <li>Communicating important updates (if notifications are enabled)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              5. Data Retention & Deletion
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Ephemeral by Default:</strong>
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Space messages auto-delete after 1 hour</li>
              <li>Fade Drops are deleted after the selected time period</li>
              <li>Guest accounts may be purged after 30 days of inactivity</li>
              <li>Account deletion removes all associated data within 30 days</li>
            </ul>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Note: Due to technical limitations, cached or backed-up data may persist longer in 
              our systems. Screenshots by other users are outside our control.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              6. Ghost Mode
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              When using Ghost Mode, your posts are completely dissociated from your account 
              identifier. Even we cannot trace Ghost Mode content back to you. This is our 
              strongest privacy guarantee.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              7. Third-Party Services
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We use Google Sign-In for optional account linking. Google's privacy policy applies 
              to that interaction. We do not share your data with advertisers, data brokers, or 
              other third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              8. Security Measures
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We employ industry-standard encryption for data in transit and at rest. Access to 
              user data is strictly limited to authorized personnel who need it for platform 
              operations. We regularly audit our security practices.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              9. Your Rights
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You have the right to:
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Access your data (though most is viewable in-app)</li>
              <li>Delete your account and associated data</li>
              <li>Export your data (contact support)</li>
              <li>Opt-out of non-essential notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              10. Children's Privacy
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              VIBE is not intended for users under 16 years of age. We do not knowingly collect 
              data from children. If you believe a child has used VIBE, please contact us to 
              remove their data.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              11. Changes to This Policy
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We may update this privacy policy. Significant changes will be announced in-app. 
              Continued use of VIBE after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              12. Contact Us
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              For privacy-related questions or concerns, contact us at:
            </p>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Email: privacy@vibe.app<br />
              Address: VIBE Privacy Team, 123 Anonymous Street, Digital City, DC 00000
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
