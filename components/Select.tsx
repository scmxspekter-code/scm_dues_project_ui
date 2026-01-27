import React, { SelectHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  options: Array<{ value: string; label: string }>;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3',
  lg: 'px-4 py-4 text-lg',
};

const iconPadding = {
  sm: 'pl-10',
  md: 'pl-12',
  lg: 'pl-12',
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  touched,
  leftIcon,
  helperText,
  containerClassName,
  labelClassName,
  size = 'md',
  className,
  id,
  options,
  ...props
}) => {
  const selectId = id || `select-${props.name || 'field'}`;
  const hasError = touched && !!error;
  const hasLeftIcon = !!leftIcon;

  return (
    <div className={classNames('space-y-2', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className={classNames('block text-sm font-bold text-slate-700', labelClassName)}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          className={classNames(
            'w-full bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700 appearance-none',
            sizeClasses[size],
            hasLeftIcon && iconPadding[size],
            {
              'border-red-300 focus:border-red-500': hasError,
              'border-slate-200': !hasError,
            },
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {hasError && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

      {helperText && !hasError && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};
