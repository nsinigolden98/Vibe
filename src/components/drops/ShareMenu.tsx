import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Flag, EyeOff, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { soundManager } from '../../lib/soundManager';

interface ShareMenuProps {
  postId: string;
  postType: 'drop' | 'pulse';
  username: string;
  preview?: string;
  onHide?: () => void;
}

export function ShareMenu({ postId, postType, username, preview, onHide }: ShareMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${postType}/${postId}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      soundManager.playShare();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  const handleReport = async () => {
    if (!user || !reportReason.trim()) return;

    setReporting(true);
    try {
      await supabase.from('reports').insert({
        post_id: postId,
        reporter_id: user.id,
        reason: reportReason.trim(),
        post_type: postType,
      });

      setShowReportModal(false);
      setReportReason('');
      soundManager.playClick();
      alert('Report submitted. Thank you for helping keep VIBE safe.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  const handleHide = () => {
    if (onHide) {
      onHide();
      soundManager.playClick();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          soundManager.playClick();
        }}
        className="flex items-center gap-1.5 hover:text-green-500 transition-colors text-gray-500 dark:text-gray-400"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Copy Link</span>
              </>
            )}
          </button>

          {user && (
            <button
              onClick={() => {
                setShowReportModal(true);
                setIsOpen(false);
                soundManager.playClick();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <Flag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Report</span>
            </button>
          )}

          {onHide && (
            <button
              onClick={handleHide}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Hide</span>
            </button>
          )}
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Report Content</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Why are you reporting this content by @{username}?
            </p>

            {preview && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{preview}</p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {['Spam', 'Harassment', 'Inappropriate content', 'Misinformation', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full px-4 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    reportReason === reason
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || reporting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reporting ? 'Submitting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
