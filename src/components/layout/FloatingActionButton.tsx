import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 md:bottom-6 w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-40"
      aria-label="Create Drop"
    >
      <Plus className="w-7 h-7" />
    </button>
  );
}
