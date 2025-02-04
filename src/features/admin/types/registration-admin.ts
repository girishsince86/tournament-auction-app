export type RegistrationCategory = 'VOLLEYBALL_OPEN_MEN' | 'THROWBALL_WOMEN' | 'THROWBALL_13_17_MIXED' | 'THROWBALL_8_12_MIXED';
export type SkillLevel = 'RECREATIONAL_C' | 'INTERMEDIATE_B' | 'UPPER_INTERMEDIATE_BB' | 'COMPETITIVE_A';
export type LastPlayedStatus = 'PLAYING_ACTIVELY' | 'NOT_PLAYED_SINCE_LAST_YEAR' | 'NOT_PLAYED_IN_FEW_YEARS';
export type PlayingPosition = 'P1_RIGHT_BACK' | 'P2_RIGHT_FRONT' | 'P3_MIDDLE_FRONT' | 'P4_LEFT_FRONT' | 'P5_LEFT_BACK' | 'P6_MIDDLE_BACK';
export type TshirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL';

export interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  flat_number: string;
  height?: number;
  registration_category: RegistrationCategory;
  registration_type?: string;
  playing_positions?: string[];
  skill_level?: SkillLevel;
  tshirt_number?: string;
  tshirt_name?: string;
  tshirt_size?: TshirtSize;
  payment_upi_id?: string;
  payment_transaction_id?: string;
  paid_to?: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  last_played_date?: LastPlayedStatus;
}

export interface RegistrationFilters {
  search?: string;
  category?: RegistrationCategory;
  status?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface RegistrationResponse {
  registrations: Registration[];
  total: number;
  page: number;
  limit: number;
} 