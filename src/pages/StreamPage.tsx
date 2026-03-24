import { useEffect, useState } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { Heart, MessageCircle, Share2, UserPlus, Eye, MoreHorizontal, Flag, EyeOff, UserX, Link2, Check, Send } from 'lucide-react';
import { formatTimeAgo, formatNumber } from '@/lib/utils';
import { MOOD_CONFIG } from '@/types';
import mockBackend from '@/services/mockBackend';
import type { Drop } from '@/types';

export default function StreamPage() {
  const { 
    drops, 
    settings, 
    toggleFeel, 
    flowDrop, 
    toggleVibe, 
    isVibing, 
    hideDrop, 
    reportDrop, 
    blockUser,
    openDropDetail,
    openDropCreator,
    addEcho,
  } = useVibeStore();
  
  const [animatedDrops, setAnimatedDrops] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportingDrop, setReportingDrop] = useState<Drop | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [expandedEchoes, setExpandedEchoes] = useState<string | null>(null);
  const [echoInput, setEchoInput] = useState('');
  const isDark = settings.theme === 'dark';

  // Subscribe to real-time updates
  useEffect(() => {
    const handleDropUpdate = () => {
      useVibeStore.getState().refreshDrops();
    };
    mockBackend.on('dropUpdated', handleDropUpdate);
    mockBackend.on('dropCreated', handleDropUpdate);
    return () => {
      mockBackend.off('dropUpdated', handleDropUpdate);
      mockBackend.off('dropCreated', handleDropUpdate);
    };
  }, []);

  const handleFeel = (dropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFeel(dropId);
    setAnimatedDrops(prev => new Set(prev).add(`feel-${dropId}`));
    setTimeout(() => {
      setAnimatedDrops(prev => {
        const next = new Set(prev);
        next.delete(`feel-${dropId}`);
        return next;
      });
    }, 400);
  };

  const handleFlow = (dropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    flowDrop(dropId);
    setAnimatedDrops(prev => new Set(prev).add(`flow-${dropId}`));
    setTimeout(() => {
      setAnimatedDrops(prev => {
        const next = new Set(prev);
        next.delete(`flow-${dropId}`);
        return next;
      });
    }, 400);
  };

  const handleCopyLink = (dropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://vibe.app/drop/${dropId}`);
    setCopiedId(dropId);
    setOpenMenuId(null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReport = () => {
    if (reportingDrop && reportReason.trim()) {
      reportDrop(reportingDrop.id, reportReason);
      setReportingDrop(null);
      setReportReason('');
      setOpenMenuId(null);
    }
  };

  const handleHide = (dropId: string) => {
    hideDrop(dropId);
    setOpenMenuId(null);
  };

  const handleBlock = (userId: string) => {
    blockUser(userId);
    setOpenMenuId(null);
  };

  const handleSubmitEcho = (dropId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (echoInput.trim()) {
      addEcho(dropId, echoInput);
      setEchoInput('');
      setExpandedEchoes(null);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Stream</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Feel the flow</p>
          </div>
          <button
            onClick={() => openDropCreator('stream')}
            className="lg:hidden px-4 py-2 bg-[#ff2e2e] text-white text-sm font-medium rounded-full"
          >
            + Drop
          </button>
        </div>
      </div>

      {/* Drops Feed */}
      <div className="px-4 py-4 space-y-4">
        {drops.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="w-16 h-16 rounded-full bg-[#ff2e2e]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌊</span>
            </div>
            <p className="text-lg font-medium mb-2">No drops yet</p>
            <p className="text-sm mb-4">Be the first to create a drop!</p>
            <button
              onClick={() => openDropCreator('stream')}
              className="px-6 py-2.5 bg-[#ff2e2e] text-white font-medium rounded-full"
            >
              Create Your First Drop
            </button>
          </div>
        ) : (
          drops.map((drop) => {
            const mood = MOOD_CONFIG[drop.mood];
            const hasFelt = drop.hasFelt || false;
            const hasVibed = isVibing(drop.author.id);
            const isMenuOpen = openMenuId === drop.id;
            const isCopied = copiedId === drop.id;
            const isEchoExpanded = expandedEchoes === drop.id;
            
            return (
              <div 
                key={drop.id}
                className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'} transition-all hover:scale-[1.01]`}
              >
                {/* Author Header */}
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => openDropDetail(drop)}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${drop.author.avatar.gradient} flex items-center justify-center`}>
                      <span className="text-white font-bold">{drop.author.avatar.initial}</span>
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {drop.author.username}
                      </p>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${mood.color}20`, color: mood.color }}
                        >
                          {mood.emoji} {mood.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(drop.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : drop.id);
                      }}
                      className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl z-20 ${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                      >
                        <button
                          onClick={(e) => handleCopyLink(drop.id, e)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-t-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                          <span className="text-sm">{isCopied ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <button
                          onClick={() => { setReportingDrop(drop); setOpenMenuId(null); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          <Flag className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Report</span>
                        </button>
                        <button
                          onClick={() => handleHide(drop.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          <EyeOff className="w-4 h-4" />
                          <span className="text-sm">Hide Post</span>
                        </button>
                        <button
                          onClick={() => handleBlock(drop.author.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-b-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          <UserX className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Block User</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Click to open full view */}
                <div 
                  onClick={() => openDropDetail(drop)}
                  className="cursor-pointer"
                >
                  <p className={`mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {drop.content}
                  </p>

                  {/* Image if exists */}
                  {drop.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden">
                      <img src={drop.imageUrl} alt="Drop content" className="w-full h-auto max-h-80 object-cover" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between py-3 border-t border-b border-dashed border-gray-500/30">
                  <div className="flex items-center gap-4">
                    {/* Feel */}
                    <button
                      onClick={(e) => handleFeel(drop.id, e)}
                      className={`flex items-center gap-1.5 transition-all ${
                        hasFelt ? 'text-[#ff2e2e]' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${animatedDrops.has(`feel-${drop.id}`) ? 'heart-beat' : ''}`} 
                        fill={hasFelt ? '#ff2e2e' : 'none'} 
                      />
                      <span className="text-sm">{formatNumber(drop.feelCount)}</span>
                    </button>

                    {/* Echo */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEchoes(isEchoExpanded ? null : drop.id);
                      }}
                      className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-[#ff2e2e] transition-colors`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{formatNumber(drop.echoCount)}</span>
                    </button>

                    {/* Flow */}
                    <button
                      onClick={(e) => handleFlow(drop.id, e)}
                      className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-[#ff2e2e] transition-colors`}
                    >
                      <Share2 className={`w-5 h-5 ${animatedDrops.has(`flow-${drop.id}`) ? 'scale-110' : ''}`} />
                      <span className="text-sm">{formatNumber(drop.flowCount)}</span>
                    </button>

                    {/* Seen */}
                    <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{formatNumber(drop.seenCount)}</span>
                    </div>
                  </div>

                  {/* Vibe With */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVibe(drop.author.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      hasVibed 
                        ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' 
                        : `${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-[#ff2e2e]/20 hover:text-[#ff2e2e]`
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {hasVibed ? 'Vibing' : 'Vibe With'}
                  </button>
                </div>

                {/* Echoes Section - Expandable */}
                {isEchoExpanded && (
                  <div className={`mt-4 pt-2 ${isDark ? 'bg-[#0a0a0a]/50' : 'bg-gray-50'} rounded-xl p-3`}>
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Echoes ({drop.echoCount})
                    </h4>
                    
                    {/* Echo Input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={echoInput}
                        onChange={(e) => setEchoInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitEcho(drop.id, e as any)}
                        placeholder="Add your echo..."
                        className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${
                          isDark 
                            ? 'bg-white/10 text-white placeholder-gray-500' 
                            : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200'
                        }`}
                      />
                      <button
                        onClick={(e) => handleSubmitEcho(drop.id, e)}
                        disabled={!echoInput.trim()}
                        className="px-3 py-2 bg-[#ff2e2e] text-white rounded-lg disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Echoes List - Scrollable */}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {drop.echoes && drop.echoes.length > 0 ? (
                        drop.echoes.map((echo) => (
                          <div key={echo.id} className="flex items-start gap-2">
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${echo.author.avatar.gradient} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs font-bold">{echo.author.avatar.initial}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {echo.author.username}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(echo.createdAt)}
                                </span>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {echo.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          No echoes yet. Be the first!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Echoes Preview (when not expanded) */}
                {!isEchoExpanded && drop.echoes && drop.echoes.length > 0 && (
                  <div 
                    onClick={() => setExpandedEchoes(drop.id)}
                    className={`mt-4 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} cursor-pointer`}
                  >
                    {drop.echoes.slice(0, 2).map((echo) => (
                      <div key={echo.id} className="flex items-start gap-2 mb-2 last:mb-0">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${echo.author.avatar.gradient} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">{echo.author.avatar.initial}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {echo.author.username}
                            </span>{' '}
                            {echo.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {drop.echoes.length > 2 && (
                      <p className="text-sm text-[#ff2e2e] mt-2">
                        View all {drop.echoes.length} echoes
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Report Modal */}
      {reportingDrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReportingDrop(null)} />
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
                onClick={() => { setReportingDrop(null); setReportReason(''); }}
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
