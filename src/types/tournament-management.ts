import { Team, Tournament } from './database';

// Enums
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MatchType = 'REGULAR' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
export type FormatType = 'VOLLEYBALL' | 'THROWBALL';
export type FormationMethod = 'AUCTION' | 'SPIN_THE_WHEEL';

// Base interface for common fields
interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Tournament Format
export interface TournamentFormat extends BaseEntity {
  tournament_id: string;
  name: string;
  format_type: FormatType;
  team_formation_method: FormationMethod;
  scoring_system?: Record<string, any>;
  match_duration?: string;
  tournament?: Tournament;
  teams?: Team[];
}

// Tournament Group
export interface TournamentGroup extends BaseEntity {
  tournament_id: string;
  format_id: string;
  name: string;
  description?: string;
  
  // Relations
  tournament?: Tournament;
  format?: TournamentFormat;
  group_teams?: GroupTeam[];
}

// Group Team
export interface GroupTeam extends BaseEntity {
  group_id: string;
  team_id: string;
  ranking?: number;
  points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  points_scored: number;
  points_conceded: number;
  
  // Relations
  group?: TournamentGroup;
  team?: Team;
}

// Court
export interface Court extends BaseEntity {
  name: string;
  location_description?: string;
  notes?: string;
  matches?: Match[];
}

// Match
export interface Match extends BaseEntity {
  tournament_id: string;
  format_id: string;
  team1_id: string;
  team2_id: string;
  court_id?: string;
  group_id?: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  status: MatchStatus;
  match_type: MatchType;
  round_number?: number;
  notes?: string;
  
  // Relations
  tournament?: Tournament;
  format?: TournamentFormat;
  team1?: Team;
  team2?: Team;
  court?: Court;
  group?: TournamentGroup;
  result?: MatchResult;
  sets?: MatchSet[];
}

// Match Result
export interface MatchResult extends BaseEntity {
  match_id: string;
  team1_score: number;
  team2_score: number;
  winner_team_id?: string;
  match_stats?: Record<string, any>;
  notes?: string;
  
  // Relations
  match?: Match;
  winner_team?: Team;
}

// Match Set
export interface MatchSet extends BaseEntity {
  match_id: string;
  set_number: number;
  team1_score: number;
  team2_score: number;
  winner_team_id?: string;
  notes?: string;
  
  // Relations
  match?: Match;
  winner_team?: Team;
}

// View Types

// Match Schedule View
export interface MatchScheduleView {
  id: string;
  tournament_id: string;
  tournament_name: string;
  format_id: string;
  format_name: string;
  format_type: FormatType;
  team1_id: string;
  team1_name: string;
  team2_id: string;
  team2_name: string;
  court_id?: string;
  court_name?: string;
  group_id?: string;
  group_name?: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  status: MatchStatus;
  match_type: MatchType;
  round_number?: number;
  notes?: string;
}

// Match Results View
export interface MatchResultsView {
  id: string;
  match_id: string;
  tournament_id: string;
  tournament_name: string;
  format_id: string;
  format_name: string;
  format_type: FormatType;
  team1_id: string;
  team1_name: string;
  team1_score: number;
  team2_id: string;
  team2_name: string;
  team2_score: number;
  winner_team_id?: string;
  winner_team_name?: string;
  scheduled_date: string;
  status: MatchStatus;
  match_type: MatchType;
  round_number?: number;
}

// Group Standings View
export interface GroupStandingsView {
  id: string;
  group_id: string;
  group_name: string;
  format_id: string;
  format_name: string;
  format_type: FormatType;
  tournament_id: string;
  tournament_name: string;
  team_id: string;
  team_name: string;
  ranking?: number;
  points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  points_scored: number;
  points_conceded: number;
  win_percentage: number;
}

// Team Standings
export interface TeamStanding {
  team_id: string;
  team_name: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  points_scored: number;
  points_conceded: number;
  win_percentage: number;
}

// Extended Team type with format
export interface TeamWithFormat extends Team {
  format_id: string;
  format?: TournamentFormat;
}

// Public Team Composition Types
export interface PublicTeamComposition {
  id: string;
  name: string;
  logo_url?: string;
  format_type: FormatType;
  format_name: string;
  tournament_id: string;
  tournament_name: string;
  owners: {
    id: string;
    name: string;
    profile_image_url?: string;
  }[];
  players: PublicTeamPlayer[];
}

export interface PublicTeamPlayer {
  id: string;
  name: string;
  tshirt_number?: string;
  tshirt_name?: string;
  apartment_number?: string;
  profile_image_url?: string;
  position?: string;
  skill_level?: string;
} 