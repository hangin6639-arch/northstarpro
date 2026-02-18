
import React from 'react';

interface HeaderProps {
  onNavClick: (view: 'mission' | 'vision' | 'archive' | 'subscribe') => void;
  isPro: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, isPro }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/60 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-star text-white text-xs"></i>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NORTH STAR UNIVERSE <span className="text-blue-500">2.0</span>
          </span>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-400">
          <button onClick={() => onNavClick('mission')} className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Mission</button>
          <button onClick={() => onNavClick('vision')} className="hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black">Vision</button>
          <button onClick={() => onNavClick('archive')} className="hover:text-white transition-colors flex items-center space-x-1 uppercase tracking-widest text-[10px] font-black">
            <span>Archive</span>
            <i className="fa-solid fa-box-archive text-[10px]"></i>
          </button>
        </nav>
        
        <button 
          onClick={() => onNavClick('subscribe')}
          className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-black transition-all transform active:scale-95 ${
            isPro 
            ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]' 
            : 'bg-white text-slate-950 hover:bg-blue-50'
          }`}
        >
          <i className={`fa-solid ${isPro ? 'fa-crown' : 'fa-gem'}`}></i>
          <span>{isPro ? 'PRO 활성화됨' : 'North Star PRO 구독'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
