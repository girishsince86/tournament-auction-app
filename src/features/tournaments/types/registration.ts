import { Database } from '@/lib/supabase/types/supabase'

// Form step type
export type RegistrationStep = 'category' | 'personal' | 'profile' | 'jersey' | 'payment' | 'review'

export enum RegistrationCategory {
  VOLLEYBALL_OPEN_MEN = 'VOLLEYBALL_OPEN_MEN',
  THROWBALL_WOMEN = 'THROWBALL_WOMEN',
  THROWBALL_13_17_MIXED = 'THROWBALL_13_17_MIXED',
  THROWBALL_8_12_MIXED = 'THROWBALL_8_12_MIXED',
}

export enum TShirtSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = '2XL',
  XXXL = '3XL'
}

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
  tshirt_size: TShirtSize
  tshirt_name: string
  tshirt_number: string
  payment_upi_id: string
  payment_transaction_id: string
  paid_to: string
  // Optional: profile photo URL (from upload during registration)
  profile_image_url?: string
  // Optional fields for youth categories
  date_of_birth?: string
  parent_name?: string
  parent_phone_number?: string
  is_verified?: boolean
  created_at?: string
  id?: string
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
  registration_category: RegistrationCategory.VOLLEYBALL_OPEN_MEN,
  registration_type: 'INDIVIDUAL',
  playing_positions: [],
  skill_level: '' as 'RECREATIONAL_C' | 'INTERMEDIATE_B' | 'UPPER_INTERMEDIATE_BB' | 'COMPETITIVE_A',
  tshirt_size: '' as TShirtSize,
  tshirt_name: '',
  tshirt_number: '',
  payment_upi_id: '',
  payment_transaction_id: '',
  paid_to: '',
  profile_image_url: '',
  // Initialize optional fields as empty strings
  date_of_birth: '',
  parent_name: '',
  parent_phone_number: '',
  is_verified: false,
  created_at: '',
  id: '',
}

// Helper function to check if category requires youth fields
export const isYouthCategory = (category: RegistrationCategory): boolean => {
  return category === RegistrationCategory.THROWBALL_13_17_MIXED || category === RegistrationCategory.THROWBALL_8_12_MIXED
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

export interface TournamentRegistration {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  flat_number: string
  height: number
  registration_category: string
  registration_type: string
  playing_positions: string[]
  skill_level: string
  tshirt_size: string
  tshirt_name: string
  tshirt_number: string
  payment_upi_id: string
  payment_transaction_id: string
  paid_to: string
  is_verified: boolean
  amount_received?: number
  verified_by?: string
  verified_at?: string
  verification_notes?: string
  created_at: string
  updated_at: string
  profile_image_url?: string
  profile_token?: string
  profile_token_expires_at?: string
  last_played_date: LastPlayedStatus
  date_of_birth?: string
  parent_name?: string
  parent_phone_number?: string
}

export interface RegistrationSummary {
  total_registrations: number
  verified_registrations: number
  pending_registrations: number
  total_amount_collected: number
  registrations_by_category: {
    category: string
    count: number
  }[]
  registrations_by_date: {
    date: string
    count: number
  }[]
  registrations_by_status: {
    status: string
    count: number
  }[]
}

export interface RegistrationFilters {
  search?: string
  category?: string
  status?: 'verified' | 'pending'
  startDate?: string
  endDate?: string
}

export interface RegistrationResponse {
  registrations: TournamentRegistration[]
  total: number
  page: number
  pageSize: number
} 