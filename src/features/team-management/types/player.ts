import type {
    PlayerPosition,
    SkillLevel,
    PlayerStatus,
    CategoryType
} from '@/types/database';

export interface PlayerCategory {
    category_type: CategoryType;
    name: string;
    base_points: number;
}

export interface Player {
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

export interface PlayerPreference {
    max_bid: number;
    notes?: string;
}

export interface PlayerWithPreference extends Player {
    preference?: PlayerPreference;
} 