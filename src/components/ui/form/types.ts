export interface BaseInputProps {
  id: string;
  name: string;
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FormFieldProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormButtonProps {
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
} 