import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerConfig } from '@/types/auction';

type TimerPhase = 'initial' | 'subsequent' | 'firstCall' | 'secondCall' | 'finalCall' | 'complete';

interface TimerState {
    currentTime: number;
    phase: TimerPhase;
    isRunning: boolean;
}

interface UseAuctionTimerProps {
    config: TimerConfig;
    onPhaseChange?: (phase: TimerPhase) => void;
    onComplete?: () => void;
}

interface SoundEffects {
    timerBeep: HTMLAudioElement;
    phaseChange: HTMLAudioElement;
    finalCall: HTMLAudioElement;
    complete: HTMLAudioElement;
}

export function useAuctionTimer({ config, onPhaseChange, onComplete }: UseAuctionTimerProps) {
    const [state, setState] = useState<TimerState>({
        currentTime: config.initialCountdown,
        phase: 'initial',
        isRunning: false
    });

    const timerRef = useRef<NodeJS.Timeout>();
    const soundsRef = useRef<SoundEffects>();

    // Initialize audio if enabled
    useEffect(() => {
        if (config.soundEnabled && typeof window !== 'undefined') {
            soundsRef.current = {
                timerBeep: new Audio('/sounds/timer-beep.wav'),
                phaseChange: new Audio('/sounds/phase-change.wav'),
                finalCall: new Audio('/sounds/final-call.wav'),
                complete: new Audio('/sounds/complete.wav')
            };
        }
    }, [config.soundEnabled]);

    const playSound = useCallback((type: keyof SoundEffects = 'timerBeep') => {
        if (config.soundEnabled && soundsRef.current) {
            // Stop any playing sounds first
            Object.values(soundsRef.current).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            
            // Play the requested sound
            soundsRef.current[type].play().catch(console.error);
        }
    }, [config.soundEnabled]);

    const getNextPhase = useCallback((currentPhase: TimerPhase, timeRemaining: number): TimerPhase => {
        switch (currentPhase) {
            case 'initial':
                return timeRemaining <= 0 ? 'subsequent' : 'initial';
            case 'subsequent':
                return timeRemaining <= config.automatedCalls.firstCall ? 'firstCall' : 'subsequent';
            case 'firstCall':
                return timeRemaining <= config.automatedCalls.secondCall ? 'secondCall' : 'firstCall';
            case 'secondCall':
                return timeRemaining <= config.automatedCalls.finalCall ? 'finalCall' : 'secondCall';
            case 'finalCall':
                return timeRemaining <= 0 ? 'complete' : 'finalCall';
            default:
                return 'complete';
        }
    }, [config.automatedCalls]);

    const getInitialTime = useCallback((phase: TimerPhase): number => {
        switch (phase) {
            case 'initial':
                return config.initialCountdown;
            case 'subsequent':
                return config.subsequentBidTimer;
            case 'firstCall':
                return config.automatedCalls.firstCall;
            case 'secondCall':
                return config.automatedCalls.secondCall;
            case 'finalCall':
                return config.automatedCalls.finalCall;
            default:
                return 0;
        }
    }, [config]);

    const tick = useCallback(() => {
        setState(prevState => {
            if (!prevState.isRunning) return prevState;

            const newTime = prevState.currentTime - 1;
            const nextPhase = getNextPhase(prevState.phase, newTime);

            // Play appropriate sounds
            if (nextPhase !== prevState.phase) {
                if (nextPhase === 'complete') {
                    playSound('complete');
                } else if (nextPhase === 'finalCall') {
                    playSound('finalCall');
                } else {
                    playSound('phaseChange');
                }
            } else if (newTime <= 3 && newTime > 0) {
                playSound('timerBeep');
            }

            // If phase changed, notify callback
            if (nextPhase !== prevState.phase) {
                onPhaseChange?.(nextPhase);
                
                // If completed, notify callback
                if (nextPhase === 'complete') {
                    onComplete?.();
                }

                // Return new state with new phase and its initial time
                return {
                    currentTime: getInitialTime(nextPhase),
                    phase: nextPhase,
                    isRunning: nextPhase !== 'complete'
                };
            }

            // Just update time if no phase change
            return {
                ...prevState,
                currentTime: newTime
            };
        });
    }, [getNextPhase, getInitialTime, onPhaseChange, onComplete, playSound]);

    // Start the timer
    const start = useCallback(() => {
        setState(prev => ({ ...prev, isRunning: true }));
        playSound('phaseChange');
    }, [playSound]);

    // Pause the timer
    const pause = useCallback(() => {
        setState(prev => ({ ...prev, isRunning: false }));
        playSound('timerBeep');
    }, [playSound]);

    // Reset the timer
    const reset = useCallback(() => {
        setState({
            currentTime: config.initialCountdown,
            phase: 'initial',
            isRunning: false
        });
        playSound('phaseChange');
    }, [config.initialCountdown, playSound]);

    // Reset for next bid
    const resetForNextBid = useCallback(() => {
        setState({
            currentTime: config.subsequentBidTimer,
            phase: 'subsequent',
            isRunning: false
        });
        playSound('phaseChange');
    }, [config.subsequentBidTimer, playSound]);

    // Skip to next phase
    const skipToNextPhase = useCallback(() => {
        setState(prevState => {
            const nextPhase = getNextPhase(prevState.phase, 0);
            playSound(nextPhase === 'complete' ? 'complete' : 'phaseChange');
            return {
                currentTime: getInitialTime(nextPhase),
                phase: nextPhase,
                isRunning: nextPhase !== 'complete'
            };
        });
    }, [getNextPhase, getInitialTime, playSound]);

    // Timer interval effect
    useEffect(() => {
        if (state.isRunning) {
            timerRef.current = setInterval(tick, 1000);
            return () => clearInterval(timerRef.current);
        }
        return () => {};
    }, [state.isRunning, tick]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return {
        currentTime: state.currentTime,
        phase: state.phase,
        isRunning: state.isRunning,
        start,
        pause,
        reset,
        resetForNextBid,
        skipToNextPhase
    };
} 