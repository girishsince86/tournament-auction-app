export interface PlayerCategory {
    id: string;
    tournament_id: string;
    name: string;
    category_type: string;
    base_points: number;
    min_points: number;
    max_points: number;
    description: string;
    skill_level: string;
}

export interface Player {
    id: string;
    name: string;
    player_position: string;
    skill_level: string;
    base_price: number;
    profile_image_url?: string;
    category: PlayerCategory;
    is_preferred?: boolean;
}

export interface TeamOwner {
    id: string;
    auth_user_id: string | null;
    email: string;
    name: string;
    team_id: string | null;
}

export interface TeamData {
    id: string;
    name: string;
    tournament_id: string;
    initial_budget: number;
    remaining_budget: number;
    max_players: number;
    min_players: number;
    budget?: number;
    players?: Player[];
    available_players?: Player[];
    tournament?: {
        id: string;
        name: string;
    };
    team_owners?: TeamOwner[];
    categoryRequirements?: Array<{
        category_type: string;
        min_points: number;
        max_points: number;
        description: string;
    }>;
}

// ... rest of the types ... 