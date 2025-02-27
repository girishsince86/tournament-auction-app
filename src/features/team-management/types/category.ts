import type { CategoryType } from '@/types/database';

export interface CategoryRequirement {
    category_type: CategoryType;
    min_players: number;
    min_points: number;
    max_points?: number;
    description?: string;
} 