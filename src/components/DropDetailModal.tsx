import { useState, useEffect } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { Heart, MessageCircle, Share2, UserPlus, Eye, X, Send, MoreHorizontal, Flag, EyeOff, UserX, Link2 } from 'lucide-react';
import { formatTimeAgo, formatNumber } from '@/lib/utils';
import { MOOD_CONFIG } from '@/types';
import mockBackend from '@/services/mockBackend';

export default function DropDetailModal() {
  const { 
    selectedDrop, 
    closeDropDetail, 
    toggleFeel, 
    flowDrop, 
    toggleVibe, 
    isVibing, 
    hideDrop, 
    reportDrop, 
    blockUser,
    settings 
  } = useVibeStore();
  
  const [echoContent, setEchoContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [copied, setCopied] = useState(false);
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    // Listen for real-time updates
    const handleDropUpdate = () => {
      useVibeStore.getState().refreshDrops();
    };
    mockBackend.on('dropUpdated', handleDropUpdate);
    return () => {
      mockBackend.off('dropUpdated', handleDropUpdate);
    };
  }, []);

  if (!selectedDrop) return null;

  const mood = MOOD_CONFIG[selectedDrop.mood];
  const hasFelt = selectedDrop.hasFelt || false;
  const hasVibed = isVibing(selectedDrop.author.id);

  const handleSubmitEcho = () => {
    if (echoContent.trim()) {
      mockBackend.addEcho(selectedDrop.id, echoContent);
      setEchoContent('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://vibe.app/drop/${selectedDrop.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      reportDrop(selectedDrop.id, reportReason);
      setShowReportModal(false);
      setReportReason('');
      setShowMenu(false);
    }
  };

  const handleHide = () => {
    hideDrop(selectedDrop.id);
    setShowMenu(false);
    closeDropDetail();
  };

  const handleBlock = () => {
    blockUser(selectedDrop.author.id);
    setShowMenu(false);
    closeDropDetail();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeDropDetail}
      />
      <div className={`relative w-full max-w-2xl max-h-[90vh] ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl overflow-hidden scale-in flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Drop Detail</h3>
          <div className="flex items-center gap-2">
            {/* Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl z-50 ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    onClick={handleCopyLink}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-t-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <Flag className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Report</span>
                  </button>
                  <button
                    onClick={handleHide}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm">Hide Post</span>
                  </button>
                  <button
                    onClick={handleBlock}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-b-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <UserX className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Block User</span>
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={closeDropDetail}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Drop Content */}
          <div className="p-6">
            {/* Author */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedDrop.author.avatar.gradient} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{selectedDrop.author.avatar.initial}</span>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDrop.author.username}
                  </p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
                    >
                      {mood.emoji} {mood.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(selectedDrop.createdAt)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                      {selectedDrop.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className={`text-lg mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {selectedDrop.content}
            </p>

            {/* Image if exists */}
            {selectedDrop.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <img src={selectedDrop.imageUrl} alt="Drop content" className="w-full h-auto" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between py-4 border-t border-b border-dashed border-gray-500/30">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => toggleFeel(selectedDrop.id)}
                  className={`flex items-center gap-2 transition-all ${
                    hasFelt ? 'text-[#ff2e2e]' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Heart className="w-6 h-6" fill={hasFelt ? '#ff2e2e' : 'none'} />
                  <span className="font-medium">{formatNumber(selectedDrop.feelCount)} Feels</span>
                </button>

                <button
                  className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{formatNumber(selectedDrop.echoCount)} Echoes</span>
                </button>

                <button
                  onClick={() => flowDrop(selectedDrop.id)}
                  className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Share2 className="w-6 h-6" />
                  <span className="font-medium">{formatNumber(selectedDrop.flowCount)} Flows</span>
                </button>

                <div className={`flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{formatNumber(selectedDrop.seenCount)}</span>
                </div>
              </div>

              <button
                onClick={() => toggleVibe(selectedDrop.author.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  hasVibed 
                    ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' 
                    : `${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-[#ff2e2e]/20 hover:text-[#ff2e2e]`
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {hasVibed ? 'Vibing' : 'Vibe With'}
              </button>
            </div>
          </div>

          {/* Echoes Section */}
          <div className={`px-6 pb-6 ${isDark ? 'bg-[#0a0a0a]/50' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Echoes ({selectedDrop.echoCount})
            </h4>

            {/* Echo Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={echoContent}
                onChange={(e) => setEchoContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitEcho()}
                placeholder="Add your echo..."
                className={`flex-1 px-4 py-3 rounded-xl outline-none ${
                  isDark 
                    ? 'bg-white/10 text-white placeholder-gray-500' 
                    : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
                }`}
              />
              <button
                onClick={handleSubmitEcho}
                disabled={!echoContent.trim()}
                className="px-4 py-3 bg-[#ff2e2e] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Echoes List */}
            <div className="space-y-4">
              {selectedDrop.echoes && selectedDrop.echoes.length > 0 ? (
                selectedDrop.echoes.map((echo) => (
                  <div key={echo.id} className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${echo.author.avatar.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold">{echo.author.avatar.initial}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {echo.author.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(echo.createdAt)}
                        </span>
                      </div>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {echo.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No echoes yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-2xl p-6 scale-in`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Report Drop
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Why are you reporting this content?
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain the issue..."
              className={`w-full h-24 p-3 rounded-xl resize-none outline-none mb-4 ${
                isDark 
                  ? 'bg-white/10 text-white placeholder-gray-500' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-400'
              }`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(''); }}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 py-3 bg-[#ff2e2e] text-white rounded-xl font-medium disabled:opacity-50"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
