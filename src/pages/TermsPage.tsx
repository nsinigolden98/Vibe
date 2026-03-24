import { ArrowLeft } from 'lucide-react';
import { useVibeStore } from '@/hooks/useVibeStore';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
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
          <h1 className="text-xl font-bold">Terms & Conditions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Terms of Service
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: March 2024
          </p>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              1. Acceptance of Terms
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              By accessing or using VIBE, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service. VIBE is an 
              anonymous social platform designed for mood-based expression and connection.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              2. Anonymous Nature
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              VIBE is built on anonymity. Usernames and avatars are randomly generated and 
              cannot be changed. We do not collect personally identifiable information unless 
              you choose to link your Google account for account recovery purposes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              3. User Conduct
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You agree not to use VIBE to:
            </p>
            <ul className={`list-disc pl-6 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Harass, abuse, or harm others</li>
              <li>Post illegal content or promote illegal activities</li>
              <li>Share personal information of others without consent</li>
              <li>Spam or engage in disruptive behavior</li>
              <li>Impersonate others or create fake identities</li>
              <li>Post content that promotes violence or hate speech</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              4. Content Ownership
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You retain ownership of the content you post on VIBE. However, by posting content, 
              you grant VIBE a non-exclusive, royalty-free license to use, display, and distribute 
              your content within the platform. Content posted in Ghost Mode is completely anonymous 
              and cannot be attributed to any user.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              5. Disappearing Content
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              VIBE offers features like Fade Drop and disappearing messages in Spaces. While we 
              make efforts to remove content as specified, we cannot guarantee complete deletion 
              due to technical limitations, caching, or screenshots by other users.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              6. Account Termination
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We reserve the right to suspend or terminate accounts that violate these terms. 
              Guest accounts are temporary and may be deleted after periods of inactivity. 
              You may delete your account at any time through the Settings page.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              7. Limitation of Liability
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              VIBE is provided "as is" without warranties of any kind. We are not liable for 
              any damages arising from your use of the platform, including but not limited to 
              emotional distress, reputational harm, or data loss.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              8. Changes to Terms
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We may update these terms from time to time. Continued use of VIBE after changes 
              constitutes acceptance of the new terms. We will notify users of significant changes 
              through the app.
            </p>
          </section>

          <section className="mb-8">
            <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              9. Contact
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              For questions about these terms, please contact us at support@vibe.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
