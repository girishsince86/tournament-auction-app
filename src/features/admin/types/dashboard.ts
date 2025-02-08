import { RegistrationCategory, TShirtSize } from '@/features/tournaments/types/registration'

export interface CategoryDistribution {
  name: string
  count: number
}

export interface JerseySize {
  size: TShirtSize
  count: number
}

export interface RecentRegistration {
  id: string
  first_name: string
  last_name: string
  registration_category: RegistrationCategory
  tshirt_number: string
  created_at: string
  is_verified: boolean
}

export interface RegistrationSummary {
  totalRegistrations: number
  volleyballCount: number
  throwballCount: number
  youth8To12Count: number
  youth13To17Count: number
  categoryDistribution: Array<{
    name: string
    count: number
  }>
  jerseySizes: Array<{
    size: string
    count: number
  }>
  recentRegistrations: Array<{
    id: string
    first_name: string
    last_name: string
    registration_category: string
    tshirt_number: string
    created_at: string
    is_verified: boolean
  }>
  timelineData: Array<{
    created_at: string
    registration_category: string
  }>
  paymentCollections: Array<{
    receiver: string
    totalAmount: number
    verifiedAmount: number
  }>
} 