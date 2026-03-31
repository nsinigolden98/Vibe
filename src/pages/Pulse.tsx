import React, { useState, useEffect } from 'react';
import { Loader2, Plus, BarChart2 } from 'lucide-react';
import type { Drop, User } from '@/types';
import { getDrops, createPulse } from '@/services/supabaseClient';
import PulseCard from '@/components/PulseCard';
import Modal from '@/components/Modal';
import { soundManager } from '@/sounds/SoundManager';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import type { Mood } from '@/types';

interface PulseProps {
  currentUser: User | null;
}

const moods: Mood[] = ['happy', 'sad', 'angry', 'excited', 'chill', 'anxious', 'loved', 'bored', 'confused', 'grateful'];

const Pulse: React.FC<PulseProps> = ({ currentUser }) => {
  const [pulses, setPulses] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [selectedMood, setSelectedMood] = useState<Mood>('happy');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPulses();
  }, []);

  const loadPulses = async () => {
    setLoading(true);
    try {
      const allDrops = await getDrops(50);
      const pulseDrops = allDrops.filter(d => d.category === 'pulse');
      setPulses(pulseDrops);
    } catch (error) {
      console.error('Error loading pulses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
      soundManager.playClick();
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      soundManager.playClick();
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePulse = async () => {
    if (!currentUser || !question.trim() || options.some(o => !o.trim())) return;

    setCreating(true);
    try {
      const { error } = await createPulse(
        {
          user_id: currentUser.id,
          content: question.trim(),
          mood: selectedMood,
          category: 'pulse',
          ghost_mode: false
        },
        options.filter(o => o.trim())
      );

      if (!error) {
        soundManager.playPost();
        setShowCreateModal(false);
        setQuestion('');
        setOptions(['', '']);
        setSelectedMood('happy');
        await loadPulses();
      }
    } catch (err) {
      console.error('Error creating pulse:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#ff2e2e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#ff2e2e]" />
            Pulse
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

      {/* Pulses List */}
      <div className="p-4 pb-24 lg:pb-4">
        {pulses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <BarChart2 className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No pulses yet</h3>
            <p className="text-white/50">Create a poll and see what people think!</p>
          </div>
        ) : (
          pulses.map((pulse) => (
            <PulseCard
              key={pulse.id}
              pulse={pulse}
              currentUser={currentUser}
              onVote={loadPulses}
            />
          ))
        )}
      </div>

      {/* Create Pulse Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Pulse"
        size="lg"
      >
        <div className="space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50 resize-none"
              rows={2}
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(mood);
                    soundManager.playClick();
                  }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition-colors ${
                    selectedMood === mood
                      ? 'bg-white/20'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  style={{ color: MOOD_COLORS[mood] }}
                >
                  <span>{MOOD_EMOJIS[mood]}</span>
                  <span className="capitalize">{mood}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2e2e]/50"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2.5 hover:bg-white/10 rounded-xl text-white/50 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-1 text-sm text-[#ff2e2e] hover:text-[#ff2e2e]/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleCreatePulse}
            disabled={!question.trim() || options.some(o => !o.trim()) || creating}
            className="w-full py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <BarChart2 className="w-5 h-5" />
                Create Pulse
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Pulse;
