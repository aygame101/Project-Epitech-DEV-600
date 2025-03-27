import React from 'react';
import { Card as CardType } from './types'; // Assuming you have a Card type definition

interface CardProps {
  card: CardType;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, onClick, className = '' }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all active:scale-[0.98] ${className}`}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        touchAction: 'manipulation' // Improves touch responsiveness
      }}
    >
      {/* Card Header - Stacked on mobile */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 text-white">
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg sm:text-xl font-bold line-clamp-1">{card.title}</h3>
          {card.subtitle && (
            <p className="text-xs sm:text-sm opacity-80 line-clamp-1">{card.subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Card Body - Adjusted spacing for mobile */}
      <div className="p-3 sm:p-4">
        {card.imageUrl && (
          <div className="mb-3 overflow-hidden rounded-lg">
            <img 
              src={card.imageUrl} 
              alt={card.title} 
              className="w-full h-auto object-cover"
              loading="lazy" // Improves mobile performance
            />
          </div>
        )}
        
        <div className="space-y-2">
          {card.description && (
            <p className="text-gray-600 text-sm sm:text-base line-clamp-2 sm:line-clamp-3">
              {card.description}
            </p>
          )}
          
          {card.details && (
            <ul className="text-xs sm:text-sm text-gray-500 space-y-1">
              {Object.entries(card.details).map(([key, value]) => (
                <li key={key} className="flex flex-wrap">
                  <span className="font-medium text-gray-700 mr-1">{key}:</span>
                  <span className="break-all">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Card Footer - Stacked actions on mobile */}
      {(card.footerText || card.actions) && (
        <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-50">
          {card.footerText && (
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0">
              {card.footerText}
            </p>
          )}
          
          {card.actions && (
            <div className="flex flex-wrap gap-2">
              {card.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.handler();
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-md ${
                    action.variant === 'primary'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{
                    minWidth: '80px', // Better touch target
                    minHeight: '32px' // Better touch target
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;