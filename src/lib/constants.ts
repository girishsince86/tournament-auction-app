import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PlayerPosition, SkillLevel } from '@/types/database';

// Position constants with icons and colors
export const POSITIONS = [
    { 
        value: 'SETTER' as PlayerPosition,
        label: 'Setter',
        color: '#FF6B6B',
        icon: <SportsVolleyballIcon />
    },
    { 
        value: 'OUTSIDE_HITTER' as PlayerPosition,
        label: 'Outside Hitter',
        color: '#4ECDC4',
        icon: <SportsVolleyballIcon />
    },
    { 
        value: 'MIDDLE_BLOCKER' as PlayerPosition,
        label: 'Middle Blocker',
        color: '#45B7D1',
        icon: <SportsVolleyballIcon />
    },
    { 
        value: 'OPPOSITE' as PlayerPosition,
        label: 'Opposite',
        color: '#96CEB4',
        icon: <SportsVolleyballIcon />
    },
    { 
        value: 'LIBERO' as PlayerPosition,
        label: 'Libero',
        color: '#D4A5A5',
        icon: <SportsVolleyballIcon />
    }
] as const;

// Skill level constants with colors
export const SKILL_LEVELS = [
    { 
        value: 'COMPETITIVE_A' as SkillLevel,
        label: 'Competitive A',
        color: '#2ECC71',
        icon: <EmojiEventsIcon />
    },
    { 
        value: 'COMPETITIVE_B' as SkillLevel,
        label: 'Competitive B',
        color: '#3498DB',
        icon: <EmojiEventsIcon />
    },
    { 
        value: 'COMPETITIVE_C' as SkillLevel,
        label: 'Competitive C',
        color: '#F1C40F',
        icon: <EmojiEventsIcon />
    },
    { 
        value: 'RECREATIONAL' as SkillLevel,
        label: 'Recreational',
        color: '#95A5A6',
        icon: <EmojiEventsIcon />
    }
] as const; 