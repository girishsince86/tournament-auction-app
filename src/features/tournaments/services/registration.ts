import { RegistrationFormData } from '../types/registration'

export async function submitRegistration(formData: RegistrationFormData) {
  const response = await fetch('/api/tournaments/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to submit registration')
  }

  return response.json()
}

export async function checkJerseyNumber(jerseyNumber: string) {
  const response = await fetch(`/api/tournaments/register/check-jersey?jersey_number=${jerseyNumber}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to check jersey number')
  }

  return response.json()
}

export async function getRegistrationStatus(registrationId: string) {
  const response = await fetch(`/api/tournaments/register/status?registration_id=${registrationId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get registration status')
  }

  return response.json()
} 