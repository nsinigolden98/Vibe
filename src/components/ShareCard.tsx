import React, { useRef, useCallback } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import type { Drop } from '@/types';
import { MOOD_COLORS, MOOD_EMOJIS } from '@/types';
import Modal from './Modal';

interface ShareCardProps {
  drop: Drop | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ drop, isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(() => {
    if (!drop || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Card dimensions
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const moodColor = MOOD_COLORS[drop.mood];
    const moodEmoji = MOOD_EMOJIS[drop.mood];

    // Background - dark gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Glow effect
    const glowGradient = ctx.createRadialGradient(width/2, height/3, 0, width/2, height/3, 600);
    glowGradient.addColorStop(0, `${moodColor}20`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // Border glow
    ctx.strokeStyle = `${moodColor}40`;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // VIBE Logo
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#ff2e2e';
    ctx.textAlign = 'center';
    ctx.fillText('V', width / 2, 100);
    
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VIBE', width / 2, 150);

    // "Someone on VIBE said" text
    ctx.font = '300 32px sans-serif';
    ctx.fillStyle = '#ffffff80';
    ctx.fillText('Someone on VIBE said:', width / 2, 250);

    // Mood badge
    ctx.beginPath();
    ctx.roundRect(width / 2 - 100, 290, 200, 60, 30);
    ctx.fillStyle = `${moodColor}30`;
    ctx.fill();
    ctx.strokeStyle = moodColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = moodColor;
    ctx.fillText(`${moodEmoji} ${drop.mood.toUpperCase()}`, width / 2, 330);

    // Content text (wrapped)
    ctx.font = '400 48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const words = drop.content.split(' ');
    let line = '';
    let y = 450;
    const lineHeight = 70;
    const maxWidth = 900;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, width / 2, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // Timestamp
    ctx.font = '300 24px sans-serif';
    ctx.fillStyle = '#ffffff60';
    const date = new Date(drop.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    ctx.fillText(date, width / 2, height - 200);

    // Bottom branding
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#ff2e2e';
    ctx.fillText('Join the VIBE', width / 2, height - 120);

    ctx.font = '300 22px sans-serif';
    ctx.fillStyle = '#ffffff60';
    ctx.fillText('vibe.app', width / 2, height - 80);

    return canvas.toDataURL('image/png');
  }, [drop]);

  const handleDownload = () => {
    const dataUrl = generateCard();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `vibe-drop-${drop?.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const dataUrl = generateCard();
    if (!dataUrl) return;

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `vibe-drop-${drop?.id}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Check out this VIBE drop',
          text: drop?.content || ''
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to download
      handleDownload();
    }
  };

  if (!isOpen || !drop) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Drop" size="lg">
      <div className="space-y-6">
        {/* Preview */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-xl shadow-2xl"
            style={{ maxHeight: '400px', width: 'auto' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-[#ff2e2e] hover:bg-[#ff2e2e]/80 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Link copy */}
        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
          <input
            type="text"
            value={`${window.location.origin}/drop/${drop.id}`}
            readOnly
            className="flex-1 bg-transparent text-white/60 text-sm outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/drop/${drop.id}`);
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareCard;
