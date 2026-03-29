import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DropCreatorProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MOODS = ['Happy', 'Excited', 'Chill', 'Thoughtful', 'Creative', 'Energetic', 'Peaceful', 'Mysterious'];

const EXPIRY_OPTIONS = [
  { label: 'Lifetime', hours: null },
  { label: '1 Hour', hours: 1 },
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours', hours: 12 },
  { label: '24 Hours', hours: 24 },
];

interface PollOption {
  id: string;
  text: string;
}

export function DropCreator({ onClose, onSuccess }: DropCreatorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [category, setCategory] = useState<'stream' | 'pulse' | 'spaces'>('stream');
  const [expiryHours, setExpiryHours] = useState<number | null>(24);
  const [isGhost, setIsGhost] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function addPollOption() {
    setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
  }

  function removePollOption(id: string) {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(opt => opt.id !== id));
    }
  }

  function updatePollOption(id: string, text: string) {
    setPollOptions(pollOptions.map(opt => opt.id === id ? { ...opt, text } : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (category === 'pulse') {
        if (!pollQuestion.trim()) {
          alert('Please enter a question');
          setLoading(false);
          return;
        }

        if (pollOptions.some(opt => !opt.text.trim())) {
          alert('Please fill in all options');
          setLoading(false);
          return;
        }

        const formattedOptions = pollOptions.map(opt => ({ text: opt.text.trim() }));

        const expiresAt = expiryHours
          ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
          : null;

        const { error: insertError } = await supabase
          .from('pulses')
          .insert({
            user_id: user.id,
            question: pollQuestion.trim(),
            options: formattedOptions,
            mood: selectedMood,
            is_ghost: isGhost,
            expires_at: expiresAt,
          });

        if (insertError) throw insertError;
      } else if (category === 'spaces') {
        if (!content.trim()) {
          alert('Please enter a space name');
          setLoading(false);
          return;
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { error: insertError } = await supabase
          .from('spaces')
          .insert({
            creator_id: user.id,
            name: content.trim(),
            description: null,
            expires_at: expiresAt.toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        if (!content.trim() && !imageFile) {
          alert('Please add some content or an image');
          setLoading(false);
          return;
        }

        let imageUrl = null;

        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('drops')
            .upload(fileName, imageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('drops')
            .getPublicUrl(fileName);

          imageUrl = publicUrl;
        }

        const expiresAt = expiryHours
          ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
          : null;

        const { error: insertError } = await supabase
          .from('drops')
          .insert({
            user_id: user.id,
            content: content.trim() || null,
            image_url: imageUrl,
            mood: selectedMood,
            category: 'stream',
            is_ghost: isGhost,
            expires_at: expiresAt,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto pointer-events-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {category === 'pulse' ? 'Create a Poll' : category === 'spaces' ? 'Create a Space' : 'Create a Drop'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="flex gap-2">
              {(['stream', 'pulse', 'spaces'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    category === cat
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {category === 'pulse' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full h-20 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Options
                </label>
                <div className="space-y-2">
                  {pollOptions.map((option) => (
                    <div key={option.id} className="flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updatePollOption(option.id, e.target.value)}
                        placeholder={`Option ${pollOptions.indexOf(option) + 1}`}
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(option.id)}
                          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPollOption}
                  className="mt-2 px-4 py-2 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={category === 'spaces' ? 'Space name...' : 'What\'s on your mind?'}
                  className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {imagePreview && category === 'stream' && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedMood === mood
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {category !== 'spaces' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expires In
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {EXPIRY_OPTIONS.map((option) => (
                  <button
                    key={option.hours ?? 'lifetime'}
                    type="button"
                    onClick={() => setExpiryHours(option.hours)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      expiryHours === option.hours
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGhost}
                onChange={(e) => setIsGhost(e.target.checked)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghost Mode
              </span>
            </label>

            {category === 'stream' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Image
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (category === 'pulse' ? !pollQuestion.trim() : !content.trim() && !imageFile)}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              `Create ${category === 'pulse' ? 'Poll' : category === 'spaces' ? 'Space' : 'Drop'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
