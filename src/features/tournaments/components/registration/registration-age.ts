/**
 * Age criteria for registration categories.
 * Reference date: 1 March 2026 (tournament starting month).
 */

import { RegistrationCategory } from '../../types/registration'

export const AGE_REFERENCE_DATE = new Date('2026-03-01')

// DOB boundaries (YYYY-MM-DD, inclusive where applicable)
export const DOB_8_12_MIN = '2014-03-02' // oldest for 8-12
export const DOB_8_12_MAX = '2018-03-01' // youngest for 8-12
export const DOB_13_21_MIN = '2005-03-02' // oldest for 13-21
export const DOB_13_21_MAX = '2014-03-01' // youngest for 13-21
export const DOB_VB_MAX = '2014-03-01' // Volleyball Open: born on or before
export const DOB_TB_WOMEN_MAX = '2005-03-01' // Throwball Women: born on or before

/** Normalize to YYYY-MM-DD for comparison (date-only, no timezone shift). */
function toDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const d_ = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${d_}`
}

/**
 * Validates date of birth for the given registration category.
 * Returns an error message or empty string if valid.
 */
export function validateDoBForCategory(
  dob: string,
  category: RegistrationCategory
): string {
  const parsed = new Date(dob)
  if (Number.isNaN(parsed.getTime())) return 'Please enter a valid date of birth'
  const dobStr = toDateOnly(parsed)

  switch (category) {
    case RegistrationCategory.THROWBALL_8_12_MIXED:
      if (dobStr < DOB_8_12_MIN || dobStr > DOB_8_12_MAX) {
        return 'Date of birth must be between 2 March 2014 and 1 March 2018 (age 8-12 as of 1 March 2026)'
      }
      return ''
    case RegistrationCategory.THROWBALL_13_17_MIXED:
      if (dobStr < DOB_13_21_MIN || dobStr > DOB_13_21_MAX) {
        return 'Date of birth must be between 2 March 2005 and 1 March 2014 (age 13-21 as of 1 March 2026)'
      }
      return ''
    case RegistrationCategory.VOLLEYBALL_OPEN_MEN:
      if (dobStr > DOB_VB_MAX) {
        return 'Must be born on or before 1 March 2014 (age 12+ as of 1 March 2026)'
      }
      return ''
    case RegistrationCategory.THROWBALL_WOMEN:
      if (dobStr > DOB_TB_WOMEN_MAX) {
        return 'Must be born on or before 1 March 2005 (age 21+ as of 1 March 2026)'
      }
      return ''
    default:
      return ''
  }
}

/** Categories that require date of birth (youth + VB + TB Women). */
export function categoryRequiresDoB(category: RegistrationCategory): boolean {
  return (
    category === RegistrationCategory.THROWBALL_8_12_MIXED ||
    category === RegistrationCategory.THROWBALL_13_17_MIXED ||
    category === RegistrationCategory.VOLLEYBALL_OPEN_MEN ||
    category === RegistrationCategory.THROWBALL_WOMEN
  )
}
