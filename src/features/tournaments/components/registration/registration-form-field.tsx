import { FormRow, Label, TextInput } from '@/components/ui/form';

interface RegistrationFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
  placeholder?: string;
}

export function RegistrationField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  required = false,
  placeholder,
}: RegistrationFieldProps) {
  return (
    <FormRow>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <TextInput
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={error}
        required={required}
        placeholder={placeholder}
      />
    </FormRow>
  );
} 