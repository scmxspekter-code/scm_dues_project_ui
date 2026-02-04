import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import classNames from 'classnames';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface CustomSelectProps {
  label?: string | ReactNode;
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  name?: string;
  /** Blur handler (e.g. Formik handleBlur). Called with event when available. */
  onBlur?: (e?: React.FocusEvent<HTMLElement>) => void;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-4 py-4 text-sm',
};

const iconPadding = {
  sm: 'pl-10',
  md: 'pl-12',
  lg: 'pl-12',
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  touched,
  leftIcon,
  helperText,
  containerClassName,
  labelClassName,
  size = 'md',
  disabled = false,
  searchable = false,
  className,
  name,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = touched && !!error;
  const hasLeftIcon = !!leftIcon;

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={classNames('space-y-2', containerClassName)} ref={selectRef}>
      {label && (
        <div id={name} className={classNames('block text-sm font-bold text-slate-700', labelClassName)}>
          {label}
        </div>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={classNames(
            'w-full bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700 text-left flex items-center justify-between',
            sizeClasses[size],
            hasLeftIcon && iconPadding[size],
            {
              'border-red-300 focus:border-red-500': hasError,
              'border-slate-200': !hasError,
              'opacity-50 cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
            },
            className
          )}
        >
          <span
            className={classNames('flex items-center space-x-2 flex-1 ', {
              'text-slate-400': !selectedOption,
            })}
          >
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </span>
          <ChevronDown
            size={16}
            className={classNames('text-slate-400 shrink-0 ml-2 transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </button>

        {/* Hidden input for form compatibility */}
        {name && <input type="hidden" name={name} value={value || ''} />}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-3 ">
            {searchable && (
              <div className="p-2 border-b border-slate-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={classNames(
                      'w-full px-4 py-3 text-left  hover:bg-slate-50 transition-colors',
                      {
                        'bg-cyan-50 text-cyan-600': value === option.value,
                        'text-slate-700': value !== option.value,
                        'opacity-50 cursor-not-allowed': option.disabled,
                        'cursor-pointer': !option.disabled,
                      }
                    )}
                  >
                    <span className="flex items-center space-x-2 flex-1">
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                    </span>
                
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {hasError && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

      {helperText && !hasError && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};
