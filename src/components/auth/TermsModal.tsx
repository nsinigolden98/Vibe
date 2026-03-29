import { X } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
}

export function TermsModal({ onAccept }: TermsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl pointer-events-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms & Privacy</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4 text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Welcome to VIBE</h3>
            <p className="text-sm">
              VIBE is an anonymous-first social platform focused on content-driven interactions. By using VIBE, you agree to the following terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Anonymous Identity</h3>
            <p className="text-sm">
              Your username and avatar are randomly generated and cannot be changed. This ensures anonymity and equality among all users.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Content Expiry</h3>
            <p className="text-sm">
              All content on VIBE automatically expires within 24 hours by default. This creates a stream of fresh, temporary moments.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Privacy</h3>
            <p className="text-sm">
              We do not collect personal information beyond what's necessary for authentication. Your interactions are private and secure.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Community Guidelines</h3>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Be respectful to others</li>
              <li>No harassment, hate speech, or harmful content</li>
              <li>No spam or unauthorized advertising</li>
              <li>Content must comply with applicable laws</li>
            </ul>
          </section>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onAccept}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
