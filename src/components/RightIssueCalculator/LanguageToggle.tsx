import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/analytics';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleLanguage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      const next = language === 'id' ? 'en' : 'id';
      track('language_changed', { to: next });
      setLanguage(next);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 150);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 overflow-hidden group flex items-center gap-1.5"
      aria-label="Toggle Language"
      disabled={isAnimating}
    >
      {/* Background glow effect */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Language label */}
      <span className={`relative text-xs font-bold uppercase transition-all duration-300 ${isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        {language === 'id' ? 'ID' : 'EN'}
      </span>
      
      {/* Ripple effect on click */}
      {isAnimating && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-white/30 animate-ping" />
        </span>
      )}
    </button>
  );
};

export default LanguageToggle;
