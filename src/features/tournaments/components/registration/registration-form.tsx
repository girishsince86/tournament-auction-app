'use client'

import { useState } from 'react'
import { Box, Paper, Stepper, Step, StepLabel, Container } from '@mui/material'
import { useRegistrationForm } from '../../hooks/use-registration-form'
import { CategorySelection } from './steps/category-selection'
import { PersonalDetails } from './steps/personal-details'
import { PlayerProfile } from './steps/player-profile'
import { JerseyDetails } from './steps/jersey-details'
import { PaymentDetails } from './steps/payment-details'
import { ReviewSubmit } from './steps/review-submit'
import { RegistrationStep } from '../../types/registration'
import { FormContainer, FormButton } from '@/components/ui/form'
import { RegistrationField } from './registration-form-field'

const stepComponents: Record<RegistrationStep, React.FC<{ onNext: () => void; onBack: () => void }>> = {
  category: CategorySelection,
  personal: PersonalDetails,
  profile: PlayerProfile,
  jersey: JerseyDetails,
  payment: PaymentDetails,
  review: ReviewSubmit,
}

const stepLabels: Record<RegistrationStep, string> = {
  category: 'Category Selection',
  personal: 'Personal Details',
  profile: 'Player Profile',
  jersey: 'Jersey Details',
  payment: 'Payment',
  review: 'Review & Submit',
}

interface RegistrationFormData {
  playerName: string;
  email: string;
  phone: string;
  flatNumber: string;
}

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  initialData?: Partial<RegistrationFormData>;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^\+?[\d\s-]{10,}$/.test(phone);
};

const validateFlatNumber = (flatNumber: string): boolean => {
  return /^[A-Z0-9-]{1,10}$/.test(flatNumber.toUpperCase());
};

export function RegistrationForm({
  onSubmit,
  initialData = {},
}: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [formData, setFormData] = useState<RegistrationFormData>({
    playerName: initialData.playerName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    flatNumber: initialData.flatNumber || '',
  });

  const handleChange = (field: keyof RegistrationFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};

    if (!formData.playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (formData.playerName.trim().length < 3) {
      newErrors.playerName = 'Player name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.flatNumber.trim()) {
      newErrors.flatNumber = 'Flat number is required';
    } else if (!validateFlatNumber(formData.flatNumber)) {
      newErrors.flatNumber = 'Please enter a valid flat number (e.g., A-123)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        ...formData,
        flatNumber: formData.flatNumber.toUpperCase(),
      });
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors((prev) => ({
        ...prev,
        email: 'Registration failed. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <div className="space-y-6">
        <RegistrationField
          label="Player Name"
          name="playerName"
          value={formData.playerName}
          onChange={handleChange('playerName')}
          error={errors.playerName}
          required
          placeholder="Enter your full name"
        />

        <RegistrationField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          required
          placeholder="Enter your email address"
        />

        <RegistrationField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          required
          placeholder="Enter your phone number"
        />

        <RegistrationField
          label="Flat Number"
          name="flatNumber"
          value={formData.flatNumber}
          onChange={handleChange('flatNumber')}
          error={errors.flatNumber}
          required
          placeholder="Enter your flat number (e.g., A-123)"
        />

        <div className="flex justify-end space-x-4">
          <FormButton
            type="button"
            variant="tertiary"
            disabled={isLoading}
          >
            Cancel
          </FormButton>
          <FormButton
            type="submit"
            isLoading={isLoading}
          >
            Register
          </FormButton>
        </div>
      </div>
    </FormContainer>
  );
} 