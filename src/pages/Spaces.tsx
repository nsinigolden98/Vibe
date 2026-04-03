import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Loader2, Plus, MessageSquare, Send, ArrowLeft, MoreHorizontal, 
  Image as ImageIcon, Smile, X, Users, Calendar, Ticket, Check,
  Reply, Heart, Flame, Laugh, ThumbsUp, Clock, MapPin, Crown
} from 'lucide-react';
import type { Space, SpaceMessage, User } from '@/types';
import { 
  getSpaces, getSpaceMessages, sendSpaceMessage, createSpace, 
  subscribeToSpace, broadcastTyping, subscribeToTyping,
  createEvent, getEventForSpace, createTicket, hasTicket,
  isDemoMode
} from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';
import Modal from '@/components/Modal';
import { formatDistanceToNow, format, differenceInHours } from 'date-fns';

interface SpacesProps {
  currentUser: User | null;
}

interface TypingUser {
  user_id: string;
  username: string;
  avatar: string;
  typing_at: string;
}

interface MessageReaction {
  emoji: string;
  user_id: string;
  username: string;
}

interface EnhancedSpaceMessage extends SpaceMessage {
  reactions?: MessageReaction[];
  replyTo?: EnhancedSpaceMessage;
}

interface SpaceEvent {
  id: string;
  space_id: string;
  name: string;
  description: string;
  location: string;
  event_time: string;
  expires_at: string;
  ticket_price: number;
  max_slots?: number;
  is_paid: boolean;
  created_by: string;
  created_at: string;
  attendees?: number;
}

const REACTIONS = [
  { emoji: '❤️', label: 'love' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '💀', label: 'skull' },
  { emoji: '👍', label: 'thumbsup' },
];

// Generate fake users for demo mode
const generateFakeUsers = (count: number) => {
  const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'];
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `fake-user-${i}`,
    username: names[i % names.length] + Math.floor(Math.random() * 100),
    avatar: JSON.stringify({
      initial: names[i % names.length][0],
      symbol: '◆',
      gradient: gradients[i % gradients.length]
    })
  }));
};

const FAKE_USERS = generateFakeUsers(8);

const Spaces: React.FC<SpacesProps> = ({ currentUser }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [messages, setMessages] = useState<EnhancedSpaceMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [replyingTo, setReplyingTo] = useState<EnhancedSpaceMessage | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [spaceEvent, setSpaceEvent] = useState<SpaceEvent | null>(null);
  const [hasUserTicket, setHasUserTicket] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    ticketPrice: '',
    maxSlots: ''
  });
  const [longPressMessage, setLongPressMessage] = useState<string | null>(null);
  const [swipedMessage, setSwipedMessage] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (activeSpace && currentUser) {
      loadMessages();
      loadEvent();
      
      // Subscribe to new messages
      const messageSubscription = subscribeToSpace(activeSpace.id, (newMsg: any) => {
        setMessages(prev => [...prev, { ...newMsg, reactions: [] }]);
        scrollToBottom();
      });

      // Subscribe to typing indicators
      const typingSubscription = subscribeToTyping(activeSpace.id, (typing: any) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== typing.user_id);
          if (typing.user_id !== currentUser.id) {
            return [...filtered, typing];
          }
          return filtered;
        });
        
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.user_id !== typing.user_id));
        }, 3000);
      });

      // Simulate active users count
      setActiveUsers(Math.floor(Math.random() * 15) + 3);

      return () => {
        messageSubscription.unsubscribe();
        typingSubscription.unsubscribe();
      };
    }
  }, [activeSpace, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle @ mentions
  useEffect(() => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === newMessage.length - 1) {
      setShowMentionList(true);
      setMentionQuery('');
    } else if (lastAtIndex !== -1) {
      const query = newMessage.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    } else {
      setShowMentionList(false);
    }
  }, [newMessage]);

  const loadSpaces = async () => {
    setLoading(true);
    const data = await getSpaces();
    setSpaces(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!activeSpace) return;
    const data = await getSpaceMessages(activeSpace.id, 100);
    
    // Add reactions and enhance messages
    const enhanced = data.map((m: any) => ({
      ...m,
      reactions: m.reactions || []
    }));
    
    setMessages(enhanced);
  };

  const loadEvent = async () => {
    if (!activeSpace) return;
    const event = await getEventForSpace(activeSpace.id);
    if (event) {
      setSpaceEvent(event as SpaceEvent);
      // Check if user has ticket
      const hasTix = await hasTicket(event.id, currentUser?.id || '');
      setHasUserTicket(hasTix);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentUser || !activeSpace || (!newMessage.trim() && !selectedImage)) return;

    setSending(true);
    
    let finalMessage = newMessage.trim();
    if (selectedImage) {
      finalMessage = finalMessage ? `${finalMessage}\n[IMAGE:${selectedImage}]` : `[IMAGE:${selectedImage}]`;
    }

    const messageData: any = {
      space_id: activeSpace.id,
      user_id: currentUser.id,
      message: finalMessage,
    };

    if (replyingTo) {
      messageData.reply_to = replyingTo.id;
    }

    const { error } = await sendSpaceMessage(messageData);

    if (!error) {
      soundManager.playEcho();
      setNewMessage('');
      setReplyingTo(null);
      setSelectedImage(null);
      // Reload messages for demo mode
      if (isDemoMode()) {
        loadMessages();
      }
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    // Convert to data URL for immediate display
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
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

  const handleCreateEvent = async () => {
    if (!currentUser || !activeSpace) return;
    
    const eventDateTime = new Date(`${eventForm.eventDate}T${eventForm.eventTime}`);
    const expiresAt = new Date(eventDateTime.getTime() + 5 * 60 * 60 * 1000); // +5 hours
    
    const eventData = {
      space_id: activeSpace.id,
      name: eventForm.name,
      description: eventForm.description,
      location: eventForm.location,
      event_time: eventDateTime.toISOString(),
      expires_at: expiresAt.toISOString(),
      ticket_price: parseFloat(eventForm.ticketPrice) || 0,
      max_slots: eventForm.maxSlots ? parseInt(eventForm.maxSlots) : null,
      is_paid: parseFloat(eventForm.ticketPrice) > 0,
      created_by: currentUser.id
    };
    
    const { data, error } = await createEvent(eventData);
    
    if (!error && data) {
      soundManager.playPost();
      setShowEventModal(false);
      setEventForm({
        name: '',
        description: '',
        location: '',
        eventDate: '',
        eventTime: '',
        ticketPrice: '',
        maxSlots: ''
      });
      setSpaceEvent(data as SpaceEvent);
      
      // Send event announcement
      await sendSpaceMessage({
        space_id: activeSpace.id,
        user_id: currentUser.id,
        message: `📅 NEW EVENT: ${eventData.name}\n📍 ${eventData.location}\n🕐 ${format(eventDateTime, 'MMM d, h:mm a')}${eventData.is_paid ? `\n💰 $${eventData.ticket_price}` : ''}`
      });
      loadMessages();
    }
  };

  const handleBuyTicket = async () => {
    if (!spaceEvent || !currentUser) return;
    
    // In demo mode, just create ticket directly
    if (isDemoMode()) {
      await createTicket(spaceEvent.id, currentUser.id, `demo-payment-${Date.now()}`);
      setHasUserTicket(true);
      setShowTicketModal(false);
      soundManager.playPost();
      return;
    }
    
    // Real Paystack integration would go here
    setShowTicketModal(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingIndex = reactions.findIndex(r => r.user_id === currentUser?.id);
        
        if (existingIndex >= 0 && reactions[existingIndex].emoji === emoji) {
          reactions.splice(existingIndex, 1);
        } else {
          if (existingIndex >= 0) reactions.splice(existingIndex, 1);
          reactions.push({
            emoji,
            user_id: currentUser?.id || '',
            username: currentUser?.username || ''
          });
        }
        
        return { ...msg, reactions: [...reactions] };
      }
      return msg;
    }));
    setShowReactionPicker(null);
    setLongPressMessage(null);
  };

  // Touch handlers for swipe to reply
  const handleTouchStart = (e: React.TouchEvent, msgId: string) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent, msg: EnhancedSpaceMessage) => {
    if (!touchStart) return;
    const xDiff = touchStart.x - e.touches[0].clientX;
    if (xDiff > 50) {
      setSwipedMessage(msg.id);
    }
  };

  const handleTouchEnd = (msg: EnhancedSpaceMessage) => {
    if (swipedMessage === msg.id) {
      setReplyingTo(msg);
      setSwipedMessage(null);
    }
    setTouchStart(null);
  };

  // Long press for reactions
  const handleMouseDown = (msgId: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressMessage(msgId);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const insertMention = (username: string) => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    const before = newMessage.slice(0, lastAtIndex);
    setNewMessage(`${before}@${username} `);
    setShowMentionList(false);
    messageInputRef.current?.focus();
  };

  const parseAvatar = (avatarStr: string) => {
    try {
      return JSON.parse(avatarStr);
    } catch {
      return { initial: '?', symbol: '◆', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const groupMessagesByDate = (messages: EnhancedSpaceMessage[]) => {
    const groups: { date: string; messages: EnhancedSpaceMessage[] }[] = [];
    let currentGroup: { date: string; messages: EnhancedSpaceMessage[] } | null = null;

    messages.forEach(message => {
      const messageDate = new Date(message.created_at).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  // Countdown for event
  const getEventCountdown = (eventTime: string) => {
    const hours = differenceInHours(new Date(eventTime), new Date());
    if (hours < 0) return 'Event ended';
    if (hours < 1) return 'Starting soon';
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d left`;
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
    const messageGroups = groupMessagesByDate(messages);
    const currentUserAvatar = currentUser ? parseAvatar(currentUser.avatar) : null;

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
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">{activeSpace.name}</h2>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {activeUsers} vibing now
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowEventModal(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Create Event"
          >
            <Calendar className="w-5 h-5 text-white/50" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Pinned Event */}
        {spaceEvent && (
          <div className="mx-4 mt-3 p-4 bg-gradient-to-r from-[#ff2e2e]/20 to-purple-500/20 border border-[#ff2e2e]/30 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#ff2e2e]" />
                  <span className="text-xs text-[#ff2e2e] font-medium uppercase tracking-wide">Event</span>
                  <span className="text-xs text-white/40 ml-auto">{getEventCountdown(spaceEvent.event_time)}</span>
                </div>
                <h3 className="font-semibold text-white">{spaceEvent.name}</h3>
                <p className="text-sm text-white/60 mt-1 line-clamp-2">{spaceEvent.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {spaceEvent.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(spaceEvent.event_time), 'MMM d, h:mm a')}
                  </span>
                </div>
                {spaceEvent.is_paid && (
                  <p className="text-sm text-[#ff2e2e] mt-2 font-medium">
                    💰 ${spaceEvent.ticket_price}
                  </p>
                )}
              </div>
              <div className="ml-4">
                {hasUserTicket ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                    <Check className="w-3 h-3" />
                    Going
                  </div>
                ) : (
                  <button 
                    onClick={spaceEvent.is_paid ? handleBuyTicket : async () => {
                      if (currentUser) {
                        await createTicket(spaceEvent.id, currentUser.id, 'free');
                        setHasUserTicket(true);
                      }
                    }}
                    className="px-4 py-2 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white text-sm font-medium rounded-full transition-colors flex items-center gap-1"
                  >
                    <Ticket className="w-4 h-4" />
                    {spaceEvent.is_paid ? 'Get Access' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.date} className="space-y-3">
              {/* Date Divider */}
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 bg-white/10 rounded-full">
                  <span className="text-xs text-white/50">
                    {groupIndex === 0 && new Date(group.date).toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : format(new Date(group.date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {group.messages.map((msg, index) => {
                const avatar = msg.user ? parseAvatar(msg.user.avatar) : null;
                const isCurrentUser = currentUser?.id === msg.user_id;
                const showAvatar = index === 0 || group.messages[index - 1].user_id !== msg.user_id;
                const hasReactions = msg.reactions && msg.reactions.length > 0;
                const isSwiped = swipedMessage === msg.id;

                return (
                  <div 
                    key={msg.id} 
                    className="group relative"
                    onTouchStart={(e) => handleTouchStart(e, msg.id)}
                    onTouchMove={(e) => handleTouchMove(e, msg)}
                    onTouchEnd={() => handleTouchEnd(msg)}
                    onMouseDown={() => handleMouseDown(msg.id)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Swipe indicator */}
                    {isSwiped && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isCurrentUser ? 'left-0' : 'right-0'} p-2 bg-[#ff2e2e]/20 rounded-full`}>
                        <Reply className="w-4 h-4 text-[#ff2e2e]" />
                      </div>
                    )}

                    {/* Reply Preview */}
                    {msg.replyTo && (
                      <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-start' : 'justify-end'}`}>
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-white/40 border-l-2 border-[#ff2e2e]">
                          <span className="truncate max-w-[150px]">{msg.replyTo.user?.username}: {msg.replyTo.message.replace(/\[IMAGE:.*?\]/g, '📷 Image')}</span>
                        </div>
                      </div>
                    )}

                    <div className={`flex gap-2 ${isCurrentUser ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      {avatar ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center flex-shrink-0 ${!showAvatar ? 'invisible' : ''}`}>
                          <span className="text-white text-xs font-bold">{avatar.initial}</span>
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}

                      <div className={`max-w-[75%] ${isCurrentUser ? 'text-left' : 'text-right'}`}>
                        {/* Username */}
                        {showAvatar && (
                          <p className={`text-xs text-white/50 mb-1 px-1 ${isCurrentUser ? '' : 'text-right'}`}>
                            {msg.user?.username}
                            {msg.user?.premium && (
                              <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />
                            )}
                          </p>
                        )}

                        {/* Message Bubble */}
                        <div className="relative inline-block">
                          <div
                            className={`inline-block px-4 py-2 rounded-2xl cursor-pointer transition-all hover:opacity-90 ${
                              isCurrentUser
                                ? 'bg-white/10 text-white rounded-bl-sm'
                                : 'bg-[#ff2e2e] text-white rounded-br-sm'
                            }`}
                          >
                            {/* Image Message */}
                            {msg.message.includes('[IMAGE:') ? (
                              <>
                                {msg.message.split('\n').map((line, i) => (
                                  line.startsWith('[IMAGE:') ? (
                                    <img 
                                      key={i}
                                      src={line.replace('[IMAGE:', '').replace(']', '')} 
                                      alt="Shared" 
                                      className="max-w-[200px] max-h-[200px] rounded-lg mt-1"
                                    />
                                  ) : line && (
                                    <p key={i} className="text-sm">{line}</p>
                                  )
                                ))}
                              </>
                            ) : (
                              <p className="text-sm">{msg.message}</p>
                            )}
                          </div>

                          {/* Reactions */}
                          {hasReactions && (
                            <div className={`absolute -bottom-3 ${isCurrentUser ? 'left-0' : 'right-0'} flex gap-0.5`}>
                              {msg.reactions?.slice(0, 3).map((reaction, i) => (
                                <span key={i} className="text-xs bg-gray-800 rounded-full px-1.5 py-0.5 border border-white/10 shadow-lg">
                                  {reaction.emoji}
                                </span>
                              ))}
                              {(msg.reactions?.length || 0) > 3 && (
                                <span className="text-xs bg-gray-800 rounded-full px-1.5 py-0.5 border border-white/10 text-white/60">
                                  +{(msg.reactions?.length || 0) - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Reaction Picker */}
                          {showReactionPicker === msg.id && (
                            <div className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} -top-12 bg-gray-800 rounded-full px-2 py-1 shadow-xl border border-white/10 flex gap-1 z-20`}>
                              {REACTIONS.map((reaction) => (
                                <button
                                  key={reaction.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(msg.id, reaction.emoji);
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-full transition-transform hover:scale-110"
                                >
                                  <span className="text-lg">{reaction.emoji}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Long Press Reaction Menu */}
                          {longPressMessage === msg.id && (
                            <div 
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                              onClick={() => setLongPressMessage(null)}
                            >
                              <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl border border-white/10">
                                <p className="text-white/60 text-sm mb-3 text-center">React to message</p>
                                <div className="flex gap-3">
                                  {REACTIONS.map((reaction) => (
                                    <button
                                      key={reaction.label}
                                      onClick={() => handleReaction(msg.id, reaction.emoji)}
                                      className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-transform hover:scale-110 text-2xl"
                                    >
                                      {reaction.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Message Actions (on hover) */}
                          <div className={`absolute ${isCurrentUser ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} top-0 hidden group-hover:flex items-center gap-1 px-1`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingTo(msg);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4 text-white/50" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                              title="React"
                            >
                              <Smile className="w-4 h-4 text-white/50" />
                            </button>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <p className={`text-[10px] text-white/40 mt-1 px-1 ${isCurrentUser ? '' : 'text-right'}`}>
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

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
                  ? `${typingUsers[0].username} is vibing...`
                  : `${typingUsers.length} vibing...`}
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

        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Reply className="w-4 h-4" />
              <span className="truncate max-w-[200px]">Replying to {replyingTo.user?.username}</span>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-white/5 border-t border-white/10">
            <div className="relative inline-block">
              <img src={selectedImage} alt="Selected" className="h-20 rounded-lg" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        {currentUser && (
          <div className="p-4 border-t border-white/10 bg-gray-900 relative">
            {/* Mention List */}
            {showMentionList && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 rounded-xl border border-white/10 shadow-lg max-h-40 overflow-y-auto z-10">
                {[...(messages.map(m => m.user).filter(Boolean) as any[]), ...FAKE_USERS]
                  .filter((user, index, self) => 
                    index === self.findIndex(u => u.id === user.id) &&
                    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user.username)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${parseAvatar(user.avatar).gradient} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{parseAvatar(user.avatar).initial}</span>
                      </div>
                      <span className="text-sm text-white">{user.username}</span>
                    </button>
                  ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5 text-white/50" />
              </button>
              <input
                ref={messageInputRef}
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
                disabled={(!newMessage.trim() && !selectedImage) || sending}
                className="p-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Create Event Modal */}
        <Modal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          title="Create Event"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Event Name</label>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                placeholder="e.g., Summer Vibe Party"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="What's this event about?"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50 resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Location</label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="e.g., Downtown Club"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Date</label>
                <input
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff2e2e]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Time</label>
                <input
                  type="time"
                  value={eventForm.eventTime}
                  onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff2e2e]/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Ticket Price ($)</label>
                <input
                  type="number"
                  value={eventForm.ticketPrice}
                  onChange={(e) => setEventForm({ ...eventForm, ticketPrice: e.target.value })}
                  placeholder="0 for free"
                  min="0"
                  step="0.01"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Max Slots (optional)</label>
                <input
                  type="number"
                  value={eventForm.maxSlots}
                  onChange={(e) => setEventForm({ ...eventForm, maxSlots: e.target.value })}
                  placeholder="Unlimited"
                  min="1"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
                />
              </div>
            </div>
            <button
              onClick={handleCreateEvent}
              disabled={!eventForm.name || !eventForm.location || !eventForm.eventDate || !eventForm.eventTime}
              className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </Modal>

        {/* Ticket Modal */}
        <Modal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          title="Get Ticket"
        >
          {spaceEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="font-semibold text-white">{spaceEvent.name}</h3>
                <p className="text-white/60 text-sm mt-1">{spaceEvent.location}</p>
                <p className="text-[#ff2e2e] text-lg font-bold mt-2">${spaceEvent.ticket_price}</p>
              </div>
              <p className="text-white/60 text-sm text-center">
                This will process payment via Paystack
              </p>
              <button
                onClick={async () => {
                  if (currentUser && spaceEvent) {
                    await createTicket(spaceEvent.id, currentUser.id, `paystack-${Date.now()}`);
                    setHasUserTicket(true);
                    setShowTicketModal(false);
                    soundManager.playPost();
                  }
                }}
                className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                Pay & Get Ticket
              </button>
            </div>
          )}
        </Modal>
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
