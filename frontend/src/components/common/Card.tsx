import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  headerActions
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
};
export default Card;
