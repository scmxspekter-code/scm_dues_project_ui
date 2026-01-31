import React, { useMemo, useEffect, useState, ReactNode } from 'react';
import classNames from 'classnames';
import { CustomSelect } from './CustomSelect';

/** Country code option for the phone prefix select */
export interface CountryCodeOption {
  code: string; // e.g. '+234'
  label: string; // e.g. 'NG +234'
  country: string; // e.g. 'Nigeria'
}

/** Default country codes (code without + for parsing; display with +) */
const DEFAULT_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+234', label: 'NG +234', country: 'Nigeria' },
  { code: '+233', label: 'GH +233', country: 'Ghana' },
  { code: '+254', label: 'KE +254', country: 'Kenya' },
  { code: '+255', label: 'TZ +255', country: 'Tanzania' },
  { code: '+27', label: 'ZA +27', country: 'South Africa' },
  { code: '+1', label: 'US/CA +1', country: 'US/Canada' },
  { code: '+44', label: 'UK +44', country: 'United Kingdom' },
  { code: '+91', label: 'IN +91', country: 'India' },
  { code: '+33', label: 'FR +33', country: 'France' },
  { code: '+49', label: 'DE +49', country: 'Germany' },
];

/** Sort by code length descending so longer codes match first when parsing */
const CODES_BY_LENGTH = [...DEFAULT_COUNTRY_CODES].sort(
  (a, b) => b.code.length - a.code.length
);

function parseValue(
  value: string | undefined,
  defaultCode: string
): { code: string; digits: string } {
  if (!value || typeof value !== 'string') {
    return { code: defaultCode, digits: '' };
  }
  const normalized = value.replace(/\s/g, '').replace(/^0+/, '');
  const withoutPlus = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  for (const { code } of CODES_BY_LENGTH) {
    const codeDigits = code.replace('+', '');
    if (withoutPlus === codeDigits || withoutPlus.startsWith(codeDigits)) {
      const digits = withoutPlus.slice(codeDigits.length).replace(/\D/g, '');
      return { code, digits };
    }
  }
  const digitsOnly = withoutPlus.replace(/\D/g, '');
  return { code: defaultCode, digits: digitsOnly };
}

export interface PhoneNumberInputProps {
  /** Full phone number (e.g. +2348012345678). Controlled. */
  value?: string;
  /** Called with full number (countryCode + digits) */
  onChange?: (value: string) => void;
  onBlur?: (e?: React.FocusEvent<HTMLElement>) => void;
  name?: string;
  label?: ReactNode;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  /** Country code options. Defaults to common African + US/UK/IN/FR/DE. */
  countryCodeOptions?: CountryCodeOption[];
  /** Default country code when value is empty (e.g. '+234') */
  defaultCountryCode?: string;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-4 py-4 text-sm',
};

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChange,
  onBlur,
  name,
  label,
  error,
  touched,
  placeholder = '8012345678',
  size = 'md',
  disabled = false,
  containerClassName,
  labelClassName,
  countryCodeOptions = DEFAULT_COUNTRY_CODES,
  defaultCountryCode = DEFAULT_COUNTRY_CODES[0].code,
}) => {
  const defaultCode = defaultCountryCode || DEFAULT_COUNTRY_CODES[0].code;
  const parsed = useMemo(() => parseValue(value, defaultCode), [value, defaultCode]);
  const [digits, setDigits] = useState(parsed.digits);
  const [code, setCode] = useState(parsed.code);

  useEffect(() => {
    const next = parseValue(value, defaultCode);
    setDigits(next.digits);
    setCode(next.code);
  }, [value, defaultCode]);

  const options = useMemo(
    () =>
      countryCodeOptions.map((opt) => ({
        value: opt.code,
        label: opt.label,
      })),
    [countryCodeOptions]
  );

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const combined = digits ? `${newCode}${digits}` : '';
    onChange?.(combined);
  };

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '');
    setDigits(digitsOnly);
    const combined = digitsOnly ? `${code}${digitsOnly}` : '';
    onChange?.(combined);
  };

  const handleDigitsBlur = () => {
    onBlur?.();
  };

  const hasError = touched && !!error;
  const fullValue = digits ? `${code}${digits}` : '';

  return (
    <div className={classNames('space-y-2', containerClassName)}>
      {name && <input type="hidden" name={name} value={fullValue} readOnly aria-hidden />}
      {label && (
        <label
          className={classNames('block text-sm font-bold text-slate-700', labelClassName)}
        >
          {label}
        </label>
      )}

      <div className="flex gap-2">
        <div className="text-lg [&_button]:text-sm shrink-0 [&_button]:px-2">
          <CustomSelect
            value={code}
            onChange={handleCodeChange}
            options={options}
            size="lg"
            disabled={disabled}
            className={classNames(
              'w-[100px]  bg-slate-50 border font-medium text-slate-700 ',
              hasError ? 'border-red-300' : 'border-slate-200'
            )}
            containerClassName="mb-0 h-full "
          />
        </div>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          value={digits}
          onChange={handleDigitsChange}
          onBlur={handleDigitsBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={classNames(
            'flex-1 min-w-0 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all font-medium text-slate-700',
            sizeClasses[size],
            {
              'border-red-300 focus:border-red-500': hasError,
              'border-slate-200': !hasError,
              'opacity-50 cursor-not-allowed': disabled,
            }
          )}
          aria-invalid={hasError}
          aria-describedby={error && touched ? `${name}-error` : undefined}
        />
      </div>

      {hasError && (
        <p id={name ? `${name}-error` : undefined} className="text-xs text-red-500 font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
