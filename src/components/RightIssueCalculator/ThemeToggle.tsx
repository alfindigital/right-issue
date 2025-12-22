import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (!savedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add transition class to html for smooth color transitions
    document.documentElement.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    
    setTimeout(() => {
      setIsDark(!isDark);
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
      
      setTimeout(() => {
        setIsAnimating(false);
        document.documentElement.style.transition = '';
      }, 400);
    }, 150);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 overflow-hidden group"
      aria-label="Toggle Theme"
      disabled={isAnimating}
    >
      {/* Background glow effect */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with rotation animation */}
      <span className={`relative flex items-center justify-center transition-all duration-500 ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}>
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300" />
        ) : (
          <Moon className="w-4 h-4 text-blue-200" />
        )}
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

export default ThemeToggle;
