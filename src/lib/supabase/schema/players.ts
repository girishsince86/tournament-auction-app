import { z } from 'zod';

export const PlayerPosition = z.enum([
  'P1_RIGHT_BACK',
  'P2_RIGHT_FRONT',
  'P3_MIDDLE_FRONT',
  'P4_LEFT_FRONT',
  'P5_LEFT_BACK',
  'P6_MIDDLE_BACK',
  'ANY_POSITION',
]);

export const PlayerStatus = z.enum([
  'AVAILABLE',
  'IN_AUCTION',
  'ALLOCATED',
  'UNALLOCATED',
]);

export const SkillLevel = z.enum([
  'RECREATIONAL_C',
  'INTERMEDIATE_B',
  'UPPER_INTERMEDIATE_BB',
  'COMPETITIVE_A',
]);

export type SkillLevel = z.infer<typeof SkillLevel>;

export const skillLevelDisplayText: Record<SkillLevel, string> = {
  'RECREATIONAL_C': 'Recreational',
  'INTERMEDIATE_B': 'Intermediate',
  'UPPER_INTERMEDIATE_BB': 'Upper Intermediate',
  'COMPETITIVE_A': 'Competitive',
};

export const skillLevelLabels: Record<SkillLevel, string> = {
  'COMPETITIVE_A': 'Level 1',
  'UPPER_INTERMEDIATE_BB': 'Level 2',
  'INTERMEDIATE_B': 'Level 3',
  'RECREATIONAL_C': 'Level 4',
};

export const TShirtSize = z.enum([
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  '4XL',
]);

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  age: z.number().min(8).max(70),
  player_position: PlayerPosition,
  base_price: z.number().min(0),
  current_team_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
  status: PlayerStatus,
  phone_number: z.string().min(10),
  apartment_number: z.string().min(1),
  jersey_number: z.string().optional(),
  tshirt_size: TShirtSize,
  skill_level: SkillLevel,
  height: z.number().min(100).max(250).optional(),
  experience: z.number().min(0).max(50).optional(),
  tournament_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const PlayerStatisticsSchema = z.object({
  id: z.string().uuid(),
  player_id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  matches_played: z.number().min(0),
  points_scored: z.number().min(0),
  serves_total: z.number().min(0),
  serves_successful: z.number().min(0),
  blocks_total: z.number().min(0),
  blocks_successful: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}); 