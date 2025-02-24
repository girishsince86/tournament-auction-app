import { useMemo, useCallback } from 'react';
import type { 
    PlayerWithPreference, 
    TeamBudgetDetails, 
    TeamCombinedRequirement,
    CategoryRequirement 
} from '../types';
import type { PlayerPosition, SkillLevel, CategoryType } from '@/types/database';

export interface SimulationState {
    // Budget tracking
    initialBudget: number;
    remainingBudget: number;
    allocatedBudget: number;
    simulatedBudget: number;

    // Player counts
    currentPlayers: number;
    maxPlayers: number;
    
    // Requirements tracking
    positionCounts: Record<PlayerPosition, {
        current: number;
        simulated: number;
        required: number;
    }>;
    skillLevelCounts: Record<SkillLevel, {
        current: number;
        simulated: number;
        required: number;
    }>;
    categoryDistribution: Record<CategoryType, {
        current: number;
        simulated: number;
        required: number;
    }>;

    // Validation results
    budgetValid: boolean;
    positionRequirementsValid: boolean;
    skillRequirementsValid: boolean;
    categoryRequirementsValid: boolean;
    playerCountValid: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface UseTeamSimulationProps {
    isPreAuction: boolean;
    allocatedPlayers: PlayerWithPreference[];
    preferredPlayers: PlayerWithPreference[];
    teamRequirements: TeamCombinedRequirement[];
    categoryRequirements: CategoryRequirement[];
    teamBudget: TeamBudgetDetails;
    maxPlayers: number;
}

// Constants for valid values
const VALID_POSITIONS = [
    'P1_RIGHT_BACK',
    'P2_RIGHT_FRONT',
    'P3_MIDDLE_FRONT',
    'P4_LEFT_FRONT',
    'P5_LEFT_BACK',
    'P6_MIDDLE_BACK'
] as const;

const VALID_SKILL_LEVELS = [
    'RECREATIONAL_C',
    'INTERMEDIATE_B',
    'UPPER_INTERMEDIATE_BB',
    'COMPETITIVE_A'
] as const;

const VALID_CATEGORIES = [
    'LEVEL_1',
    'LEVEL_2',
    'LEVEL_3'
] as const;

// Initialize default counts object
const initializeCountObject = <T extends string>(keys: readonly T[]) => {
    const obj: Record<T, { current: number; simulated: number; required: number }> = {} as any;
    keys.forEach(key => {
        obj[key] = { current: 0, simulated: 0, required: 0 };
    });
    return obj;
};

// Initialize category counts object
const initializeCategoryObject = <T extends string>(keys: readonly T[]) => {
    const obj: Record<T, { 
        current: number; 
        simulated: number; 
        required: number;
    }> = {} as any;
    keys.forEach(key => {
        obj[key] = { 
            current: 0, 
            simulated: 0, 
            required: 0
        };
    });
    return obj;
};

// Initial counts objects
const DEFAULT_POSITION_COUNTS = initializeCountObject(VALID_POSITIONS);
const DEFAULT_SKILL_COUNTS = initializeCountObject(VALID_SKILL_LEVELS);
const DEFAULT_CATEGORY_COUNTS = initializeCategoryObject(VALID_CATEGORIES);

export function useTeamSimulation({
    isPreAuction,
    allocatedPlayers,
    preferredPlayers,
    teamRequirements,
    categoryRequirements,
    teamBudget,
    maxPlayers
}: UseTeamSimulationProps): {
    simulationState: SimulationState;
    validateSimulation: () => ValidationResult;
} {
    // Memoize budget calculations
    const simulatedBudget = useMemo(() => 
        preferredPlayers.reduce((sum, player) => 
            sum + (player.preference?.max_bid || player.base_price), 0),
        [preferredPlayers]
    );

    // Memoize counts calculation
    const { positionCounts, skillLevelCounts, categoryDistribution } = useMemo(() => {
        // Create fresh copies of the count objects
        const positionCounts = { ...DEFAULT_POSITION_COUNTS };
        const skillLevelCounts = { ...DEFAULT_SKILL_COUNTS };
        const categoryDistribution = { ...DEFAULT_CATEGORY_COUNTS };

        // Reset all counts to 0
        Object.keys(categoryDistribution).forEach(key => {
            categoryDistribution[key as CategoryType] = {
                current: 0,
                simulated: 0,
                required: 0
            };
        });

        // Set up category requirements
        categoryRequirements.forEach(req => {
            if (req.category_type in categoryDistribution) {
                categoryDistribution[req.category_type].required = req.min_players || 0;
            }
        });

        // Process allocated players (current team players)
        allocatedPlayers.forEach(player => {
            if (player.category?.category_type) {
                const categoryType = player.category.category_type;
                if (categoryType in categoryDistribution) {
                    categoryDistribution[categoryType].current++;
                }
            }
        });

        // Process preferred players (not yet on team)
        preferredPlayers.forEach(player => {
            // Only count if player is not already on the team
            if (!allocatedPlayers.some(p => p.id === player.id) && player.category?.category_type) {
                const categoryType = player.category.category_type;
                if (categoryType in categoryDistribution) {
                    categoryDistribution[categoryType].simulated++;
                }
            }
        });

        // Process position and skill level counts as before
        allocatedPlayers.forEach(player => {
            if (player.player_position in positionCounts) {
                positionCounts[player.player_position].current++;
            }
            if (player.skill_level && player.skill_level in skillLevelCounts) {
                skillLevelCounts[player.skill_level].current++;
            }
        });

        preferredPlayers.forEach(player => {
            if (player.player_position in positionCounts) {
                positionCounts[player.player_position].simulated++;
            }
            if (player.skill_level && player.skill_level in skillLevelCounts) {
                skillLevelCounts[player.skill_level].simulated++;
            }
        });

        // Process team requirements
        teamRequirements.forEach(req => {
            if (req.position in positionCounts) {
                positionCounts[req.position].required = req.min_players;
            }
            if (req.skill_level in skillLevelCounts) {
                skillLevelCounts[req.skill_level].required = req.min_players;
            }
        });

        return { positionCounts, skillLevelCounts, categoryDistribution };
    }, [allocatedPlayers, preferredPlayers, teamRequirements, categoryRequirements]);

    // Create the simulation state
    const simulationState: SimulationState = useMemo(() => {
        // Calculate validation results
        const totalBudget = teamBudget.allocated_budget + simulatedBudget;
        const budgetValid = totalBudget <= teamBudget.initial_budget;

        const totalPlayers = allocatedPlayers.length + preferredPlayers.length;
        const playerCountValid = totalPlayers <= maxPlayers;

        const positionRequirementsValid = Object.values(positionCounts)
            .every(count => (count.current + count.simulated) >= count.required);
            
        const skillRequirementsValid = Object.values(skillLevelCounts)
            .every(count => (count.current + count.simulated) >= count.required);

        const categoryRequirementsValid = Object.values(categoryDistribution)
            .every(category => {
                const total = category.current + category.simulated;
                const hasMinPlayers = total >= category.required;
                return hasMinPlayers;
            });

        return {
            initialBudget: teamBudget.initial_budget,
            remainingBudget: teamBudget.remaining_budget,
            allocatedBudget: teamBudget.allocated_budget,
            simulatedBudget,
            currentPlayers: allocatedPlayers.length,
            maxPlayers,
            positionCounts,
            skillLevelCounts,
            categoryDistribution,
            budgetValid,
            playerCountValid,
            positionRequirementsValid,
            skillRequirementsValid,
            categoryRequirementsValid
        };
    }, [
        teamBudget.initial_budget,
        teamBudget.remaining_budget,
        teamBudget.allocated_budget,
        simulatedBudget,
        allocatedPlayers.length,
        maxPlayers,
        positionCounts,
        skillLevelCounts,
        categoryDistribution
    ]);

    // Memoize validation function
    const validateSimulation = useCallback((): ValidationResult => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Budget validation
        if (!simulationState.budgetValid) {
            errors.push(`Total budget (₹${(simulationState.allocatedBudget + simulationState.simulatedBudget).toLocaleString()}) exceeds initial budget (₹${simulationState.initialBudget.toLocaleString()})`);
        }

        // Player count validation
        if (!simulationState.playerCountValid) {
            errors.push(`Total players (${simulationState.currentPlayers + preferredPlayers.length}) exceeds maximum allowed (${maxPlayers})`);
        }

        // Position requirements validation
        Object.entries(simulationState.positionCounts).forEach(([position, counts]) => {
            if (counts.required === 0) return; // Skip if no requirement
            const total = counts.current + counts.simulated;
            if (total < counts.required) {
                errors.push(`Need ${counts.required - total} more ${position.replace('_', ' ').toLowerCase()} player(s)`);
            }
        });

        // Skill level requirements validation
        Object.entries(simulationState.skillLevelCounts).forEach(([skill, counts]) => {
            if (counts.required === 0) return; // Skip if no requirement
            const total = counts.current + counts.simulated;
            if (total < counts.required) {
                errors.push(`Need ${counts.required - total} more ${skill.replace('_', ' ').toLowerCase()} player(s)`);
            }
        });

        // Category requirements validation - only check minimum players
        Object.entries(simulationState.categoryDistribution).forEach(([category, data]) => {
            const total = data.current + data.simulated;
            
            // Check minimum players requirement
            if (data.required > 0 && total < data.required) {
                errors.push(`Need ${data.required - total} more ${category.replace('_', ' ').toLowerCase()} player(s)`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }, [simulationState, preferredPlayers.length, maxPlayers]);

    return { simulationState, validateSimulation };
} 