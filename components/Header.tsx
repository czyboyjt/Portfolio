
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems: { id: View; label: string; disabled?: boolean; hidden?: boolean }[] = [
    { id: 'work', label: 'Work' },
    { id: 'case-studies', label: 'Case Studies', disabled: true, hidden: true },
    { id: 'info', label: 'Info' },
  ];
  const visibleNavItems = navItems.filter((item) => !item.hidden);

  const handleConnectClick = () => {
    setIsMenuOpen(false);
    const footerElement = document.getElementById('contact');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileNavClick = (item: { id: View; disabled?: boolean }) => {
    if (item.disabled) return;
    onViewChange(item.id);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 mt-3 md:mt-0 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        {/* Logo - Left */}
        <div
          className="cursor-pointer z-10 group"
          onClick={() => { onViewChange('work'); setIsMenuOpen(false); }}
        >
          <div className="w-12 h-12 rounded-sm flex items-center justify-center transition-transform group-hover:scale-105 shadow-xl overflow-hidden">
            <img 
              src="/images/Czyboylogo2.webp" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        
        {/* Navigation - Center Pill */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 glass p-1.5 rounded-full border border-white/10 shadow-xl overflow-visible">
          {visibleNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && onViewChange(item.id)}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  item.disabled
                    ? 'text-white/25 cursor-not-allowed'
                    : isActive
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && !item.disabled && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-white rounded-full shadow-[0_0_15px_4px_rgba(255,255,255,0.6)] z-20" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action - Right */}
        <div className="z-10 flex items-center gap-3">
          <button
            onClick={handleConnectClick}
            className={`hidden sm:inline-flex glass px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10 text-white hover:bg-white/10 active:scale-95`}
          >
            Connect
          </button>

          {/* Mobile Menu Toggle */}
          {!isMenuOpen && (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden glass w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[#080808]/98 backdrop-blur-xl transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-8 right-6 glass w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
          {visibleNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavClick(item)}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                className={`text-3xl font-display font-bold tracking-tight py-3 transition-all ${
                  item.disabled
                    ? 'text-white/20 cursor-not-allowed'
                    : isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
