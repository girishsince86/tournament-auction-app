'use client'

import { useSearchParams } from 'next/navigation'
import { RegistrationFormSingle } from './registration-form-single'

export function RegistrationPageContent() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registration_id')

  return (
    <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {registrationId ? (
        <div>Registration Status: {registrationId}</div>
      ) : (
        <RegistrationFormSingle />
      )}
    </div>
  )
} 