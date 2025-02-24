'use client';

import { useAuctionTimer } from '@/hooks/useAuctionTimer';
import { TimerConfig } from '@/types/auction';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

interface TimerProps {
    config: TimerConfig;
    onPhaseChange?: (phase: string) => void;
    onComplete?: () => void;
    className?: string;
}

export interface TimerHandle {
    reset: () => void;
    start: () => void;
    pause: () => void;
    resetForNextBid: () => void;
    skipToNextPhase: () => void;
}

export const Timer = forwardRef<TimerHandle, TimerProps>(function Timer(
    { config, onPhaseChange, onComplete, className = '' },
    ref
) {
    const {
        currentTime,
        phase,
        isRunning,
        start,
        pause,
        reset,
        resetForNextBid,
        skipToNextPhase
    } = useAuctionTimer({
        config,
        onPhaseChange,
        onComplete
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        reset,
        start,
        pause,
        resetForNextBid,
        skipToNextPhase
    }));

    // Auto-start timer when resetting for next bid
    useEffect(() => {
        if (phase === 'subsequent' && !isRunning) {
            start();
        }
    }, [phase, isRunning, start]);

    // Phase-specific styling
    const getPhaseColor = () => {
        switch (phase) {
            case 'firstCall':
                return 'warning.main';
            case 'secondCall':
                return 'warning.dark';
            case 'finalCall':
                return 'error.main';
            default:
                return 'primary.main';
        }
    };

    // Phase display text
    const getPhaseDisplay = () => {
        switch (phase) {
            case 'initial':
                return 'Initial Bid';
            case 'subsequent':
                return 'Bidding';
            case 'firstCall':
                return 'Going Once';
            case 'secondCall':
                return 'Going Twice';
            case 'finalCall':
                return 'Final Call';
            case 'complete':
                return 'Sold!';
            default:
                return '';
        }
    };

    return (
        <Box className={className}>
            {/* Timer Display */}
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
                    border: '2px solid',
                    borderColor: getPhaseColor
                }}
            >
                <Typography 
                    variant="h1" 
                    component="div"
                    sx={{ 
                        fontSize: '6rem',
                        fontWeight: 'bold',
                        color: getPhaseColor,
                        mb: 1,
                        fontFamily: 'monospace'
                    }}
                >
                    {currentTime}
                </Typography>

                <Typography 
                    variant="h4" 
                    component="div"
                    sx={{ 
                        fontWeight: 'medium',
                        color: getPhaseColor,
                        mb: 3
                    }}
                >
                    {getPhaseDisplay()}
                </Typography>

                {/* Controls */}
                <Stack direction="row" spacing={2} justifyContent="center">
                    {!isRunning && phase !== 'complete' ? (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={start}
                            size="large"
                        >
                            Start
                        </Button>
                    ) : phase !== 'complete' && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={pause}
                            size="large"
                        >
                            Pause
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            reset();
                            start();
                        }}
                        size="large"
                    >
                        Reset Initial
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            resetForNextBid();
                            start();
                        }}
                        size="large"
                    >
                        New Bid (20s)
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={skipToNextPhase}
                        size="large"
                    >
                        Next Phase
                    </Button>
                </Stack>
            </Box>

            {/* Current Settings Display */}
            <Typography 
                variant="caption" 
                component="div" 
                align="center"
                sx={{ 
                    mt: 2,
                    color: 'text.secondary'
                }}
            >
                {phase === 'initial' && `Initial Bid: ${config.initialCountdown}s`}
                {phase === 'subsequent' && `Subsequent Bid: ${config.subsequentBidTimer}s`}
                {phase === 'firstCall' && `First Call: ${config.automatedCalls.firstCall}s`}
                {phase === 'secondCall' && `Second Call: ${config.automatedCalls.secondCall}s`}
                {phase === 'finalCall' && `Final Call: ${config.automatedCalls.finalCall}s`}
            </Typography>
        </Box>
    );
}); 