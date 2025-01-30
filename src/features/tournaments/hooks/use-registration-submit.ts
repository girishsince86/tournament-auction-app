import { useState } from 'react'
import { RegistrationFormData } from '../types/registration'
import { submitRegistration } from '../services/registration'
import { useRouter } from 'next/navigation'

interface UseRegistrationSubmit {
  isSubmitting: boolean
  error: string | null
  submitForm: (formData: RegistrationFormData) => Promise<void>
}

export function useRegistrationSubmit(): UseRegistrationSubmit {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submitForm = async (formData: RegistrationFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await submitRegistration(formData)

      if (!response.success) {
        setError(response.error || 'Failed to submit registration')
        return
      }

      // Redirect to success page with registration ID
      router.push(`/tournaments/register/success?id=${response.registrationId}`)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    error,
    submitForm,
  }
} 