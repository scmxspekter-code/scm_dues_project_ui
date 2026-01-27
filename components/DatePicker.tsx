import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import classNames from 'classnames';

export interface DatePickerProps {
  label?: string | ReactNode;
  value?: string;
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
  className?: string;
  name?: string;
  onBlur?: () => void;
  minDate?: string;
  maxDate?: string;
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

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  touched,
  leftIcon,
  helperText,
  containerClassName,
  labelClassName,
  size = 'md',
  disabled = false,
  className,
  name,
  onBlur,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  const hasError = touched && !!error;
  const hasLeftIcon = !!leftIcon || true; // Always show calendar icon if no leftIcon provided

  const selectedDate = value ? new Date(value) : null;
  const displayIcon = leftIcon || <Calendar size={18} />;

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }> = [];

    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: isSelected(date),
      });
    }

    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected: isSelected(date),
      });
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: isSelected(date),
      });
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (date: Date) => {
    if (minDate) {
      const min = new Date(minDate);
      if (date < min) return true;
    }
    if (maxDate) {
      const max = new Date(maxDate);
      if (date > max) return true;
    }
    return false;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (date: Date) => {
    if (isDisabled(date)) return;
    
    const formattedDate = formatDate(date);
    if (onChange) {
      onChange(formattedDate);
    }
    setIsOpen(false);
    onBlur?.();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  // Update current month when value changes
  useEffect(() => {
    if (value && selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  const calendarDays = getCalendarDays();

  return (
    <div className={classNames('space-y-2', containerClassName)} ref={datePickerRef}>
      {label && (
        <label
          className={classNames(
            'block text-sm font-bold text-slate-700',
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {displayIcon}
          </div>
        )}

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={classNames(
            'w-full bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-left flex items-center justify-between',
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
          <span className={classNames('flex-1 truncate', {
            'text-slate-400': !value,
            'text-slate-700': value,
          })}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 p-1 rounded hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer inline-flex items-center"
            >
              <X size={14} />
            </span>
          )}
        </button>

        {/* Hidden input for form compatibility */}
        {name && (
          <input type="hidden" name={name} value={value || ''} />
        )}

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-[320px]">
            {/* Calendar Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-slate-600"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <div className="font-bold text-slate-800">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-slate-600"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleToday}
                className="w-full py-2 px-3 bg-white hover:bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium transition-colors"
              >
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-bold text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                    disabled={!day.isCurrentMonth || isDisabled(day.date)}
                    className={classNames(
                      'aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all',
                      {
                        'text-slate-400 cursor-not-allowed': !day.isCurrentMonth || isDisabled(day.date),
                        'text-slate-700 hover:bg-slate-100': day.isCurrentMonth && !day.isSelected && !day.isToday && !isDisabled(day.date),
                        'bg-cyan-600 text-white font-bold': day.isSelected,
                        'bg-cyan-50 text-cyan-600 font-bold ring-2 ring-cyan-200': day.isToday && !day.isSelected,
                        'hover:bg-cyan-100': day.isCurrentMonth && !isDisabled(day.date) && !day.isSelected,
                      }
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}

      {helperText && !hasError && (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};
