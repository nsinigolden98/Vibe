import { useState, useRef, useEffect } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import { X, Zap, Image, Loader2, Clock } from 'lucide-react';
import { MOOD_CONFIG } from '@/types';
import type { Mood } from '@/types';

export default function DropCreator() {
  const { 
    isDropCreatorOpen, 
    closeDropCreator, 
    createDrop, 
    currentUser, 
    settings,
    dropCreatorCategory,
  } = useVibeStore();
  
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
  const [selectedCategory, setSelectedCategory] = useState<'stream' | 'pulse' | 'spaces'>(dropCreatorCategory);
  const [fadeMinutes, setFadeMinutes] = useState<number>(1440); // Default 24 hours
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isDark = settings.theme === 'dark';
  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const moods: Mood[] = ['angry', 'happy', 'sad', 'thoughtful', 'funny', 'neutral'];
  const categories: { id: 'stream' | 'pulse' | 'spaces'; label: string; icon: string }[] = [
    { id: 'stream', label: 'Stream', icon: '🌊' },
    { id: 'pulse', label: 'Pulse', icon: '💓' },
    { id: 'spaces', label: 'Spaces', icon: '🚀' },
  ];

  const fadeOptions = [
    { label: '1h', value: 60 },
    { label: '6h', value: 360 },
    { label: '12h', value: 720 },
    { label: '24h', value: 1440 },
  ];

  // Focus textarea when opened
  useEffect(() => {
    if (isDropCreatorOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isDropCreatorOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isDropCreatorOpen) {
      setContent('');
      setSelectedMood('neutral');
      setSelectedCategory(dropCreatorCategory);
      setFadeMinutes(1440);
      setImageUrl(undefined);
    }
  }, [isDropCreatorOpen, dropCreatorCategory]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !imageUrl) return;
    
    setIsSubmitting(true);
    
    // Create drop immediately
    createDrop(content, selectedMood, selectedCategory, false, fadeMinutes, imageUrl);
    
    // Close and reset
    setIsSubmitting(false);
    closeDropCreator();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  if (!isDropCreatorOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeDropCreator}
      />
      
      {/* Bottom Slide-up Panel */}
      <div 
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-t-3xl overflow-hidden transition-transform duration-300 ease-out`}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2" onClick={closeDropCreator}>
          <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-4 pb-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ff2e2e] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Drop</h3>
          </div>
          <button 
            onClick={closeDropCreator}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentUser.avatar.gradient} flex items-center justify-center`}>
                <span className="text-white font-bold">{currentUser.avatar.initial}</span>
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser.username}
                </p>
                <p className="text-xs text-gray-500">Posting to {selectedCategory}</p>
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div className="mb-4">
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Post To
            </p>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedCategory === cat.id 
                      ? 'bg-[#ff2e2e] text-white' 
                      : isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            maxLength={maxLength}
            rows={4}
            className={`w-full p-4 rounded-xl resize-none outline-none text-base ${
              isDark 
                ? 'bg-white/5 text-white placeholder-gray-500' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-400'
            }`}
          />
          <div className="flex justify-between items-center mt-1 mb-4">
            <span className={`text-xs ${remainingChars < 50 ? 'text-[#ff2e2e]' : 'text-gray-500'}`}>
              {remainingChars} characters left
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Cmd+Enter to post
            </span>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Image
            </p>
            
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imageUrl} alt="Upload preview" className="w-full h-48 object-cover" />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                  isDark 
                    ? 'border-white/20 hover:border-white/40 text-gray-400' 
                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Image className="w-5 h-5" />
                    <span>Add Image</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Mood Selector */}
          <div className="mb-4">
            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Mood
            </p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => {
                const config = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'ring-2 ring-offset-2 ring-offset-transparent' 
                        : ''
                    } ${isDark ? 'ring-offset-[#1a1a1a]' : 'ring-offset-white'}`}
                    style={{
                      backgroundColor: isSelected ? `${config.color}30` : isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                      color: config.color,
                      boxShadow: isSelected ? `0 0 0 2px ${config.color}` : 'none',
                    }}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiry Timer */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Expires In
              </p>
            </div>
            <div className="flex gap-2">
              {fadeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFadeMinutes(option.value)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    fadeMinutes === option.value 
                      ? 'bg-[#ff2e2e] text-white' 
                      : isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} bg-inherit`}>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !imageUrl) || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff2e2e] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e62929] transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" fill="white" />
                Drop It
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
