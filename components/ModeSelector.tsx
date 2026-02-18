
import React from 'react';
import { UserMode } from '../types';
import { MODE_CONFIG } from '../constants';

interface ModeSelectorProps {
  selectedMode: UserMode | null;
  onSelect: (mode: UserMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {(Object.values(UserMode) as UserMode[]).map((mode) => {
        const config = MODE_CONFIG[mode];
        const isSelected = selectedMode === mode;
        
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            className={`relative p-6 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden group ${
              isSelected 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]' 
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="relative z-10">
              <div className="text-3xl mb-4 transform transition-transform group-hover:scale-110 duration-500">
                {config.icon}
              </div>
              <h3 className="text-lg font-bold mb-1">{config.label}</h3>
              <p className="text-xs text-blue-400 font-medium mb-3">{config.target}</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {config.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
