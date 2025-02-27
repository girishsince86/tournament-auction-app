import type {
    PlayerPosition,
    SkillLevel,
    PlayerStatus,
    CategoryType
} from '@/types/database';

interface PlayerCategory {
    category_type: CategoryType;
    name: string;
    base_points: number;
}

interface CategoryRequirement {
    category_type: CategoryType;
    min_players: number;
    min_points: number;
    max_points?: number;
    description?: string;
}

interface Player {
    id: string;
    name: string;
    player_position: PlayerPosition;
    skill_level: SkillLevel;
    base_price: number;
    profile_image_url?: string;
    status: PlayerStatus;
    category?: PlayerCategory | null;
    is_preferred?: boolean;
}

interface PlayerPreference {
    max_bid: number;
    notes?: string;
}

interface PlayerWithPreference extends Player {
    preference?: PlayerPreference;
}

interface TeamBudgetDetails {
    initial_budget: number;
    remaining_budget: number;
    allocated_budget: number;
    reserved_budget?: number;
    average_player_cost?: number;
    budget_utilization_percentage?: number;
}

interface TeamBudgetMetrics {
    avg_player_cost: number;
    total_players: number;
    total_cost: number;
    remaining_budget: number;
    budget_utilization: number;
}

interface TeamData {
    id: string;
    name: string;
    owner_name: string;
    tournament_id: string;
    tournament: {
        id: string;
        name: string;
    };
    budget: TeamBudgetDetails;
    players: PlayerWithPreference[];
    available_players: PlayerWithPreference[];
    max_players: number;
    categoryRequirements: CategoryRequirement[];
}

interface FilterState {
    position: string;
    skillLevel: string;
    searchQuery: string;
    minPrice: number | '';
    maxPrice: number | '';
}

interface SortState {
    field: 'name' | 'base_price' | 'position' | 'skill_level';
    direction: 'asc' | 'desc';
}

interface SelectedPlayerData {
    player_id: string;
    max_bid: number;
}

export type {
    PlayerCategory,
    Player,
    PlayerPreference,
    PlayerWithPreference
} from './player';

export type {
    CategoryRequirement,
    TeamBudgetDetails,
    TeamBudgetMetrics,
    TeamData
} from './team';

export type {
    FilterState,
    SortState,
    SelectedPlayerData
} from './filter';