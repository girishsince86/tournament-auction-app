import { useState, useEffect } from 'react';
import type { PlayerWithPreference } from '../types/player';
import type { CategoryRequirement } from '../types/category';
import type { PlayerPosition, SkillLevel } from '@/types/database';
import { POSITIONS, SKILL_LEVELS } from '@/lib/constants';

interface CountData {
    current: number;
    simulated: number;
    required: number;
}

export interface SimulationState {
    allocatedPlayers: PlayerWithPreference[];
    preferredPlayers: PlayerWithPreference[];
    totalPlayers: number;
    totalPoints: number;
    remainingBudget: number;
    initialBudget: number;
    simulatedBudget: number;
    currentPlayers: number;
    maxPlayers: number;
    positionCounts: {
        [key in PlayerPosition]?: CountData;
    };
    skillLevelCounts: {
        [key in SkillLevel]?: CountData;
    };
    categoryDistribution: {
        [key: string]: CountData;
    };
    budgetValid: boolean;
    positionRequirementsValid: boolean;
    skillRequirementsValid: boolean;
    categoryRequirementsValid: boolean;
    playerCountValid: boolean;
}

interface UseTeamSimulationProps {
    isPreAuction: boolean;
    allocatedPlayers: PlayerWithPreference[];
    preferredPlayers: PlayerWithPreference[];
    categoryRequirements: CategoryRequirement[];
    teamBudget: {
        initial_budget: number;
        remaining_budget: number;
        allocated_budget: number;
    };
    maxPlayers: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function useTeamSimulation({
    isPreAuction,
    allocatedPlayers,
    preferredPlayers,
    categoryRequirements,
    teamBudget,
    maxPlayers
}: UseTeamSimulationProps) {
    const [simulationState, setSimulationState] = useState<SimulationState>({
        allocatedPlayers: [],
        preferredPlayers: [],
        totalPlayers: 0,
        totalPoints: 0,
        remainingBudget: 0,
        initialBudget: 0,
        simulatedBudget: 0,
        currentPlayers: 0,
        maxPlayers: 0,
        positionCounts: {},
        skillLevelCounts: {},
        categoryDistribution: {},
        budgetValid: true,
        positionRequirementsValid: true,
        skillRequirementsValid: true,
        categoryRequirementsValid: true,
        playerCountValid: true
    });

    useEffect(() => {
        // Calculate total points and players
        const totalPoints = allocatedPlayers.reduce(
            (sum, player) => sum + (player.base_price || 0),
            0
        ) + preferredPlayers.reduce(
            (sum, player) => sum + (player.preference?.max_bid || player.base_price || 0),
            0
        );

        // Initialize position counts
        const positionCounts: SimulationState['positionCounts'] = {};
        POSITIONS.forEach(pos => {
            positionCounts[pos.value] = {
                current: allocatedPlayers.filter(p => p.player_position === pos.value).length,
                simulated: preferredPlayers.filter(p => p.player_position === pos.value).length,
                required: 0 // Requirements will be set based on tournament rules
            };
        });

        // Initialize skill level counts
        const skillLevelCounts: SimulationState['skillLevelCounts'] = {};
        SKILL_LEVELS.forEach(skill => {
            skillLevelCounts[skill.value] = {
                current: allocatedPlayers.filter(p => p.skill_level === skill.value).length,
                simulated: preferredPlayers.filter(p => p.skill_level === skill.value).length,
                required: 0 // Requirements will be set based on tournament rules
            };
        });

        // Calculate category distribution
        const categoryDistribution: { [key: string]: CountData } = {};
        
        // Initialize categories from requirements
        categoryRequirements.forEach(req => {
            categoryDistribution[req.category_type] = {
                current: allocatedPlayers.filter(p => p.category?.category_type === req.category_type).length,
                simulated: preferredPlayers.filter(p => p.category?.category_type === req.category_type).length,
                required: req.min_players
            };
        });

        const simulatedBudget = preferredPlayers.reduce(
            (sum, player) => sum + (player.preference?.max_bid || player.base_price || 0),
            0
        );

        const currentPlayers = allocatedPlayers.length;
        const totalPlayers = currentPlayers + preferredPlayers.length;

        // Validate requirements
        const budgetValid = totalPoints <= teamBudget.initial_budget;
        const playerCountValid = totalPlayers <= maxPlayers;
        const categoryRequirementsValid = Object.values(categoryDistribution)
            .every(({ current, simulated, required }) => (current + simulated) >= required);
        const positionRequirementsValid = Object.values(positionCounts)
            .every(({ current, simulated, required }) => (current + simulated) >= required);
        const skillRequirementsValid = Object.values(skillLevelCounts)
            .every(({ current, simulated, required }) => (current + simulated) >= required);

        setSimulationState({
            allocatedPlayers,
            preferredPlayers,
            totalPlayers,
            totalPoints,
            remainingBudget: teamBudget.remaining_budget,
            initialBudget: teamBudget.initial_budget,
            simulatedBudget,
            currentPlayers,
            maxPlayers,
            positionCounts,
            skillLevelCounts,
            categoryDistribution,
            budgetValid,
            positionRequirementsValid,
            skillRequirementsValid,
            categoryRequirementsValid,
            playerCountValid
        });
    }, [allocatedPlayers, preferredPlayers, categoryRequirements, teamBudget, maxPlayers]);

    const validateSimulation = (): ValidationResult => {
        const errors: string[] = [];

        if (!simulationState.playerCountValid) {
            errors.push(`Team exceeds maximum player limit of ${maxPlayers}`);
        }

        if (!simulationState.budgetValid) {
            errors.push('Team exceeds budget limit');
        }

        if (!simulationState.categoryRequirementsValid) {
            Object.entries(simulationState.categoryDistribution).forEach(([category, data]) => {
                const total = data.current + data.simulated;
                if (total < data.required) {
                    errors.push(
                        `Need ${data.required - total} more ${category} player${data.required - total > 1 ? 's' : ''}`
                    );
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    return {
        simulationState,
        validateSimulation
    };
} 