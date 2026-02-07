'use client'

import { useState, useEffect, useRef } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import {
  RegistrationFormData,
  initialFormData,
  isYouthCategory,
  RegistrationCategory,
} from '../types/registration'
import type { SectionName } from '../components/registration/registration-constants'
import {
  REGISTRATION_CATEGORIES,
  LAST_PLAYED_OPTIONS,
  SKILL_LEVELS,
  PLAYING_POSITIONS,
} from '../components/registration/registration-constants'
import { categoryRequiresDoB } from '../components/registration/registration-age'
import {
  validateRegistrationField,
  isRegistrationSectionComplete,
} from '../components/registration/registration-validation'
import { useRegistrationSubmit } from './use-registration-submit'
import { compressImage } from '@/lib/utils/image-compression'

const SECTION_ORDER: SectionName[] = ['category', 'personal', 'profile', 'jersey', 'payment']

const SECTION_FIELD_MAP: Record<string, SectionName> = {
  registration_category: 'category',
  first_name: 'personal',
  last_name: 'personal',
  email: 'personal',
  phone_number: 'personal',
  flat_number: 'personal',
  profile_image_url: 'personal',
  date_of_birth: 'personal',
  parent_name: 'personal',
  parent_phone_number: 'personal',
  height: 'profile',
  last_played_date: 'profile',
  skill_level: 'profile',
  playing_positions: 'profile',
  tshirt_size: 'jersey',
  tshirt_name: 'jersey',
  tshirt_number: 'jersey',
  payment_upi_id: 'payment',
  payment_transaction_id: 'payment',
  paid_to: 'payment',
}

function processPhoneNumber(value: string): string {
  const digitsOnly = value.replace(/[^\d+]/g, '')
  if (!digitsOnly.startsWith('+91')) {
    if (digitsOnly.length > 0 && !digitsOnly.startsWith('+')) return '+91' + digitsOnly
    return digitsOnly
  }
  if (digitsOnly.startsWith('+91')) {
    const rest = digitsOnly.substring(3)
    if (rest.length > 10) return '+91' + rest.substring(0, 10)
  }
  return digitsOnly
}

export function useRegistrationFormSingle() {
  const { submitForm } = useRegistrationSubmit()
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<SectionName, boolean>>({
    category: true,
    personal: false,
    profile: false,
    jersey: false,
    payment: false,
  })
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false)
  const [residencyConfirmed, setResidencyConfirmed] = useState(false)
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false)
  const [consentDialogOpen, setConsentDialogOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [registrationId, setRegistrationId] = useState('')
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [referenceLoading, setReferenceLoading] = useState(false)
  const [referenceMessage, setReferenceMessage] = useState<string | null>(null)
  const [profileImageUploading, setProfileImageUploading] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)

  const isSectionComplete = (section: SectionName) =>
    isRegistrationSectionComplete(section, formData, errors)

  const handleSectionCompletion = (_currentSection: SectionName) => {
    // No scroll on completion; focus shifts only when user collapses a section
  }

  const validateField = (name: keyof RegistrationFormData, value: unknown, nextFormData?: RegistrationFormData): string =>
    validateRegistrationField(name, value, nextFormData ?? formData)

  const handleChange = (field: keyof RegistrationFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = event.target.value
    if (field === 'phone_number' || field === 'parent_phone_number') value = processPhoneNumber(value)
    if (field === 'date_of_birth') {
      const d = new Date(value)
      if (!isNaN(d.getTime())) value = d.toISOString().split('T')[0]
    }
    const nextData = { ...formData, [field]: value }
    const error = validateField(field, value, nextData)
    setErrors((prev) => ({ ...prev, [field]: error }))
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTimeout(() => {
      const section = SECTION_FIELD_MAP[field]
      if (section) handleSectionCompletion(section)
    }, 100)
    if (field === 'registration_category') {
      const newCategory = value as RegistrationCategory
      const needsDoB = categoryRequiresDoB(newCategory)
      const isYouth = isYouthCategory(newCategory)
      if (needsDoB) {
        const nextData = { ...formData, registration_category: newCategory }
        const dobErr = validateField('date_of_birth', formData.date_of_birth, nextData)
        setErrors((prev) => ({ ...prev, date_of_birth: dobErr }))
        if (isYouth) {
          ;['parent_name', 'parent_phone_number'].forEach((youthField) => {
            const err = validateField(
              youthField as keyof RegistrationFormData,
              formData[youthField as keyof RegistrationFormData],
              nextData
            )
            setErrors((prev) => ({ ...prev, [youthField]: err }))
          })
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          date_of_birth: '',
          parent_name: '',
          parent_phone_number: '',
        }))
        setErrors((prev) => ({ ...prev, date_of_birth: '', parent_name: '', parent_phone_number: '' }))
      }
    }
  }

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target as { name: string; value: unknown }
    const error = validateField(name as keyof RegistrationFormData, value, { ...formData, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: error }))
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTimeout(() => {
      const section = SECTION_FIELD_MAP[name]
      if (section) handleSectionCompletion(section)
    }, 100)
  }

  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null)

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (profileImagePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreviewUrl)
    }
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setProfileImagePreviewUrl(objectUrl)
    setProfileImageUploading(true)
    setErrors((prev) => ({ ...prev, profile_image_url: '' }))
    try {
      const compressed = await compressImage(file, { maxWidthOrHeight: 800, quality: 0.85 })
      const form = new FormData()
      form.append('file', compressed)
      const res = await fetch('/api/tournaments/register/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFormData((prev) => ({ ...prev, profile_image_url: data.imageUrl }))
      setTimeout(() => handleSectionCompletion('personal'), 100)
    } catch (err) {
      URL.revokeObjectURL(objectUrl)
      setProfileImagePreviewUrl(null)
      setErrors((prev) => ({
        ...prev,
        profile_image_url: err instanceof Error ? err.message : 'Failed to upload photo',
      }))
    } finally {
      setProfileImageUploading(false)
      e.target.value = ''
    }
  }

  const removeProfileImage = () => {
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl)
      setProfileImagePreviewUrl(null)
    }
    setFormData((prev) => ({ ...prev, profile_image_url: '' }))
    setErrors((prev) => ({ ...prev, profile_image_url: 'Profile photo is required' }))
  }

  const loadReference = async () => {
    const email = (formData.email || '').trim()
    const phone = (formData.phone_number || '').trim()
    if (!email && !phone) {
      setReferenceMessage('Enter your email or phone number above, then click Load my 2025 details.')
      return
    }
    setReferenceMessage(null)
    setReferenceLoading(true)
    try {
      const params = new URLSearchParams()
      if (email) params.set('email', email)
      else params.set('phone', phone)
      const res = await fetch(`/api/tournaments/register/reference?${params}`)
      const json = await res.json()
      if (!res.ok) {
        setReferenceMessage(json.error || 'Lookup failed.')
        return
      }
      if (json.reference) {
        const merged: RegistrationFormData = {
          ...formData,
          first_name: json.reference.first_name ?? formData.first_name,
          last_name: json.reference.last_name ?? formData.last_name,
          email: json.reference.email ?? formData.email,
          phone_number: json.reference.phone_number ?? formData.phone_number,
          date_of_birth: json.reference.date_of_birth ?? formData.date_of_birth,
          registration_category: (json.reference.registration_category ?? formData.registration_category) as RegistrationCategory,
          tshirt_size: (json.reference.tshirt_size ?? formData.tshirt_size) as RegistrationFormData['tshirt_size'],
          tshirt_number: json.reference.tshirt_number ?? formData.tshirt_number,
        }
        setFormData(merged)
        // Re-run full validation so progress bar and section statuses are accurate
        const validationErrors: Partial<Record<keyof RegistrationFormData, string>> = {}
        ;(Object.keys(merged) as (keyof RegistrationFormData)[]).forEach((key) => {
          const err = validateField(key, merged[key], merged)
          if (err) validationErrors[key] = err
        })
        setErrors(validationErrors)
        setReferenceMessage('Pre-filled from 2025 registration.')
      } else {
        setReferenceMessage('No 2025 registration found for this email or phone.')
      }
    } catch {
      setReferenceMessage('Could not load reference. Try again.')
    } finally {
      setReferenceLoading(false)
    }
  }

  const handleExpandSection = (section: SectionName) => {
    setExpandedSections((prev) => {
      const willBeExpanded = !prev[section]
      const next = { ...prev }
      if (willBeExpanded) {
        // User is expanding this section: auto-collapse any other section that is complete
        SECTION_ORDER.forEach((s) => {
          if (s !== section && prev[s] && isSectionComplete(s)) {
            next[s] = false
          }
        })
      }
      next[section] = willBeExpanded
      return next
    })
  }

  // Do not auto-expand incomplete sections; user expands manually

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationErrors: Record<string, string> = {}
    Object.keys(formData).forEach((key) => {
      const field = key as keyof RegistrationFormData
      const err = validateField(field, formData[field], formData)
      if (err) validationErrors[field] = err
    })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form. Expand each section to see what’s missing.',
        severity: 'error',
      })
      return
    }
    if (!rulesAcknowledged || !residencyConfirmed) {
      setSnackbar({
        open: true,
        message: 'Please acknowledge the rules and confirm your residency',
        severity: 'error',
      })
      return
    }
    // Require consent via dialog before submitting
    setConsentDialogOpen(true)
    return
  }

  const confirmConsentAndSubmit = async () => {
    setConsentDialogOpen(false)
    try {
      setIsSubmitting(true)
      await submitForm(formData)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to submit registration',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFormattedDetails = () => {
    const vol = (c: string) => c?.includes('VOLLEYBALL') ?? false
    return [
      {
        title: 'Category Details',
        items: [
          { label: 'Tournament Category', value: REGISTRATION_CATEGORIES.find((c) => c.value === formData.registration_category)?.label ?? '' },
        ],
      },
      {
        title: 'Personal Information',
        items: [
          { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
          { label: 'Email', value: formData.email },
          { label: 'Phone Number', value: formData.phone_number },
          { label: 'Flat Number', value: formData.flat_number },
          ...(categoryRequiresDoB(formData.registration_category)
            ? [{ label: 'Date of Birth', value: formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : '' }]
            : []),
          ...(isYouthCategory(formData.registration_category)
            ? [
                { label: 'Parent/Guardian Name', value: formData.parent_name },
                { label: 'Parent/Guardian Phone', value: formData.parent_phone_number },
              ]
            : []),
        ],
      },
      {
        title: 'Player Profile',
        items: [
          { label: 'Height', value: `${formData.height} cm` },
          { label: 'Last Played', value: LAST_PLAYED_OPTIONS.find((o) => o.value === formData.last_played_date)?.label ?? '' },
          { label: 'Skill Level', value: SKILL_LEVELS.find((s) => s.value === formData.skill_level)?.label ?? '' },
          ...(vol(formData.registration_category)
            ? [{ label: 'Playing Position', value: PLAYING_POSITIONS.find((p) => p.value === formData.playing_positions?.[0])?.label ?? '' }]
            : []),
        ],
      },
      {
        title: 'Jersey Details',
        items: [
          { label: 'Jersey Size', value: formData.tshirt_size },
          { label: 'Jersey Name', value: formData.tshirt_name },
          { label: 'Jersey Number', value: formData.tshirt_number },
        ],
      },
      {
        title: 'Payment Information',
        items: [
          { label: 'UPI ID/ Phone Number of the Payee', value: formData.payment_upi_id },
          { label: 'Transaction ID', value: formData.payment_transaction_id },
          { label: 'Paid To', value: formData.paid_to },
        ],
      },
    ]
  }

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    setIsSubmitting,
    expandedSections,
    isSubmitting,
    snackbar,
    setSnackbar,
    rulesAcknowledged,
    setRulesAcknowledged,
    residencyConfirmed,
    setResidencyConfirmed,
    rulesDialogOpen,
    setRulesDialogOpen,
    consentDialogOpen,
    setConsentDialogOpen,
    confirmConsentAndSubmit,
    showSuccessDialog,
    setShowSuccessDialog,
    registrationId,
    setRegistrationId,
    sizeChartOpen,
    setSizeChartOpen,
    referenceLoading,
    referenceMessage,
    profileImageUploading,
    profileImagePreviewUrl,
    profileImageInputRef,
    isSectionComplete,
    validateField,
    handleChange,
    handleSelectChange,
    handleExpandSection,
    handleSectionCompletion,
    handleProfileImageChange,
    removeProfileImage,
    loadReference,
    handleSubmit,
    getFormattedDetails,
    initialFormData,
  }
}
