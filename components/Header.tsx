
import React, { useState, useEffect } from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: View; label: string }[] = [
    { id: 'work', label: 'Work' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'info', label: 'Info' },
  ];

  const handleConnectClick = () => {
    const footerElement = document.getElementById('contact');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        {/* Logo - Left */}
        <div 
          className="cursor-pointer z-10 group"
          onClick={() => onViewChange('work')}
        >
          <div className="w-12 h-12 rounded-sm flex items-center justify-center transition-transform group-hover:scale-105 shadow-xl overflow-hidden">
            <img 
              src="/images/Czyboylogo2.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        {/* Navigation - Center Pill */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 glass p-1.5 rounded-full border border-white/10 shadow-xl overflow-visible">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => onViewChange(item.id)} 
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-white rounded-full shadow-[0_0_15px_4px_rgba(255,255,255,0.6)] z-20" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action - Right */}
        <div className="z-10">
          <button 
            onClick={handleConnectClick}
            className={`glass px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10 text-white hover:bg-white/10 active:scale-95`}
          >
            Connect
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
