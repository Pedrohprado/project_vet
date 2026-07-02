import type { KeyboardEvent } from 'react';

import {
  appendDurationDigit,
  formatDurationFromDigits,
  removeDurationDigit,
} from '@/lib/duration-input';
import { Input } from '@/components/ui/input';

type DurationInputProps = {
  value: string;
  onChange: (digits: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-invalid'?: boolean;
};

export function DurationInput({
  value,
  onChange,
  id,
  disabled = false,
  placeholder = '00:30',
  className,
  'aria-invalid': ariaInvalid,
}: DurationInputProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault();
      onChange(appendDurationDigit(value, event.key));
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      onChange(removeDurationDigit(value));
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      onChange('');
    }
  }

  function handlePaste(digits: string) {
    onChange(digits.replace(/\D/g, '').slice(0, 4));
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      aria-invalid={ariaInvalid}
      value={formatDurationFromDigits(value)}
      onKeyDown={handleKeyDown}
      onChange={() => undefined}
      onPaste={(event) => {
        event.preventDefault();
        handlePaste(event.clipboardData.getData('text'));
      }}
    />
  );
}
