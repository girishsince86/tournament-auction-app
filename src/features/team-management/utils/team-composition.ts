import type { TeamCompositionStatus, PlayerCategoryRequirement } from '@/types/team-management';
import type { DatabaseTeam } from '@/features/team-management/types/database';
import type { PlayerCategory } from '@/features/team-management/types/player';

// Update the PlayerWithCategory type to include preference and phone_number
export interface PlayerWithCategory {
    id: string;
    name: string;
    player_position: DatabaseTeam['players'][0]['player']['player_position'];
    skill_level: DatabaseTeam['players'][0]['player']['skill_level'];
    base_price: number;
    profile_image_url: string | null;
    phone_number?: string | null;  // Allow both undefined and null
    status: DatabaseTeam['players'][0]['player']['status'];
    category: PlayerCategory | null;
    preference?: {
        max_bid: number;
        notes?: string;
    };
    is_preferred?: boolean;
}

export interface TeamCompositionAnalysis {
    current_squad: TeamCompositionStatus;
    with_preferred: TeamCompositionStatus;
}

export function calculateTeamCompositionStatus(
    currentPlayers: PlayerWithCategory[],
    preferredPlayers: PlayerWithCategory[] = [],
    minPlayers: number = 8,
    maxPlayers: number = 10
): TeamCompositionAnalysis {
    // Debug logging
    console.log('calculateTeamCompositionStatus input:', {
        currentPlayers: currentPlayers.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category?.category_type
        })),
        preferredPlayers: preferredPlayers.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category?.category_type,
            max_bid: p.preference?.max_bid
        })),
        minPlayers,
        maxPlayers
    });

    // Function to count players by category
    const countPlayersByCategory = (players: PlayerWithCategory[]) => {
        const counts = {
            MARQUEE: 0,
            CAPPED: 0,
            UNCAPPED: 0
        };

        players.forEach(player => {
            const categoryType = player.category?.category_type;
            if (categoryType) {
                // Map database category types to UI category types
                if (categoryType === 'LEVEL_1') {
                    counts.MARQUEE++;
                } else if (categoryType === 'LEVEL_2') {
                    counts.CAPPED++;
                } else if (categoryType === 'LEVEL_3') {
                    counts.UNCAPPED++;
                }
            }
        });

        console.log('Category counts for players:', {
            players: players.map(p => p.name),
            counts
        });

        return counts;
    };

    // Function to create category requirements array
    const createCategoryRequirements = (counts: Record<string, number>): PlayerCategoryRequirement[] => {
        return [
            {
                category_type: 'MARQUEE',
                min_players: 1,
                current_count: counts.MARQUEE
            },
            {
                category_type: 'CAPPED',
                min_players: 2,
                current_count: counts.CAPPED
            },
            {
                category_type: 'UNCAPPED',
                min_players: 3,
                current_count: counts.UNCAPPED
            }
        ];
    };

    // Function to check if requirements are met
    const checkValidity = (
        totalPlayers: number,
        categoryRequirements: PlayerCategoryRequirement[]
    ): boolean => {
        const valid = totalPlayers >= minPlayers &&
            totalPlayers <= maxPlayers &&
            categoryRequirements.every(req => req.current_count >= req.min_players);
        
        console.log('Validity check:', {
            totalPlayers,
            minPlayers,
            maxPlayers,
            categoryRequirements,
            valid
        });
        
        return valid;
    };

    // Calculate current squad status
    const currentCounts = countPlayersByCategory(currentPlayers);
    const currentRequirements = createCategoryRequirements(currentCounts);
    const currentTotal = currentPlayers.length;
    const currentValid = checkValidity(currentTotal, currentRequirements);

    console.log('Current squad status:', {
        currentCounts,
        currentTotal,
        currentValid
    });

    // Calculate status with preferred players only (not combining with current squad)
    // This is for pre-auction simulation where we don't consider allocated players
    const preferredCounts = countPlayersByCategory(preferredPlayers);
    const preferredRequirements = createCategoryRequirements(preferredCounts);
    const preferredTotal = preferredPlayers.length;
    const preferredValid = checkValidity(preferredTotal, preferredRequirements);

    console.log('Preferred players only status:', {
        preferredCounts,
        preferredTotal,
        preferredValid
    });

    return {
        current_squad: {
            total_players: currentTotal,
            min_players: minPlayers,
            max_players: maxPlayers,
            category_requirements: currentRequirements,
            is_valid: currentValid
        },
        with_preferred: {
            total_players: preferredTotal,
            min_players: minPlayers,
            max_players: maxPlayers,
            category_requirements: preferredRequirements,
            is_valid: preferredValid
        }
    };
} 