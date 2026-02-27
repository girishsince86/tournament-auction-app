// Enums and Common Types
export type UserRole = 'ADMIN' | 'CONDUCTOR' | 'TEAM_OWNER';
export type PlayerPosition = 'P1_RIGHT_BACK' | 'P2_RIGHT_FRONT' | 'P3_MIDDLE_FRONT' | 'P4_LEFT_FRONT' | 'P5_LEFT_BACK' | 'P6_MIDDLE_BACK' | 'ANY_POSITION';
export type SportCategory = 'VOLLEYBALL_OPEN_MEN' | 'THROWBALL_WOMEN' | 'THROWBALL_13_17_MIXED' | 'THROWBALL_8_12_MIXED';
export type PlayerStatus = 'AVAILABLE' | 'ALLOCATED' | 'UNALLOCATED';
export type SkillLevel = 'RECREATIONAL_C' | 'INTERMEDIATE_B' | 'UPPER_INTERMEDIATE_BB' | 'COMPETITIVE_A';
export type CategoryType = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'THROWBALL_WOMEN' | 'THROWBALL_13_17_MIXED' | 'THROWBALL_8_12_MIXED' | 'VOLLEYBALL_U12_BOYS' | 'VOLLEYBALL_U16_BOYS' | 'VOLLEYBALL_OPEN_MEN';
export type TshirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type AuctionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'UNDONE';
export type LastPlayedDate = 'LESS_THAN_6_MONTHS' | 'SIX_TO_TWELVE_MONTHS' | 'MORE_THAN_YEAR' | 'NEVER';
export type RegistrationCategory = 'ADULT' | 'YOUTH';
export type AchievementType = 'TOURNAMENT_WIN' | 'BEST_PLAYER' | 'MOST_VALUABLE_PLAYER' | 'OTHER';

// Base interface for common fields
interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

// User Management
export interface User extends BaseEntity {
    email: string;
    role: UserRole;
    team_id?: string;
    name?: string;
}

// Tournament Management
export interface Tournament extends BaseEntity {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    registration_deadline: string;
    max_teams: number;
    max_players_per_team: number;
    min_players_per_team: number;
    team_points_budget: number;
    is_active: boolean;
}

export interface TournamentRule extends BaseEntity {
    rule_text: string;
    rule_order: number;
    is_active: boolean;
}

// Player Management
export interface Player extends BaseEntity {
    name: string;
    age?: number;
    player_position: PlayerPosition;
    base_price: number;
    current_team_id?: string;
    image_url?: string;
    status: PlayerStatus;
    phone_number?: string;
    apartment_number?: string;
    jersey_number?: string;
    skill_level?: SkillLevel;
    height?: number;
    experience?: number;
    tshirt_size?: TshirtSize;
    category_id?: string;
    tournament_id?: string;
    registration_data?: any;
    profile_image_url?: string;
    sport_category?: SportCategory;
}

export interface PlayerCategory extends BaseEntity {
    tournament_id: string;
    name: string;
    category_type: CategoryType;
    base_points: number;
    min_points: number;
    max_points: number;
    description?: string;
    skill_level: SkillLevel;
}

export interface PlayerAchievement extends BaseEntity {
    player_id: string;
    tournament_name?: string;
    achievement_type: AchievementType;
    title: string;
    description?: string;
    achievement_date?: string;
}

export interface PlayerTournamentHistory extends BaseEntity {
    player_id: string;
    name: string;
    year: number;
    role: string;
}

// Team Management
export interface Team extends BaseEntity {
    name: string;
    owner_name: string;
    initial_budget: number;
    remaining_budget: number;
    max_players: number;
    tournament_id: string;
    team_owners?: TeamOwner[];
    sport_category?: SportCategory;
}

export interface TeamOwner extends BaseEntity {
    auth_user_id: string | null;
    email: string;
    name: string;
    team_id: string | null;
}

export interface TeamCombinedRequirement extends BaseEntity {
    team_id: string;
    position: PlayerPosition;
    skill_level: SkillLevel;
    min_players: number;
    max_players: number;
    current_count: number;
    points_allocated: number;
}

export interface TeamBudgetAnalysis {
    team_id: string;
    team_name: string;
    initial_budget: number;
    remaining_budget: number;
    number_of_preferred_players: number;
    total_preferred_points: number;
    potential_remaining_budget: number;
}

export interface TeamSummary {
    id: string;
    name: string;
    budget: number;
    player_count: number;
    position_distribution: Record<PlayerPosition, number>;
}

// Auction Management
export interface AuctionDisplayConfig extends BaseEntity {
    tournament_id: string;
    initial_timer_seconds: number;
    subsequent_timer_seconds: number;
    first_call_seconds: number;
    second_call_seconds: number;
    final_call_seconds: number;
    enable_sound: boolean;
    enable_visual_effects: boolean;
}

export interface AuctionQueue extends BaseEntity {
    tournament_id: string;
    player_id: string;
    queue_position: number;
    is_processed: boolean;
    sport_category?: SportCategory;
}

export interface AuctionRound extends BaseEntity {
    player_id: string;
    starting_price: number;
    winning_team_id?: string;
    status: AuctionStatus;
    start_time: string;
    end_time?: string;
    final_points?: number;
    is_manual_entry: boolean;
    conductor_notes?: string;
    display_sequence?: number;
    auction_date: string;
    tournament_id: string;
    sport_category?: SportCategory;
}

/** @deprecated Position-specific min fields (min_setters, etc.) use a different taxonomy than the actual PlayerPosition enum. Never enforced by any code. */
export interface AuctionSettings extends BaseEntity {
    min_players_per_team: number;
    max_players_per_team: number;
    min_bid_increment: number;
    timer_duration_seconds: number;
    min_setters: number;
    min_outside_hitters: number;
    min_middle_blockers: number;
    min_opposites: number;
    min_liberos: number;
}

/** @deprecated Only used by the handle_new_bid trigger on the bids table, which is also dead. Live bidding was abandoned. */
export interface AuctionState extends BaseEntity {
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
    current_player_id?: string;
    current_round: number;
    bid_end_time?: string;
    winning_bid_id?: string;
}

/** @deprecated The bids table exists but is never written to. Live bidding was abandoned in favor of conductor-driven auction rounds. */
export interface Bid extends BaseEntity {
    round_id: string;
    team_id: string;
    amount: number;
}

// Registration Management
export interface TournamentRegistration extends BaseEntity {
    first_name: string;
    last_name: string;
    phone_number: string;
    flat_number: string;
    height: number;
    registration_category: RegistrationCategory;
    registration_type: string;
    playing_positions: PlayerPosition[];
    skill_level: SkillLevel;
    tshirt_number: string;
    tshirt_name: string;
    payment_upi_id: string;
    payment_transaction_id: string;
    paid_to: string;
    is_verified: boolean;
    last_played_date: LastPlayedDate;
    email?: string;
    date_of_birth?: string;
    parent_name?: string;
    parent_phone_number?: string;
    verified_by?: string;
    verified_at?: string;
    verification_notes?: string;
    amount_received?: number;
    tshirt_size?: TshirtSize;
    profile_image_url?: string;
    profile_token?: string;
    profile_token_expires_at?: string;
}

export interface PreferredPlayer extends BaseEntity {
    team_id: string;
    player_id: string;
    priority: number;
    notes?: string;
    max_bid: number;
}

export interface VerificationStatistics {
    verifier_email: string;
    total_verifications: number;
    verifications_last_24h: number;
    first_verification: string;
    last_verification: string;
} 