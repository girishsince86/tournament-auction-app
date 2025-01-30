import { z } from 'zod';

export const TournamentStatus = z.enum([
  'DRAFT',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const RegistrationCategory = z.enum([
  'VOLLEYBALL_OPEN_MEN',
  'THROWBALL_WOMEN',
  'THROWBALL_13_17_MIXED',
  'THROWBALL_8_12_MIXED',
]);

export const TournamentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  registration_deadline: z.string().datetime(),
  status: TournamentStatus,
  max_teams: z.number().min(1),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TournamentRuleSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  rule_text: z.string().min(1),
  rule_order: z.number().min(0),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TournamentRegistrationSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  registration_category: RegistrationCategory,
  registration_type: z.string(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(10),
  flat_number: z.string().min(1),
  height: z.number().min(100).max(250),
  last_played_date: z.string().datetime().optional(),
  playing_positions: z.array(z.string()),
  skill_level: z.enum(['RECREATIONAL_C', 'INTERMEDIATE_B', 'UPPER_INTERMEDIATE_BB', 'COMPETITIVE_A']),
  tshirt_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']),
  tshirt_name: z.string().optional(),
  tshirt_number: z.string().optional(),
  payment_upi_id: z.string().min(1),
  payment_transaction_id: z.string().min(1),
  paid_to: z.string().min(1),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}); 