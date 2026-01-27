import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import classNames from 'classnames';

export interface DropdownItem {
  label: string;
  value?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  className?: string;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  onItemClick?: (item: DropdownItem) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position,
  placement = 'bottom-left',
  align = 'left',
  className,
  menuClassName,
  onItemClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    if (onItemClick) {
      onItemClick(item);
    }

    setIsOpen(false);
  };

  const getPlacementClasses = () => {
    const baseClasses = 'absolute z-50 min-w-[200px]';

    // If position is provided, use it (simpler positioning)
    if (position) {
      switch (position) {
        case 'top':
          return `${baseClasses} bottom-full left-0 mb-2`;
        case 'bottom':
          return `${baseClasses} top-full left-0 mt-2`;
        case 'left':
          return `${baseClasses} right-full top-0 mr-2`;
        case 'right':
          return `${baseClasses} left-full top-0 ml-2`;
        default:
          return `${baseClasses} top-full left-0 mt-2`;
      }
    }

    // Otherwise, use the legacy placement prop
    switch (placement) {
      case 'bottom-right':
        return `${baseClasses} top-full right-0 mt-2`;
      case 'top-left':
        return `${baseClasses} bottom-full left-0 mb-2`;
      case 'top-right':
        return `${baseClasses} bottom-full right-0 mb-2`;
      case 'bottom-left':
      default:
        return `${baseClasses} top-full left-0 mt-2`;
    }
  };

  return (
    <div className={classNames('relative', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div
            className={classNames(
              getPlacementClasses(),
              'bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden',
              menuClassName
            )}
          >
            <div className="py-2">
              {items.map((item, index) => {
                if (item.divider) {
                  return (
                    <div key={`divider-${index}`} className="my-1 border-t border-slate-100" />
                  );
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={classNames(
                      'w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-slate-50 transition-colors text-sm font-medium',
                      {
                        'opacity-50 cursor-not-allowed': item.disabled,
                        'cursor-pointer': !item.disabled,
                        'text-slate-700': !item.disabled,
                        'text-red-600 hover:bg-red-50': item.className?.includes('danger'),
                      },
                      item.className
                    )}
                  >
                    {item.icon && <span className="flex-shrink-0 text-slate-400">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
