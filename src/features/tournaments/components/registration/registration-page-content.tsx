'use client'

import { useSearchParams } from 'next/navigation'
import { RegistrationFormSingle } from './registration-form-single'

export function RegistrationPageContent() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('registration_id')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tournament Registration</h1>
      {registrationId ? (
        <div>Registration Status: {registrationId}</div>
      ) : (
        <RegistrationFormSingle />
      )}
    </div>
  )
} 