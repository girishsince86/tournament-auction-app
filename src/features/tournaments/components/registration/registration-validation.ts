/**
 * Validation helpers for the registration form.
 * Pure functions that take formData (and optionally errors) for cross-field rules.
 */

import type { RegistrationFormData } from '../../types/registration'
import { RegistrationCategory, isYouthCategory } from '../../types/registration'
import type { SectionName } from './registration-constants'
import {
  LAST_PLAYED_OPTIONS,
  SKILL_LEVELS,
  TSHIRT_SIZES,
  PAYMENT_RECEIVERS,
} from './registration-constants'

const REQUIRED_FIELDS_FOR_VALIDATION: (keyof RegistrationFormData)[] = [
  'registration_category',
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'flat_number',
  'profile_image_url',
  'height',
  'last_played_date',
  'skill_level',
  'tshirt_size',
  'tshirt_name',
  'tshirt_number',
  'payment_upi_id',
  'payment_transaction_id',
  'paid_to',
]

export function isVolleyballCategory(category: string | undefined): boolean {
  return category?.includes('VOLLEYBALL') ?? false
}

export function validateRegistrationField(
  name: keyof RegistrationFormData,
  value: unknown,
  formData: RegistrationFormData
): string {
  if (
    (value === undefined || value === null || value === '') &&
    !REQUIRED_FIELDS_FOR_VALIDATION.includes(name)
  ) {
    return ''
  }

  const str = (v: unknown) => (v != null ? String(v).trim() : '')
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v))

  switch (name) {
    case 'first_name':
    case 'last_name':
      return str(value).length >= 2
        ? ''
        : `Please enter a valid ${name === 'first_name' ? 'first' : 'last'} name (minimum 2 characters)`
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(value)) ? '' : 'Please enter a valid email address'
    case 'phone_number': {
      const digits = str(value).replace(/^\+91/, '').replace(/\s+/g, '')
      return digits.match(/^\d{10}$/) ? '' : 'Please enter a valid 10-digit phone number'
    }
    case 'parent_phone_number':
      if (isYouthCategory(formData.registration_category)) {
        const digits = str(value).replace(/^\+91/, '').replace(/\s+/g, '')
        return digits.match(/^\d{10}$/) ? '' : 'Please enter a valid 10-digit phone number for parent'
      }
      return ''
    case 'flat_number':
      return str(value).match(/^[A-Z0-9-]{1,10}$/i) ? '' : 'Please enter a valid flat number (e.g., A-123)'
    case 'height': {
      const n = num(value)
      return Number.isInteger(n) && n >= 100 && n <= 250
        ? ''
        : 'Please enter a valid height in centimeters (100-250)'
    }
    case 'registration_category':
      return value && Object.values(RegistrationCategory).includes(value as RegistrationCategory)
        ? ''
        : 'Please select a registration category'
    case 'last_played_date':
      return value && LAST_PLAYED_OPTIONS.some((o) => o.value === value) ? '' : 'Please select when you last played'
    case 'skill_level':
      return value && SKILL_LEVELS.some((l) => l.value === value) ? '' : 'Please select your skill level'
    case 'playing_positions':
      return isVolleyballCategory(formData.registration_category) &&
        Array.isArray(value) &&
        value.length > 0
        ? ''
        : 'Please select at least one playing position'
    case 'tshirt_size':
      return value && TSHIRT_SIZES.some((s) => s.value === value) ? '' : 'Please select a t-shirt size'
    case 'tshirt_name': {
      const s = str(value)
      return s.length >= 2 && s.length <= 15
        ? ''
        : 'Please enter a valid name for your jersey (2-15 characters)'
    }
    case 'tshirt_number': {
      const n = num(value)
      return Number.isInteger(n) && n >= 1 && n <= 99
        ? ''
        : 'Please enter a valid jersey number (1-99)'
    }
    case 'payment_upi_id':
      return value ? '' : 'Please enter your UPI ID or phone number'
    case 'payment_transaction_id':
      return value ? '' : 'Please enter the transaction ID'
    case 'paid_to':
      return value && PAYMENT_RECEIVERS.some((r) => r.value === value)
        ? ''
        : 'Please select who you paid to'
    case 'profile_image_url':
      return value && str(value).length > 0 ? '' : 'Profile photo is required'
    case 'date_of_birth': {
      if (isYouthCategory(formData.registration_category)) {
        if (!value) return 'Date of birth is required'
        const dob = new Date(value as string)
        const cutoff = new Date('2026-04-30')
        let age = cutoff.getFullYear() - dob.getFullYear()
        const md = cutoff.getMonth() - dob.getMonth()
        if (md < 0 || (md === 0 && cutoff.getDate() < dob.getDate())) age--
        if (formData.registration_category === 'THROWBALL_8_12_MIXED') {
          if (age < 8) return 'Player must be at least 8 years old as of April 30, 2026'
          if (age > 12) return 'Player must be under 12 years old as of April 30, 2026'
        }
        if (formData.registration_category === 'THROWBALL_13_17_MIXED') {
          if (age < 13) return 'Player must be at least 13 years old as of April 30, 2026'
          if (age > 17) return 'Player must be under 17 years old as of April 30, 2026'
        }
      } else if (value) {
        const dob = new Date(value as string)
        const cutoff = new Date('2026-04-30')
        let age = cutoff.getFullYear() - dob.getFullYear()
        const md = cutoff.getMonth() - dob.getMonth()
        if (md < 0 || (md === 0 && cutoff.getDate() < dob.getDate())) age--
        if (age < 8) return 'Player must be at least 8 years old as of April 30, 2026'
      }
      return ''
    }
    case 'parent_name':
      if (isYouthCategory(formData.registration_category)) {
        return str(value).length >= 2 ? '' : 'Please enter a valid parent/guardian name'
      }
      return ''
    default:
      return ''
  }
}

export function isRegistrationSectionComplete(
  section: SectionName,
  formData: RegistrationFormData,
  errors: Partial<Record<keyof RegistrationFormData, string>>
): boolean {
  const v = (key: keyof RegistrationFormData) => formData[key]
  const e = (key: keyof RegistrationFormData) => errors[key]
  const vol = () => isVolleyballCategory(formData.registration_category)
  const youth = () => isYouthCategory(formData.registration_category)

  switch (section) {
    case 'category':
      return !!v('registration_category') && !e('registration_category')
    case 'personal': {
      const base =
        !!v('first_name') &&
        !!v('last_name') &&
        !!v('email') &&
        !!v('phone_number') &&
        !!v('flat_number') &&
        !!v('profile_image_url') &&
        !e('first_name') &&
        !e('last_name') &&
        !e('email') &&
        !e('phone_number') &&
        !e('flat_number') &&
        !e('profile_image_url')
      if (youth()) {
        return (
          base &&
          !!v('date_of_birth') &&
          !!v('parent_name') &&
          !!v('parent_phone_number') &&
          !e('date_of_birth') &&
          !e('parent_name') &&
          !e('parent_phone_number')
        )
      }
      return base
    }
    case 'profile': {
      const base =
        !!v('height') &&
        !!v('last_played_date') &&
        !!v('skill_level') &&
        !e('height') &&
        !e('last_played_date') &&
        !e('skill_level')
      return vol()
        ? base && !!formData.playing_positions?.length && !e('playing_positions')
        : base
    }
    case 'jersey':
      return (
        !!v('tshirt_size') &&
        !!v('tshirt_name') &&
        !!v('tshirt_number') &&
        !e('tshirt_size') &&
        !e('tshirt_name') &&
        !e('tshirt_number')
      )
    case 'payment':
      return (
        !!v('payment_upi_id') &&
        !!v('payment_transaction_id') &&
        !!v('paid_to') &&
        !e('payment_upi_id') &&
        !e('payment_transaction_id') &&
        !e('paid_to')
      )
    default:
      return false
  }
}
