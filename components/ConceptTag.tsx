'use client';

import { X } from 'lucide-react';

export interface ConceptTagProps {
  name: string;
  onClick?: (name: string) => void;
  onRemove?: (name: string) => void;
  variant?: 'default' | 'interactive' | 'removable';
  size?: 'sm' | 'md';
}

export default function ConceptTag({
  name,
  onClick,
  onRemove,
  variant = 'default',
  size = 'md'
}: ConceptTagProps) {
  const isClickable = variant === 'interactive' || onClick;
  const isRemovable = variant === 'removable' || onRemove;

  const handleClick = () => {
    if (onClick && !isRemovable) {
      onClick(name);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(name);
    }
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-caption'
    : 'px-3 py-1.5 text-body';

  return (
    <span
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium transition-all ${sizeClasses} ${
        isClickable ? 'cursor-pointer hover:bg-brand-primary/20' : ''
      }`}
    >
      {name}
      {isRemovable && (
        <button
          onClick={handleRemove}
          className="hover:text-brand-hover transition-colors"
          aria-label={`Remove ${name} tag`}
        >
          <X size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  );
}
