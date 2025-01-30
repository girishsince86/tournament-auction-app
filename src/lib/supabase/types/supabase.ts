import { z } from 'zod';
import {
  TournamentSchema,
  TournamentRuleSchema,
  TournamentRegistrationSchema,
} from '../schema/tournaments';
import {
  PlayerSchema,
  PlayerStatisticsSchema,
} from '../schema/players';
import {
  TeamSchema,
  TeamStatisticsSchema,
  TeamWithPlayersSchema,
  TeamSummarySchema,
} from '../schema/teams';
import {
  AuctionSettingsSchema,
  AuctionRoundSchema,
  BidSchema,
  AuctionRoundWithDetailsSchema,
  AuctionSummarySchema,
} from '../schema/auctions';

// Infer types from schemas
export type Tournament = z.infer<typeof TournamentSchema>;
export type TournamentRule = z.infer<typeof TournamentRuleSchema>;
export type TournamentRegistration = z.infer<typeof TournamentRegistrationSchema>;

export type Player = z.infer<typeof PlayerSchema>;
export type PlayerStatistics = z.infer<typeof PlayerStatisticsSchema>;

export type Team = z.infer<typeof TeamSchema>;
export type TeamStatistics = z.infer<typeof TeamStatisticsSchema>;
export type TeamWithPlayers = z.infer<typeof TeamWithPlayersSchema>;
export type TeamSummary = z.infer<typeof TeamSummarySchema>;

export type AuctionSettings = z.infer<typeof AuctionSettingsSchema>;
export type AuctionRound = z.infer<typeof AuctionRoundSchema>;
export type Bid = z.infer<typeof BidSchema>;
export type AuctionRoundWithDetails = z.infer<typeof AuctionRoundWithDetailsSchema>;
export type AuctionSummary = z.infer<typeof AuctionSummarySchema>;

// Database interface
export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: Tournament;
        Insert: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>;
      };
      tournament_rules: {
        Row: TournamentRule;
        Insert: Omit<TournamentRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TournamentRule, 'id' | 'created_at' | 'updated_at'>>;
      };
      tournament_registrations: {
        Row: TournamentRegistration;
        Insert: Omit<TournamentRegistration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TournamentRegistration, 'id' | 'created_at' | 'updated_at'>>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>;
      };
      player_statistics: {
        Row: PlayerStatistics;
        Insert: Omit<PlayerStatistics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlayerStatistics, 'id' | 'created_at' | 'updated_at'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>;
      };
      team_statistics: {
        Row: TeamStatistics;
        Insert: Omit<TeamStatistics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamStatistics, 'id' | 'created_at' | 'updated_at'>>;
      };
      auction_settings: {
        Row: AuctionSettings;
        Insert: Omit<AuctionSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AuctionSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      auction_rounds: {
        Row: AuctionRound;
        Insert: Omit<AuctionRound, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AuctionRound, 'id' | 'created_at' | 'updated_at'>>;
      };
      bids: {
        Row: Bid;
        Insert: Omit<Bid, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Bid, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      team_summaries: {
        Row: TeamSummary;
      };
      auction_round_details: {
        Row: AuctionRoundWithDetails;
      };
    };
    Functions: {
      check_bid_validity: {
        Args: { bid: Bid };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'ADMIN' | 'CONDUCTOR' | 'TEAM_OWNER';
      player_position: 
        | 'P1_RIGHT_BACK'
        | 'P2_RIGHT_FRONT'
        | 'P3_MIDDLE_FRONT'
        | 'P4_LEFT_FRONT'
        | 'P5_LEFT_BACK'
        | 'P6_MIDDLE_BACK'
        | 'ANY_POSITION';
      player_status: 'AVAILABLE' | 'IN_AUCTION' | 'SOLD' | 'UNSOLD';
      skill_level: 
        | 'RECREATIONAL_C'
        | 'INTERMEDIATE_B'
        | 'UPPER_INTERMEDIATE_BB'
        | 'COMPETITIVE_A';
      tshirt_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL';
      tournament_status: 
        | 'DRAFT'
        | 'REGISTRATION_OPEN'
        | 'REGISTRATION_CLOSED'
        | 'IN_PROGRESS'
        | 'COMPLETED';
      auction_status: 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
      bid_status: 'ACTIVE' | 'WINNING' | 'OUTBID' | 'EXPIRED';
    };
  };
} 