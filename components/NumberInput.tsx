import React, { InputHTMLAttributes, ReactNode, useState, ChangeEvent } from 'react';
import classNames from 'classnames';

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'onChange'
> {
  label?: string | ReactNode;
  error?: string;
  touched?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  allowDecimals?: boolean;
  min?: number;
  max?: number;
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

export const NumberInput: React.FC<NumberInputProps> = ({
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
  value,
  onChange,
  onBlur,
  allowDecimals = true,
  min,
  max,
  ...props
}) => {
  const inputId = id || `number-input-${props.name || 'field'}`;
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === '') {
      if (onChange) {
        onChange(e);
      }
      return;
    }

    // Create regex pattern based on allowDecimals
    const numericPattern = allowDecimals
      ? /^-?\d*\.?\d*$/ // Allows numbers with optional decimal point
      : /^-?\d*$/; // Only allows integers

    // Check if input matches numeric pattern
    if (numericPattern.test(inputValue)) {
      // Convert to number to check min/max constraints
      const numValue = parseFloat(inputValue);

      // Check if it's a valid number (not NaN)
      if (!isNaN(numValue) || inputValue === '-' || inputValue === '.') {
        // Check min constraint
        if (min !== undefined && numValue < min && inputValue !== '-' && inputValue !== '.') {
          return; // Don't update if below min
        }

        // Check max constraint
        if (max !== undefined && numValue > max) {
          return; // Don't update if above max
        }
      }

      // Update the input
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point, minus sign
    if (
      [8, 9, 27, 13, 46, 110, 190, 189, 109].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      // Allow decimal point if decimals are allowed
      if (allowDecimals && (e.keyCode === 190 || e.keyCode === 110)) {
        // Check if decimal point already exists
        const currentValue = (e.target as HTMLInputElement).value;
        if (currentValue.includes('.')) {
          e.preventDefault();
        }
        return;
      }

      // Allow minus sign at the beginning
      if (e.keyCode === 189 || e.keyCode === 109) {
        const currentValue = (e.target as HTMLInputElement).value;
        if (currentValue.includes('-') || currentValue.length > 0) {
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();
    }
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          className={classNames(
            'w-full bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700',
            // Hide spinner buttons
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {rightIcon}
          </div>
        )}
      </div>

      {hasError && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

      {helperText && !hasError && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};
