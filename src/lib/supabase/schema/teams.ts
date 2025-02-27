import { z } from 'zod';

export interface Team {
    id: string;
    name: string;
    tournament_id: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    initial_budget: number;
    remaining_budget: number;
}

export interface TeamWithBudget extends Team {
    total_spent: number;
    players_count: number;
}

export const TeamOwnerSchema = z.object({
  id: z.string().uuid(),
  auth_user_id: z.string().uuid().nullable(),
  email: z.string().email(),
  name: z.string().min(1),
  team_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  tournament_id: z.string().uuid(),
  initial_budget: z.number().min(0),
  remaining_budget: z.number().min(0),
  max_players: z.number().min(1),
  logo_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  team_owners: z.array(TeamOwnerSchema).optional(),
});

export const TeamStatisticsSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  matches_played: z.number().min(0),
  matches_won: z.number().min(0),
  matches_lost: z.number().min(0),
  points_scored: z.number().min(0),
  points_conceded: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TeamWithPlayersSchema = TeamSchema.extend({
  players: z.array(z.string().uuid()),
  statistics: TeamStatisticsSchema.optional(),
});

export const TeamSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  owner_name: z.string(),
  player_count: z.number().min(0),
  remaining_budget: z.number().min(0),
  total_spent: z.number().min(0),
  win_percentage: z.number().min(0).max(100).optional(),
}); 