import { Suspense } from 'react'
import { RegistrationPageContent } from '@/features/tournaments/components/registration/registration-page-content'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationPageContent />
    </Suspense>
  )
} 