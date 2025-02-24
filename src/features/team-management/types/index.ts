import type {
    Player as DatabasePlayer,
    PlayerPosition,
    SkillLevel,
    TeamCombinedRequirement,
    PlayerStatus,
    CategoryType,
    PlayerCategory
} from '@/types/database';

export type { TeamCombinedRequirement };

export interface PlayerWithPreference {
    id: string;
    name: string;
    player_position: PlayerPosition;
    skill_level: SkillLevel;
    base_price: number;
    max_bid?: number;
    notes?: string;
    is_preferred?: boolean;
    preference?: {
        max_bid: number;
        notes?: string;
    };
    profile_image_url?: string;
    status: PlayerStatus;
    category?: {
        category_type: CategoryType;
        name: string;
        base_points: number;
    };
}

export interface TeamBudgetDetails {
    initial_budget: number;
    remaining_budget: number;
    allocated_budget: number;
}

export interface TeamData {
    id: string;
    name: string;
    owner_name: string;
    tournament_id: string;
    tournament_name: string;
    tournament: {
        id: string;
        name: string;
    };
    budget: TeamBudgetDetails;
    players: PlayerWithPreference[];
    requirements: TeamCombinedRequirement[];
    categoryRequirements: CategoryRequirement[];
    available_players: PlayerWithPreference[];
    max_players: number;
}

export interface TeamBudgetMetrics {
    avg_player_cost: number;
    total_players: number;
    total_cost: number;
    remaining_budget: number;
    budget_utilization: number;
}

export interface EditingRequirement extends Omit<TeamCombinedRequirement, 'min_players' | 'max_players' | 'points_allocated'> {
    min_players: number | null;
    max_players: number | null;
    points_allocated: number | null;
}

export interface SelectedPlayerData {
    player_id: string;
    max_bid: number;
}

export interface PlayerPreference {
    player_id: string;
    max_bid: number;
    notes?: string;
}

export interface FilterState {
    position: string;
    skillLevel: string;
    searchQuery: string;
    minPrice: number | '';
    maxPrice: number | '';
}

export interface SortState {
    field: 'name' | 'base_price' | 'position' | 'skill_level';
    direction: 'asc' | 'desc';
}

export interface CategoryRequirement {
    category_type: CategoryType;
    min_players: number;
    min_points: number;
    max_points?: number;
    description?: string;
} 