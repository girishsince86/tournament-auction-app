/**
 * Shared constants for the single-page registration form.
 * Used by registration-form-single, section components, and dialogs.
 */

export type SectionName = 'category' | 'personal' | 'profile' | 'jersey' | 'payment'

export const SKILL_LEVELS = [
  { value: 'RECREATIONAL_C', label: 'Recreational C' },
  { value: 'INTERMEDIATE_B', label: 'Intermediate B' },
  { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate BB' },
  { value: 'COMPETITIVE_A', label: 'Competitive A' },
] as const

export const LAST_PLAYED_OPTIONS = [
  { value: 'PLAYING_ACTIVELY', label: 'Playing Actively' },
  { value: 'NOT_PLAYED_SINCE_LAST_YEAR', label: 'Not Played since last year' },
  { value: 'NOT_PLAYED_IN_FEW_YEARS', label: 'Not played in few years' },
] as const

export const PLAYING_POSITIONS = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
  { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' },
] as const

export const PAYMENT_RECEIVERS = [
  { value: 'Vasu Chepuru', label: 'Vasu Chepuru (9849521594)' },
  { value: 'Amit Saxena', label: 'Amit Saxena (9866674460)' },
] as const

export const TSHIRT_SIZES = [
  { value: 'XS', label: 'XS (34")', details: 'Chest: 34", Length: 24", Sleeve: 7.5"' },
  { value: 'S', label: 'S (36")', details: 'Chest: 36", Length: 25", Sleeve: 8"' },
  { value: 'M', label: 'M (38")', details: 'Chest: 38", Length: 26", Sleeve: 8"' },
  { value: 'L', label: 'L (40")', details: 'Chest: 40", Length: 27", Sleeve: 8.5"' },
  { value: 'XL', label: 'XL (42")', details: 'Chest: 42", Length: 28", Sleeve: 8.5"' },
  { value: '2XL', label: '2XL (44")', details: 'Chest: 44", Length: 29", Sleeve: 9"' },
  { value: '3XL', label: '3XL (46")', details: 'Chest: 46", Length: 30", Sleeve: 10"' },
] as const

export const REGISTRATION_CATEGORIES = [
  { value: 'VOLLEYBALL_OPEN_MEN', label: 'Volleyball - Open' },
  { value: 'THROWBALL_WOMEN', label: 'Throwball - Women' },
  { value: 'THROWBALL_13_17_MIXED', label: 'Throwball - 13-17 Mixed' },
  { value: 'THROWBALL_8_12_MIXED', label: 'Throwball - 8-12 Mixed' },
] as const

export const TOURNAMENT_RULES = [
  {
    title: 'Categories & Registration',
    rules: [
      'Categories: Volleyball - Open, Women\'s Throwball, Throwball 8-12 Mixed, Throwball 13-17 Mixed',
      'Only PBEL City residents can participate',
      'Individual registrations only (no team registrations)',
      'Players can register for only one category',
      'Registration fee: INR 750 per player',
      'Registration deadline strictly enforced',
      'No late registrations accepted',
    ],
  },
  {
    title: 'Age Requirements',
    rules: [
      'Throwball 8-12 Mixed: Must be born on or after May 1, 2012',
      'Throwball 13-17 Mixed: Must be born on or after May 1, 2008',
      'Parent/Guardian information required for youth categories',
      'Age verification may be required during the tournament',
    ],
  },
  {
    title: 'Team Formation',
    rules: [
      'Volleyball - Open:',
      '• Players will be drafted through skill-based allocation',
      '• Teams formed considering playing positions and experience',
      'Throwball Categories:',
      '• Teams formed through balanced distribution of skill levels',
      '• Random allocation within skill groups',
    ],
  },
  {
    title: 'Jersey & Equipment',
    rules: [
      'Each player receives a tournament jersey',
      'Jersey numbers may need to be revised after team formation to avoid conflicts',
      'Team captains will coordinate jersey number changes if needed',
      'Jersey name customization available',
      'Size options available from XS(34") to 3XL(46") with detailed measurements',
    ],
  },
  {
    title: 'Match Rules & Conduct',
    rules: [
      'Teams must arrive 15 minutes before scheduled match time',
      'Teams must maintain sportsmanlike conduct',
      'Referee decisions are final',
    ],
  },
  {
    title: 'Medical & Safety',
    rules: [
      'Basic first aid will be available at venue',
      'Players participate at their own risk',
      'Report any injuries to tournament officials immediately',
    ],
  },
  {
    title: 'Communication & Administration',
    rules: [
      'Official WhatsApp group for tournament updates',
      'Schedule changes will be notified 24 hours in advance',
      'Team captains responsible for relay of information',
      'Organizing Committee reserves rights to verify residency, modify rules, take disciplinary action, and adjust schedule',
      'All decisions by the organizing committee are final',
    ],
  },
] as const
