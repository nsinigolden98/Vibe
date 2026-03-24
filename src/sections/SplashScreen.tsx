import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function SplashScreen() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ff2e2e] rounded-full filter blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ff2e2e] rounded-full filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ff2e2e] to-[#b91c1c] flex items-center justify-center mb-6 glow-red scale-in">
          <Zap className="w-12 h-12 text-white" fill="white" />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-wider glow-red-text">
          VIBE
        </h1>
        <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">
          Feel the Connection
        </p>
      </div>

      {/* Enter Button */}
      {showButton && (
        <button
          className="absolute bottom-20 z-10 px-10 py-4 bg-[#ff2e2e] text-white font-semibold rounded-full glow-red slide-up touch-feedback"
          onClick={() => {}}
        >
          Enter the Vibe
        </button>
      )}

      {/* Loading Dots */}
      {!showButton && (
        <div className="absolute bottom-24 flex gap-2">
          <div className="w-2 h-2 bg-[#ff2e2e] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#ff2e2e] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-[#ff2e2e] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      )}
    </div>
  );
}
