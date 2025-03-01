import type { TeamCompositionStatus, PlayerCategoryRequirement } from '@/types/team-management';
import type { DatabaseTeam } from '@/features/team-management/types/database';

// Update the PlayerWithCategory type to include preference
type PlayerWithCategory = DatabaseTeam['players'][0]['player'] & {
    preference?: {
        max_bid: number;
        notes?: string;
    };
};

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
            const category = player.category?.category_type;
            if (category && category in counts) {
                counts[category as keyof typeof counts]++;
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

    // Calculate status with preferred players
    // Combine current and preferred players, avoiding duplicates by ID
    const allPlayers = [...currentPlayers];
    
    // Add preferred players that aren't already in the current squad
    preferredPlayers.forEach(preferred => {
        if (!allPlayers.some(current => current.id === preferred.id)) {
            // Make sure we're passing the preference data
            allPlayers.push({
                ...preferred,
                preference: preferred.preference
            });
        }
    });

    console.log('Combined players:', {
        totalCount: allPlayers.length,
        players: allPlayers.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category?.category_type,
            max_bid: p.preference?.max_bid
        }))
    });

    const withPreferredCounts = countPlayersByCategory(allPlayers);
    const withPreferredRequirements = createCategoryRequirements(withPreferredCounts);
    const withPreferredTotal = allPlayers.length;
    const withPreferredValid = checkValidity(withPreferredTotal, withPreferredRequirements);

    console.log('With preferred status:', {
        withPreferredCounts,
        withPreferredTotal,
        withPreferredValid
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
            total_players: withPreferredTotal,
            min_players: minPlayers,
            max_players: maxPlayers,
            category_requirements: withPreferredRequirements,
            is_valid: withPreferredValid
        }
    };
} 