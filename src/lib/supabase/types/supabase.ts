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
      auction_queue: {
        Row: {
          id: string;
          tournament_id: string;
          player_id: string;
          queue_position: number;
          is_processed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auction_queue']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['auction_queue']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      players: {
        Row: {
          id: string;
          name: string;
          age: number;
          player_position: string;
          base_price: number;
          current_team_id: string | null;
          image_url: string | null;
          status: string;
          phone_number: string;
          apartment_number: string;
          jersey_number: string | null;
          tshirt_size: string;
          skill_level: string;
          height: number | null;
          experience: number | null;
          category_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          owner_name: string;
          owner_id: string;
          initial_budget: number;
          remaining_budget: number;
          max_players: number;
          tournament_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      auction_rounds: {
        Row: {
          id: string;
          tournament_id: string;
          player_id: string;
          status: string;
          starting_price: number;
          final_points: number | null;
          winning_team_id: string | null;
          is_manual_entry: boolean;
          display_sequence: number;
          auction_date: string;
          conductor_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auction_rounds']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['auction_rounds']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          max_teams: number;
          max_players_per_team: number;
          min_players_per_team: number;
          team_points_budget: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      player_categories: {
        Row: {
          id: string;
          tournament_id: string;
          name: string;
          category_type: string;
          base_points: number;
          min_points: number;
          max_points: number;
          description: string;
          skill_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['player_categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['player_categories']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      team_position_requirements: {
        Row: {
          id: string;
          team_id: string;
          position: string;
          min_players: number;
          max_players: number;
          current_count: number;
          points_allocated: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_position_requirements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['team_position_requirements']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      team_skill_requirements: {
        Row: {
          id: string;
          team_id: string;
          skill_level: string;
          min_players: number;
          max_players: number;
          current_count: number;
          points_allocated: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_skill_requirements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['team_skill_requirements']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
      team_owners: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          name: string;
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          name: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string;
          name?: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
      player_status: 'AVAILABLE' | 'ALLOCATED' | 'UNALLOCATED';
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