import type {
    PlayerPosition,
    SkillLevel,
    PlayerStatus,
    CategoryType
} from '@/types/database';

export interface DatabaseTeam {
    id: string;
    name: string;
    initial_budget: number;
    remaining_budget: number;
    max_players: number;
    min_players: number;
    tournament_id: string;
    team_owners: Array<{
        id: string;
        name: string;
        email: string;
        auth_user_id: string;
    }>;
    tournaments: Array<{
        id: string;
        name: string;
    }>;
    players: Array<{
        id: string;
        final_points: number;
        player: {
            id: string;
            name: string;
            player_position: PlayerPosition;
            skill_level: SkillLevel;
            base_price: number;
            profile_image_url: string | null;
            phone_number?: string;
            status: PlayerStatus;
            category: {
                category_type: CategoryType;
                name: string;
                base_points: number;
            } | null;
        };
    }>;
}

export interface DatabasePlayer {
    id: string;
    name: string;
    player_position: PlayerPosition;
    skill_level: SkillLevel;
    base_price: number;
    profile_image_url: string | null;
    phone_number?: string;
    status: PlayerStatus;
    category: {
        category_type: CategoryType;
        name: string;
        base_points: number;
    } | null;
    preference: Array<{
        max_bid: number;
        notes: string | null;
    }> | null;
}

export interface DatabasePlayerCategory {
    id: string;
    name: string;
    category_type: CategoryType;
    base_points: number;
    min_points: number;
    max_points: number | null;
    description: string | null;
    skill_level: SkillLevel;
} 