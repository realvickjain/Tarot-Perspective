
import React from 'react';
import { TarotCard } from '../types.ts';

interface CardProps {
  card: TarotCard;
  isFlipped: boolean;
  isDimmed: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, isDimmed, onSelect, disabled }) => {
  return (
    <div 
      onClick={() => !disabled && onSelect()}
      className={`relative w-32 h-48 md:w-40 md:h-60 perspective-1000 cursor-pointer transition-all duration-500 transform 
        ${isDimmed ? 'opacity-40 scale-95 grayscale' : 'opacity-100 scale-100'} 
        ${disabled ? '' : 'hover:-translate-y-2'}`}
    >
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full rounded-xl border-4 border-indigo-100 bg-indigo-600 backface-hidden flex items-center justify-center p-4">
          <div className="w-full h-full border-2 border-indigo-400 border-dashed rounded-lg flex items-center justify-center">
            <div className="text-indigo-300 text-3xl opacity-50">✨</div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full rounded-xl border-4 border-white bg-white backface-hidden rotate-y-180 flex flex-col items-center justify-center overflow-hidden shadow-xl">
           <img 
              src={card.image} 
              alt={card.name} 
              className="w-full h-3/4 object-cover grayscale-[0.3]"
           />
           <div className="p-2 text-center bg-white w-full h-1/4 flex items-center justify-center">
              <span className="text-xs md:text-sm font-semibold text-slate-700 leading-tight uppercase tracking-wider">{card.name}</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Card;
