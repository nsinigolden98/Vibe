import React, { useState, useRef } from 'react';
import { X, Image, Clock, Ghost, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import type { User, Mood } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import { createDrop, uploadImage } from '@/services/supabaseClient';
import { soundManager } from '@/sounds/SoundManager';

interface CreateDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: () => void;
  defaultCategory?: 'stream' | 'pulse' | 'spaces';
}

const moods: Mood[] = ['happy', 'sad', 'angry', 'excited', 'chill', 'anxious', 'loved', 'bored', 'confused', 'grateful'];

const expiryOptions = [
  { value: null, label: 'Lifetime' },
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' }
];

const CreateDropModal: React.FC<CreateDropModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  defaultCategory = 'stream'
}) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('happy');
  const [category, setCategory] = useState<'stream' | 'pulse' | 'spaces'>(defaultCategory);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showExpirySelector, setShowExpirySelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const calculateExpiryDate = (expiryValue: string | null): string | undefined => {
    if (!expiryValue) return undefined;
    
    const now = new Date();
    switch (expiryValue) {
      case '1h':
        now.setHours(now.getHours() + 1);
        break;
      case '24h':
        now.setHours(now.getHours() + 24);
        break;
      case '7d':
        now.setDate(now.getDate() + 7);
        break;
      case '30d':
        now.setDate(now.getDate() + 30);
        break;
    }
    return now.toISOString();
  };

  const handleSubmit = async () => {
    if (!currentUser || !content.trim()) return;

    setLoading(true);

    try {
      let imageUrl: string | undefined;
      
      if (image) {
        imageUrl = await uploadImage(image, 'drops') || undefined;
      }

      const { error } = await createDrop({
        user_id: currentUser.id,
        content: content.trim(),
        image_url: imageUrl,
        mood: selectedMood,
        category,
        expires_at: calculateExpiryDate(expiry),
        ghost_mode: ghostMode
      });

      if (!error) {
        soundManager.playPost();
        setContent('');
        setImage(null);
        setImagePreview(null);
        setGhostMode(false);
        setExpiry(null);
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating drop:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryLabels = {
    stream: 'Drop to Stream',
    pulse: 'Create Pulse',
    spaces: 'Share in Spaces'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-gray-900 border border-white/10 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{categoryLabels[category]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Mood Selector */}
          <div className="mb-4">
            <button
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full text-sm transition-colors hover:bg-white/20"
              style={{ color: MOOD_COLORS[selectedMood] }}
            >
              <span className="text-lg">{MOOD_EMOJIS[selectedMood]}</span>
              <span className="capitalize">{selectedMood}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showMoodSelector && (
              <div className="mt-2 p-2 bg-gray-800 rounded-xl grid grid-cols-5 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => {
                      setSelectedMood(mood);
                      setShowMoodSelector(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      selectedMood === mood ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl">{MOOD_EMOJIS[mood]}</span>
                    <span className="text-xs text-white/70 capitalize">{mood}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your vibe?"
            className="w-full bg-transparent text-white text-lg placeholder:text-white/40 resize-none focus:outline-none min-h-[120px]"
            maxLength={500}
          />
          
          {/* Character Count */}
          <div className="text-right text-xs text-white/40 mb-4">
            {content.length}/500
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900">
          {/* Options */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Add image"
            >
              <Image className="w-5 h-5 text-[#ff2e2e]" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExpirySelector(!showExpirySelector)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  expiry ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' : 'hover:bg-white/10 text-white/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{expiry ? expiryOptions.find(o => o.value === expiry)?.label : 'Expiry'}</span>
              </button>
              
              {showExpirySelector && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[120px] z-10">
                  {expiryOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setExpiry(option.value);
                        setShowExpirySelector(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        expiry === option.value ? 'bg-[#ff2e2e]/20 text-[#ff2e2e]' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setGhostMode(!ghostMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                ghostMode ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white/50'
              }`}
            >
              <Ghost className="w-4 h-4" />
              <span>Ghost</span>
            </button>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Dropping...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Drop It
              </>
            )}
          </button>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreateDropModal;
