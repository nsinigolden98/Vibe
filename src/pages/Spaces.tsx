import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, MessageSquare, Send, ArrowLeft, MoreHorizontal } from 'lucide-react';
import type { Space, SpaceMessage, User } from '@/types';
import { getSpaces, getSpaceMessages, sendSpaceMessage, createSpace, subscribeToSpace, broadcastTyping, subscribeToTyping } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import Modal from '@/components/Modal';
import { formatDistanceToNow } from 'date-fns';

interface SpacesProps {
  currentUser: User | null;
}

interface TypingUser {
  user_id: string;
  username: string;
  avatar: string;
  typing_at: string;
}

const Spaces: React.FC<SpacesProps> = ({ currentUser }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [messages, setMessages] = useState<SpaceMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (activeSpace && currentUser) {
      loadMessages();
      
      // Subscribe to new messages
      const messageSubscription = subscribeToSpace(activeSpace.id, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      });

      // Subscribe to typing indicators
      const typingSubscription = subscribeToTyping(activeSpace.id, (typing) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== typing.user_id);
          if (typing.user_id !== currentUser.id) {
            return [...filtered, typing];
          }
          return filtered;
        });
        
        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.user_id !== typing.user_id));
        }, 3000);
      });

      return () => {
        messageSubscription.unsubscribe();
        typingSubscription.unsubscribe();
      };
    }
  }, [activeSpace, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSpaces = async () => {
    setLoading(true);
    const data = await getSpaces();
    setSpaces(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!activeSpace) return;
    const data = await getSpaceMessages(activeSpace.id, 100);
    setMessages(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentUser || !activeSpace || !newMessage.trim()) return;

    setSending(true);
    const { error } = await sendSpaceMessage({
      space_id: activeSpace.id,
      user_id: currentUser.id,
      message: newMessage.trim()
    });

    if (!error) {
      soundManager.playEcho();
      setNewMessage('');
    }
    setSending(false);
  };

  const handleTyping = () => {
    if (!currentUser || !activeSpace) return;
    
    broadcastTyping(activeSpace.id, currentUser);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleCreateSpace = async () => {
    if (!currentUser || !newSpaceName.trim()) return;

    setCreating(true);
    const { data, error } = await createSpace({
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim() || undefined,
      created_by: currentUser.id,
      is_private: false
    });

    if (!error && data) {
      soundManager.playPost();
      setShowCreateModal(false);
      setNewSpaceName('');
      setNewSpaceDesc('');
      await loadSpaces();
      setActiveSpace(data as Space);
    }
    setCreating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#ff2e2e] animate-spin" />
      </div>
    );
  }

  // Active Space View
  if (activeSpace) {
    return (
      <div className="fixed inset-0 lg:static lg:inset-auto bg-gray-900 z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gray-900/95 backdrop-blur-lg">
          <button
            onClick={() => setActiveSpace(null)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-white">{activeSpace.name}</h2>
            <p className="text-xs text-white/50">
              {messages.length} messages
            </p>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => {
            const avatar = msg.user ? parseAvatar(msg.user.avatar) : null;
            const isCurrentUser = currentUser?.id === msg.user_id;
            const showAvatar = index === 0 || messages[index - 1].user_id !== msg.user_id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                {showAvatar && avatar ? (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{avatar.initial}</span>
                  </div>
                ) : (
                  <div className="w-8 flex-shrink-0" />
                )}

                <div className={`max-w-[75%] ${isCurrentUser ? 'text-right' : ''}`}>
                  {showAvatar && (
                    <p className="text-xs text-white/50 mb-1">{msg.user?.username}</p>
                  )}
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-[#ff2e2e] text-white rounded-br-sm'
                        : 'bg-white/10 text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm text-left">{msg.message}</p>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <div className="flex -space-x-2">
                {typingUsers.slice(0, 3).map((user, i) => {
                  const avatar = parseAvatar(user.avatar);
                  return (
                    <div
                      key={user.user_id}
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center border-2 border-gray-900`}
                      style={{ zIndex: 3 - i }}
                    >
                      <span className="text-white text-[10px] font-bold">{avatar.initial}</span>
                    </div>
                  );
                })}
              </div>
              <span className="flex items-center gap-1">
                {typingUsers.length === 1
                  ? `${typingUsers[0].username} is typing`
                  : `${typingUsers.length} people are typing`}
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentUser && (
          <div className="p-4 border-t border-white/10 bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Spaces List View
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#ff2e2e]" />
            Spaces
          </h1>
          {currentUser && (
            <button
              onClick={() => {
                setShowCreateModal(true);
                soundManager.playClick();
              }}
              className="flex items-center gap-1 px-4 py-2 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white text-sm font-medium rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>
      </div>

      {/* Spaces List */}
      <div className="p-4 pb-24 lg:pb-4">
        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No spaces yet</h3>
            <p className="text-white/50">Create a space and start chatting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spaces.map((space) => {
              const avatar = space.user ? parseAvatar(space.user.avatar) : null;
              return (
                <button
                  key={space.id}
                  onClick={() => {
                    setActiveSpace(space);
                    soundManager.playClick();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff2e2e]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{space.name}</h3>
                    {space.description && (
                      <p className="text-sm text-white/50 truncate">{space.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {avatar && (
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{avatar.initial}</span>
                        </div>
                      )}
                      <span className="text-xs text-white/40">by {space.user?.username}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Space Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Space"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Space Name</label>
            <input
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="Give your space a name"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Description (optional)</label>
            <textarea
              value={newSpaceDesc}
              onChange={(e) => setNewSpaceDesc(e.target.value)}
              placeholder="What's this space about?"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50 resize-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleCreateSpace}
            disabled={!newSpaceName.trim() || creating}
            className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Create Space
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Spaces;
