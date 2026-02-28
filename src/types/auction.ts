import type {
    Player,
    AuctionQueue,
    AuctionRound,
    AuctionDisplayConfig,
    TeamCombinedRequirement,
    Team,
    PlayerPosition,
    SkillLevel,
    AuctionStatus
} from './database';

// Extended types for UI components
export interface PlayerProfile extends Player {
    tournament_history: Array<{
        name: string;
        year: number;
        role: string;
    }>;
    achievements: Array<{
        title: string;
        description: string;
        year: number;
    }>;
}

export interface TimerState {
    currentTime: number;
    phase: 'initial' | 'subsequent' | 'firstCall' | 'secondCall' | 'finalCall' | 'complete';
    isRunning: boolean;
}

export interface QueueItemWithPlayer extends AuctionQueue {
    player: PlayerProfile;
}

export interface AuctionDisplayState {
    currentPlayer: PlayerProfile | null;
    timerState: TimerState;
    queue: QueueItemWithPlayer[];
}

export interface TeamRequirementBase {
    id: string;
    team_id: string;
    min_players: number;
    max_players: number;
    current_count: number;
    points_allocated: number;
}

export interface PositionRequirement extends TeamRequirementBase {
    position: PlayerPosition;
}

export interface SkillRequirement extends TeamRequirementBase {
    skill_level: SkillLevel;
}

export interface TeamWithStats extends Team {
    total_points: number;
    current_players: number;
}

// Auction Display Configuration
export interface DisplayConfig extends AuctionDisplayConfig {
    automatedCalls: {
        firstCall: number;
        secondCall: number;
        finalCall: number;
    };
}

// Auction Round with Relations
export interface AuctionRoundWithRelations extends AuctionRound {
    player: PlayerProfile;
    winning_team?: Team;
    bids: Array<{
        id: string;
        team_id: string;
        amount: number;
        team: Team;
    }>;
}

export interface TimerConfig {
    initialCountdown: number;
    subsequentBidTimer: number;
    automatedCalls: {
        firstCall: number;
        secondCall: number;
        finalCall: number;
    };
    visualIndicators: boolean;
    soundEnabled: boolean;
}

// Realtime event types
export type AuctionEventType = 'queue_change' | 'round_change' | 'team_change' | 'player_change' | 'reconnect';

export interface AuctionEvent {
    type: AuctionEventType;
    timestamp: number;
    payload?: Record<string, unknown>;
}

export interface AuctionRealtimeCallbacks {
    onQueueChange: () => void;
    onRoundChange: (payload: Record<string, unknown>) => void;
    onTeamChange: (teamId: string) => void;
    onPlayerChange: (playerId: string) => void;
}

export interface AuctionLiveState {
    teams: TeamWithStats[];
    queue: QueueItemWithPlayer[];
    availablePlayers: PlayerProfile[];
    isConnected: boolean;
    lastEvent: AuctionEvent | null;
} 