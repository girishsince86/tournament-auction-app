import { useState } from 'react'
import { RegistrationFormData } from '../types/registration'
import { useRouter } from 'next/navigation'

interface UseRegistrationSubmit {
  isSubmitting: boolean
  error: string | null
  submitForm: (formData: RegistrationFormData) => Promise<void>
}

const TIMEOUT_DURATION = 30000 // 30 seconds timeout

export function useRegistrationSubmit(): UseRegistrationSubmit {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submitForm = async (formData: RegistrationFormData) => {
    const startTime = performance.now()
    console.log('Starting registration submission...')
    
    try {
      setIsSubmitting(true)
      setError(null)

      // Log form data preparation time
      const prepStartTime = performance.now()
      const processedData = {
        ...formData,
        height: formData.height ? Number(formData.height) / 100 : 0,
      }
      console.log(`Form data preparation took ${performance.now() - prepStartTime}ms`)

      // Create an AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('Request aborted due to timeout')
      }, TIMEOUT_DURATION)

      try {
        const fetchStartTime = performance.now()
        console.log('Starting API request...')
        
        const response = await fetch('/api/tournaments/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData),
          signal: controller.signal,
        })

        console.log(`API request took ${performance.now() - fetchStartTime}ms`)

        clearTimeout(timeoutId)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to submit registration')
        }

        const data = await response.json()
        
        const routingStartTime = performance.now()
        console.log('Starting navigation to success page...')
        
        // Redirect to success page with registration ID
        router.push(`/tournaments/register/success?id=${data.registrationId}`)
        
        console.log(`Navigation took ${performance.now() - routingStartTime}ms`)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('Request timed out after', TIMEOUT_DURATION, 'ms')
          throw new Error('Registration request timed out. Please try again.')
        }
        throw err
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.'
      
      setError(errorMessage)
      console.error('Registration submission error:', err)
    } finally {
      setIsSubmitting(false)
      console.log(`Total registration process took ${performance.now() - startTime}ms`)
    }
  }

  return {
    isSubmitting,
    error,
    submitForm,
  }
} 