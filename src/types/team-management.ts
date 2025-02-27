import type {
    Player,
    PlayerPosition,
    SkillLevel,
    Team,
    Tournament,
    User,
    PlayerCategory
} from './database';

// Base interface for common fields
interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

// Core Team Types
export interface TeamDetails extends Team {
    owner: User;
    tournament: Tournament;
    current_player_count: number;
    total_points_spent: number;
}

// Team Requirements
export interface TeamPositionRequirement extends BaseEntity {
    team_id: string;
    position: PlayerPosition;
    min_players: number;
    max_players: number;
    current_count: number;
    points_allocated: number;
}

export interface TeamSkillRequirement extends BaseEntity {
    team_id: string;
    skill_level: SkillLevel;
    min_players: number;
    max_players: number;
    current_count: number;
    points_allocated: number;
}

export interface TeamCombinedRequirements {
    position_requirements: TeamPositionRequirement[];
    skill_requirements: TeamSkillRequirement[];
}

// Team Players
export interface TeamPlayer extends Player {
    category: PlayerCategory;
    points_allocated: number;
    acquisition_date: string;
    acquisition_round?: number;
}

// Team Budget
export interface TeamBudgetDetails {
    initial_budget: number;
    remaining_budget: number;
    allocated_budget: number;
    reserved_budget: number;
    average_player_cost: number;
    budget_utilization_percentage: number;
}

export interface TeamBudgetMetrics {
    efficiency_score: number;
    avg_player_cost: number;
    budget_utilization: number;
    tournament_comparison: {
        avg_team_size: number;
        avg_player_cost: number;
        avg_budget_utilization: number;
        highest_budget_utilization: number;
        lowest_budget_utilization: number;
    };
}

// Preferred Players
export interface PreferredPlayerDetails extends BaseEntity {
    team_id: string;
    player: Player;
    priority: number;
    max_bid: number;
    notes?: string;
    category?: PlayerCategory;
    estimated_cost?: number;
}

// Team Statistics
export type PositionStats = {
    count: number;
    total_points: number;
    average_points: number;
};

export type SkillStats = {
    count: number;
    total_points: number;
    average_points: number;
};

export type TeamPositionDistribution = Record<PlayerPosition, PositionStats>;
export type TeamSkillDistribution = Record<SkillLevel, SkillStats>;

export interface TeamStatistics {
    total_players: number;
    position_distribution: TeamPositionDistribution;
    skill_distribution: TeamSkillDistribution;
    budget_metrics: TeamBudgetMetrics;
}

// Team Management State
export interface TeamManagementState {
    team: TeamDetails;
    players: TeamPlayer[];
    preferred_players: PreferredPlayerDetails[];
    requirements: TeamCombinedRequirements;
    budget: TeamBudgetDetails;
    statistics: TeamStatistics;
}

// Form Types
export interface TeamRequirementFormData {
    position?: PlayerPosition;
    skill_level?: SkillLevel;
    min_players: number;
    max_players: number;
}

export interface PreferredPlayerFormData {
    player_id: string;
    priority: number;
    max_bid: number;
    notes?: string;
}

// API Response Types
export interface TeamManagementResponse {
    success: boolean;
    message?: string;
    data?: Partial<TeamManagementState>;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

// Validation Types
export interface TeamValidationError {
    field: string;
    message: string;
    code: string;
}

export interface TeamValidationResult {
    isValid: boolean;
    errors: TeamValidationError[];
}

export interface PlayerCategoryRequirement {
    category_type: 'MARQUEE' | 'CAPPED' | 'UNCAPPED';
    min_players: number;
    max_players?: number;
    current_count: number;
}

export interface TeamCompositionStatus {
    total_players: number;
    min_players: number;
    max_players: number;
    category_requirements: PlayerCategoryRequirement[];
    is_valid: boolean;
} 