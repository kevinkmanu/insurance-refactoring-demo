import type { InputHTMLAttributes, ReactNode } from 'react';
import './FormField.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
}

export function FormField({ label, id, error, hint, children, ...inputProps }: Props) {
  return (
    <div className={`form-field${error ? ' form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={id}>{label}</label>
      {children ? (
        children
      ) : (
        <input
          id={id}
          className="form-field__input"
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...inputProps}
        />
      )}
      {hint && !error && <p id={`${id}-hint`} className="form-field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-field__error" role="alert">{error}</p>}
    </div>
  );
}
