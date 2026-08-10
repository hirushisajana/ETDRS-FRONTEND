import * as React from 'react';
import type { ReactNode } from 'react';
import { useForm, type UseFormReturn, type FieldValues, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodResolver = (schema: any) => any;

interface FormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void>;
  children: (form: UseFormReturn<T>) => ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = '',
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: (zodResolver as AnyZodResolver)(schema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {children(form)}
    </form>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <input ref={ref} className={`form-input ${error ? 'input-error' : ''}`} {...props} />
    </FormField>
  ),
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <select ref={ref} className={`form-select ${error ? 'input-error' : ''}`} {...props}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  ),
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, ...props }, ref) => (
    <FormField label={label} error={error} required={props.required}>
      <textarea ref={ref} className={`form-textarea ${error ? 'input-error' : ''}`} {...props} />
    </FormField>
  ),
);
