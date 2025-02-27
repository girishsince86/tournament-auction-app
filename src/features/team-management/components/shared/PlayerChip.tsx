import { Chip, type ChipProps } from '@mui/material';
import type { PlayerPosition, SkillLevel } from '@/types/database';
import type { PositionConfig, SkillLevelConfig as SkillConfig } from '../../constants';
import { createElement } from 'react';

interface PlayerChipProps extends Omit<ChipProps, 'label' | 'icon'> {
    label: string;
    config: PositionConfig | SkillConfig;
    type: 'position' | 'skill';
}

export function PlayerChip({ label, config, type, sx, ...props }: PlayerChipProps) {
    return (
        <Chip
            icon={createElement(config.icon)}
            label={config.label || label}
            sx={{
                bgcolor: config.color,
                color: 'white',
                '& .MuiSvgIcon-root': {
                    color: 'white'
                },
                transition: 'transform 0.2s',
                minWidth: type === 'position' ? '150px' : '120px',
                ...sx
            }}
            {...props}
        />
    );
} 