import type { SelectChangeEvent } from '@mui/material'
import type { RegistrationFormData } from '../../../types/registration'
import type { SectionName } from '../registration-constants'

export interface RegistrationSectionProps {
  formData: RegistrationFormData
  errors: Partial<Record<keyof RegistrationFormData, string>>
  expanded: boolean
  isComplete: boolean
  onExpand: () => void
  onChange: (field: keyof RegistrationFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (event: SelectChangeEvent<any>) => void
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof RegistrationFormData, string>>>>
  onSectionCompletion: (section: SectionName) => void
}
