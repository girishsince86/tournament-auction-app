import type { PlayerPosition, SkillLevel, CategoryType } from '@/types/database';
import type { FilterState, SortState } from '../types';
import { SportsVolleyball as VolleyballIcon } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';

export interface PositionConfig {
    value: PlayerPosition;
    label: string;
    color: string;
    icon: typeof VolleyballIcon;
    order: number;
}

export interface SkillConfig {
    value: SkillLevel;
    label: string;
    color: string;
    icon: typeof VolleyballIcon;
    order: number;
}

export interface CategoryConfig {
    value: CategoryType;
    label: string;
    color: string;
    icon: typeof VolleyballIcon;
    order: number;
}

export const POSITIONS: PositionConfig[] = [
    {
        value: 'P1_RIGHT_BACK' as PlayerPosition,
        label: 'Right Back (P1)',
        color: '#FF5722',
        icon: VolleyballIcon,
        order: 1
    },
    {
        value: 'P2_RIGHT_FRONT' as PlayerPosition,
        label: 'Right Front (P2)',
        color: '#2196F3',
        icon: VolleyballIcon,
        order: 2
    },
    {
        value: 'P3_MIDDLE_FRONT' as PlayerPosition,
        label: 'Middle Front (P3)',
        color: '#4CAF50',
        icon: VolleyballIcon,
        order: 3
    },
    {
        value: 'P4_LEFT_FRONT' as PlayerPosition,
        label: 'Left Front (P4)',
        color: '#9C27B0',
        icon: VolleyballIcon,
        order: 4
    },
    {
        value: 'P5_LEFT_BACK' as PlayerPosition,
        label: 'Left Back (P5)',
        color: '#FFC107',
        icon: VolleyballIcon,
        order: 5
    },
    {
        value: 'P6_MIDDLE_BACK' as PlayerPosition,
        label: 'Middle Back (P6)',
        color: '#607D8B',
        icon: VolleyballIcon,
        order: 6
    }
];

export const SKILL_LEVELS: SkillConfig[] = [
    {
        value: 'RECREATIONAL_C',
        label: 'Recreational',
        color: '#4CAF50',
        icon: VolleyballIcon,
        order: 1
    },
    {
        value: 'INTERMEDIATE_B',
        label: 'Intermediate',
        color: '#2196F3',
        icon: VolleyballIcon,
        order: 2
    },
    {
        value: 'UPPER_INTERMEDIATE_BB',
        label: 'Upper Intermediate',
        color: '#FFC107',
        icon: VolleyballIcon,
        order: 3
    },
    {
        value: 'COMPETITIVE_A',
        label: 'Competitive',
        color: '#FF5722',
        icon: VolleyballIcon,
        order: 4
    }
];

export const CATEGORY_LABELS: CategoryConfig[] = [
    {
        value: 'LEVEL_1',
        label: 'Marque',
        color: '#FF5722',
        icon: VolleyballIcon,
        order: 1
    },
    {
        value: 'LEVEL_2',
        label: 'Capped',
        color: '#2196F3',
        icon: VolleyballIcon,
        order: 2
    },
    {
        value: 'LEVEL_3',
        label: 'UnCapped',
        color: '#4CAF50',
        icon: VolleyballIcon,
        order: 3
    }
];

export const DASHBOARD_TABS = [
    {
        label: 'Current Squad',
        icon: GroupIcon,
        value: 0
    },
    {
        label: 'Preferred Players',
        icon: StarIcon,
        value: 1
    },
    {
        label: 'Team Requirements',
        icon: VolleyballIcon,
        value: 2
    }
] as const;

export const INITIAL_FILTER_STATE: FilterState = {
    position: '',
    skillLevel: '',
    searchQuery: '',
    minPrice: '',
    maxPrice: ''
};

export const INITIAL_SORT_STATE: SortState = {
    field: 'name',
    direction: 'asc'
}; 