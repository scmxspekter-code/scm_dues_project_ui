import React, { InputHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3',
  lg: 'px-4 py-4 text-lg',
};

const iconPadding = {
  sm: {
    left: 'pl-10',
    right: 'pr-10',
    both: 'px-10',
  },
  md: {
    left: 'pl-12',
    right: 'pr-12',
    both: 'px-12',
  },
  lg: {
    left: 'pl-12',
    right: 'pr-12',
    both: 'px-12',
  },
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  leftIcon,
  rightIcon,
  helperText,
  containerClassName,
  labelClassName,
  size = 'md',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${props.name || 'field'}`;
  const hasError = touched && !!error;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  const getPaddingClass = () => {
    if (hasLeftIcon && hasRightIcon) {
      return iconPadding[size].both;
    }
    if (hasLeftIcon) {
      return iconPadding[size].left;
    }
    if (hasRightIcon) {
      return iconPadding[size].right;
    }
    return '';
  };

  return (
    <div className={classNames('space-y-2', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={classNames('block text-sm font-bold text-slate-700', labelClassName)}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={classNames(
            'w-full bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700',
            sizeClasses[size],
            getPaddingClass(),
            {
              'border-red-300 focus:border-red-500': hasError,
              'border-slate-200': !hasError,
            },
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {hasError && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

      {helperText && !hasError && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};
