import React, { ReactElement } from 'react';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PlayerPosition, SkillLevel } from '@/types/database';

interface PositionConfig {
    value: PlayerPosition;
    label: string;
    color: string;
    icon: ReactElement;
}

interface SkillLevelConfig {
    value: SkillLevel;
    label: string;
    color: string;
    icon: ReactElement;
}

// Position constants with icons and colors
export const POSITIONS: PositionConfig[] = [
    { 
        value: 'SETTER',
        label: 'Setter',
        color: '#FF6B6B',
        icon: React.createElement(SportsVolleyballIcon)
    },
    { 
        value: 'OUTSIDE_HITTER',
        label: 'Outside Hitter',
        color: '#4ECDC4',
        icon: React.createElement(SportsVolleyballIcon)
    },
    { 
        value: 'MIDDLE_BLOCKER',
        label: 'Middle Blocker',
        color: '#45B7D1',
        icon: React.createElement(SportsVolleyballIcon)
    },
    { 
        value: 'OPPOSITE',
        label: 'Opposite',
        color: '#96CEB4',
        icon: React.createElement(SportsVolleyballIcon)
    },
    { 
        value: 'LIBERO',
        label: 'Libero',
        color: '#D4A5A5',
        icon: React.createElement(SportsVolleyballIcon)
    }
];

// Skill level constants with colors
export const SKILL_LEVELS: SkillLevelConfig[] = [
    { 
        value: 'COMPETITIVE_A',
        label: 'Competitive A',
        color: '#2ECC71',
        icon: React.createElement(EmojiEventsIcon)
    },
    { 
        value: 'COMPETITIVE_B',
        label: 'Competitive B',
        color: '#3498DB',
        icon: React.createElement(EmojiEventsIcon)
    },
    { 
        value: 'COMPETITIVE_C',
        label: 'Competitive C',
        color: '#F1C40F',
        icon: React.createElement(EmojiEventsIcon)
    },
    { 
        value: 'RECREATIONAL',
        label: 'Recreational',
        color: '#95A5A6',
        icon: React.createElement(EmojiEventsIcon)
    }
]; 