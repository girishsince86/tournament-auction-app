import { z } from 'zod';

export const AuctionStatus = z.enum([
  'NOT_STARTED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
]);

export const BidStatus = z.enum([
  'ACTIVE',
  'WINNING',
  'OUTBID',
  'EXPIRED',
]);

export const AuctionSettingsSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  min_bid_increment: z.number().min(1),
  bid_timeout_seconds: z.number().min(5),
  auto_extend_seconds: z.number().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AuctionRoundSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  player_id: z.string().uuid(),
  status: AuctionStatus,
  starting_bid: z.number().min(0),
  current_bid: z.number().min(0).optional(),
  winning_team_id: z.string().uuid().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const BidSchema = z.object({
  id: z.string().uuid(),
  round_id: z.string().uuid(),
  team_id: z.string().uuid(),
  amount: z.number().min(0),
  status: BidStatus,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AuctionRoundWithDetailsSchema = AuctionRoundSchema.extend({
  player: z.object({
    name: z.string(),
    image_url: z.string().url().optional(),
    player_position: z.string(),
    skill_level: z.string(),
  }),
  winning_team: z.object({
    name: z.string(),
    logo_url: z.string().url().optional(),
  }).optional(),
  bids: z.array(BidSchema),
});

export const AuctionSummarySchema = z.object({
  total_players: z.number().min(0),
  players_sold: z.number().min(0),
  total_amount: z.number().min(0),
  average_price: z.number().min(0),
  highest_bid: z.object({
    amount: z.number().min(0),
    player_name: z.string(),
    team_name: z.string(),
  }).optional(),
}); 