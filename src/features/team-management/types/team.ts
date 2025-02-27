import type { CategoryType, PlayerPosition, SkillLevel, PlayerStatus } from '@/types/database';
import type { PlayerWithPreference } from './player';
import type { CategoryRequirement } from './category';
import type { TeamBudgetDetails } from './budget';

export interface TeamBudgetMetrics {
    avg_player_cost: number;
    total_players: number;
    total_cost: number;
    remaining_budget: number;
    budget_utilization: number;
}

export interface TeamData {
    id: string;
    name: string;
    owner_name: string;
    tournament_id: string;
    tournament: {
        id: string;
        name: string;
    };
    budget: TeamBudgetDetails;
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
            status: PlayerStatus;
            category: {
                category_type: CategoryType;
                name: string;
                base_points: number;
            } | null;
        };
    }>;
    available_players: PlayerWithPreference[];
    max_players: number;
    min_players: number;
    categoryRequirements: CategoryRequirement[];
} 