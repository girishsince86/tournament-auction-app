import { Database } from '@/lib/supabase/types/supabase'

// Form step type
export type RegistrationStep = 'category' | 'personal' | 'profile' | 'jersey' | 'payment' | 'review'

export type RegistrationCategory = '' | 'VOLLEYBALL_OPEN_MEN' | 'THROWBALL_WOMEN' | 'THROWBALL_13_17_MIXED' | 'THROWBALL_8_12_MIXED'

export type LastPlayedStatus = 'PLAYING_ACTIVELY' | 'NOT_PLAYED_SINCE_LAST_YEAR' | 'NOT_PLAYED_IN_FEW_YEARS'

// Form data interface
export interface RegistrationFormData {
  // Required fields from database schema
  first_name: string
  last_name: string
  email: string
  phone_number: string
  flat_number: string
  height: number
  last_played_date: LastPlayedStatus
  registration_category: RegistrationCategory
  registration_type: string
  playing_positions: string[]
  skill_level: 'RECREATIONAL_C' | 'INTERMEDIATE_B' | 'UPPER_INTERMEDIATE_BB' | 'COMPETITIVE_A'
  tshirt_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL'
  tshirt_name: string
  tshirt_number: string
  payment_upi_id: string
  payment_transaction_id: string
  paid_to: string
  // Optional fields for youth categories
  date_of_birth?: string
  parent_name?: string
  parent_phone_number?: string
}

// Initial form state
export const initialFormData: RegistrationFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  flat_number: '',
  height: 0,
  last_played_date: '' as LastPlayedStatus,
  registration_category: '' as RegistrationCategory,
  registration_type: 'INDIVIDUAL',
  playing_positions: [],
  skill_level: '' as 'RECREATIONAL_C' | 'INTERMEDIATE_B' | 'UPPER_INTERMEDIATE_BB' | 'COMPETITIVE_A',
  tshirt_size: '' as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL',
  tshirt_name: '',
  tshirt_number: '',
  payment_upi_id: '',
  payment_transaction_id: '',
  paid_to: '',
  // Initialize optional fields as empty strings
  date_of_birth: '',
  parent_name: '',
  parent_phone_number: '',
}

// Helper function to check if category requires youth fields
export const isYouthCategory = (category: RegistrationCategory): boolean => {
  return category === 'THROWBALL_13_17_MIXED' || category === 'THROWBALL_8_12_MIXED'
}

// Step configuration
export const stepConfig = {
  category: {
    label: 'Category Selection',
    description: 'Choose your tournament category',
  },
  personal: {
    label: 'Personal Details',
    description: 'Enter your personal information',
  },
  profile: {
    label: 'Player Profile',
    description: 'Tell us about your playing experience',
  },
  jersey: {
    label: 'Jersey Details',
    description: 'Select your jersey preferences',
  },
  payment: {
    label: 'Payment',
    description: 'Complete your registration payment',
  },
  review: {
    label: 'Review & Submit',
    description: 'Review your information and submit',
  },
} 