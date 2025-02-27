import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';

// Re-export all constants from constants/index.ts
export * from './constants/index';

// Original constants in this file
export const DASHBOARD_TABS = [
    {
        label: 'Current Squad',
        value: 0,
        icon: GroupIcon
    },
    {
        label: 'Preferred Players',
        value: 1,
        icon: StarIcon
    }
]; 