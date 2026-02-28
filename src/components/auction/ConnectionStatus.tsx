'use client';

import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ConnectionStatusProps {
    isConnected: boolean;
    connectionError: string | null;
    onRefresh: () => void;
}

export function ConnectionStatus({ isConnected, connectionError, onRefresh }: ConnectionStatusProps) {
    const color = isConnected ? '#4caf50' : connectionError ? '#f44336' : '#ff9800';
    const label = isConnected ? 'Live' : connectionError ? 'Disconnected' : 'Reconnecting...';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: color,
                    boxShadow: isConnected ? `0 0 6px ${color}` : 'none',
                    animation: !isConnected && !connectionError ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                    },
                }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {label}
            </Typography>
            {!isConnected && (
                <Tooltip title="Refresh all data">
                    <IconButton size="small" onClick={onRefresh} sx={{ p: 0.5 }}>
                        <RefreshIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}
