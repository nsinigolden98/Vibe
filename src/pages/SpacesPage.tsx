import { useEffect, useState, useRef } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { Users, MessageSquare, Send, Radio, Clock, ChevronLeft, Mic, MicOff, Plus, Trash2, X } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import mockBackend from '@/services/mockBackend';
import type { Space, SpaceMessage } from '@/types';

export default function SpacesPage() {
  const { spaces, settings, currentUser } = useVibeStore();
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [newSpaceExpiry, setNewSpaceExpiry] = useState(1440); // 24 hours default
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = settings.theme === 'dark';

  // Subscribe to real-time updates
  useEffect(() => {
    const handleSpaceUpdate = () => {
      useVibeStore.getState().refreshSpaces();
      if (activeSpace) {
        const updated = mockBackend.getSpaceById(activeSpace.id);
        if (updated) {
          setActiveSpace(updated);
        }
      }
    };
    mockBackend.on('spaceUpdated', handleSpaceUpdate);
    return () => {
      mockBackend.off('spaceUpdated', handleSpaceUpdate);
    };
  }, [activeSpace]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSpace?.messages]);

  const joinSpace = (space: Space) => {
    mockBackend.joinSpace(space.id);
    // Update current user's joined spaces
    if (currentUser && !currentUser.joinedSpaces.includes(space.id)) {
      currentUser.joinedSpaces.push(space.id);
    }
    setActiveSpace(space);
  };

  const leaveSpace = () => {
    if (activeSpace) {
      mockBackend.leaveSpace(activeSpace.id);
      setActiveSpace(null);
    }
  };

  const sendMessage = () => {
    if (activeSpace && messageInput.trim() && !isMuted) {
      mockBackend.sendSpaceMessage(activeSpace.id, messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreateSpace = () => {
    if (newSpaceName.trim() && newSpaceDescription.trim()) {
      mockBackend.createSpace(newSpaceName, newSpaceDescription, newSpaceExpiry);
      setShowCreateModal(false);
      setNewSpaceName('');
      setNewSpaceDescription('');
      setNewSpaceExpiry(1440);
      useVibeStore.getState().refreshSpaces();
    }
  };

  const handleDeleteSpace = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this space?')) {
      mockBackend.deleteSpace(spaceId);
      useVibeStore.getState().refreshSpaces();
    }
  };

  // Calculate expiry time for display
  const getExpiryText = (space: Space) => {
    const expiryTime = new Date(space.createdAt.getTime() + 24 * 60 * 60 * 1000);
    const timeLeft = Math.max(0, expiryTime.getTime() - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    if (hoursLeft < 1) return 'Expiring soon';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.floor(hoursLeft / 24)}d left`;
  };

  if (activeSpace) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Space Header */}
        <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={leaveSpace}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeSpace.name}
                  </h1>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full animate-pulse">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeSpace.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : isDark ? 'bg-white/10' : 'bg-gray-100'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ff2e2e]/20 rounded-full">
                <Users className="w-4 h-4 text-[#ff2e2e]" />
                <span className="text-sm text-[#ff2e2e] font-medium">
                  {formatNumber(activeSpace.activeUsers)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'}`}>
          {activeSpace.messages.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            activeSpace.messages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isCurrentUser={message.author.id === currentUser?.id}
                isDark={isDark}
                showAvatar={index === 0 || activeSpace.messages[index - 1].author.id !== message.author.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-200 bg-white'}`}>
          {isMuted && (
            <div className={`text-center text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              You are muted. Unmute to send messages.
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMuted ? "Unmute to type..." : "Type a message..."}
                disabled={isMuted}
                className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'} disabled:opacity-50`}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!messageInput.trim() || isMuted}
              className="w-12 h-12 flex items-center justify-center bg-[#ff2e2e] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e62929] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Messages disappear after 1 hour
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`sticky top-0 z-30 ${isDark ? 'bg-[#0a0a0a]/95' : 'bg-[#f5f5f5]/95'} backdrop-blur-xl border-b ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Spaces</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Join live conversations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff2e2e] text-white text-sm font-medium rounded-full hover:bg-[#e62929] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {spaces.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="w-16 h-16 rounded-full bg-[#ff2e2e]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <p className="text-lg font-medium mb-2">No spaces available</p>
            <p className="text-sm mb-4">Create your own space to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-[#ff2e2e] text-white font-medium rounded-full"
            >
              Create Space
            </button>
          </div>
        ) : (
          spaces.map((space) => (
            <div 
              key={space.id}
              onClick={() => joinSpace(space)}
              className={`p-5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white'} border ${isDark ? 'border-white/10' : 'border-gray-200'} cursor-pointer hover:scale-[1.02] transition-transform group relative`}
            >
              {/* Delete button (only for creator) */}
              {currentUser && space.creatorId === currentUser.id && (
                <button
                  onClick={(e) => handleDeleteSpace(space.id, e)}
                  className={`absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff2e2e] to-[#b91c1c] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#ff2e2e]/20 transition-shadow`}>
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full animate-pulse">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </span>
                </div>
              </div>
              
              <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {space.name}
              </h3>
              <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {space.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-${400 + i * 100} to-purple-${400 + i * 100} border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} flex items-center justify-center`}
                      >
                        <span className="text-white text-[8px] font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatNumber(space.activeUsers)} active
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{getExpiryText(space)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-3xl p-6 scale-in`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create Space
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Space Name
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g., Late Night Thoughts"
                  className={`w-full p-3 rounded-xl outline-none ${
                    isDark 
                      ? 'bg-white/10 text-white placeholder-gray-500' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Description
                </label>
                <textarea
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  placeholder="What's this space about?"
                  rows={3}
                  className={`w-full p-3 rounded-xl resize-none outline-none ${
                    isDark 
                      ? 'bg-white/10 text-white placeholder-gray-500' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expires In
                </label>
                <div className="flex gap-2">
                  {[
                    { label: '1h', value: 60 },
                    { label: '6h', value: 360 },
                    { label: '12h', value: 720 },
                    { label: '24h', value: 1440 },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setNewSpaceExpiry(option.value)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        newSpaceExpiry === option.value 
                          ? 'bg-[#ff2e2e] text-white' 
                          : isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateSpace}
                disabled={!newSpaceName.trim() || !newSpaceDescription.trim()}
                className="w-full py-3.5 bg-[#ff2e2e] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e62929] transition-colors mt-4"
              >
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: SpaceMessage;
  isCurrentUser: boolean;
  isDark: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isCurrentUser, isDark, showAvatar }: MessageBubbleProps) {
  const timeLeft = Math.max(0, message.expiresAt.getTime() - Date.now());
  const minutesLeft = Math.floor(timeLeft / 60000);

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      {showAvatar && !isCurrentUser ? (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${message.author.avatar.gradient} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{message.author.avatar.initial}</span>
        </div>
      ) : !isCurrentUser && (
        <div className="w-8 flex-shrink-0" />
      )}
      
      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isCurrentUser && (
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {message.author.username}
          </p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl ${
          isCurrentUser 
            ? 'bg-[#ff2e2e] text-white rounded-br-md' 
            : isDark ? 'bg-white/10 text-white rounded-bl-md' : 'bg-gray-200 text-gray-900 rounded-bl-md'
        }`}>
          <p>{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">
            {minutesLeft > 0 ? `${minutesLeft}m left` : 'Expiring soon'}
          </span>
        </div>
      </div>
    </div>
  );
}
