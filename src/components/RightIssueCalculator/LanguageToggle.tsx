import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleLanguage = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setLanguage(language === 'id' ? 'en' : 'id');
      
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
      
      {/* Icon with animation */}
      <span className={`relative flex items-center justify-center transition-all duration-300 ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}>
        <Languages className="w-4 h-4" />
      </span>
      
      {/* Language label */}
      <span className={`relative text-xs font-semibold uppercase transition-all duration-300 ${isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
        {language}
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
