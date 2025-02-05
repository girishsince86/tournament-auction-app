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
  categoryDistribution: CategoryDistribution[]
  jerseySizes: JerseySize[]
  recentRegistrations: RecentRegistration[]
} 