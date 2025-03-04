import { TeamOwnerProfile } from '@/types/team-owner';
import { OrganizerProfile } from '@/types/organizer';
import { GroupStandingsView, MatchScheduleView, PublicTeamComposition } from '@/types/tournament-management';

/**
 * Fetches all team owner profiles for public display
 */
export async function getPublicTeamOwnerProfiles(): Promise<TeamOwnerProfile[]> {
  try {
    const response = await fetch('/api/public/team-owners', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch team owner profiles')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching public team owner profiles:', error)
    throw error
  }
}

/**
 * Fetches team owner profiles for a specific team
 */
export async function getPublicTeamOwnerProfilesByTeam(teamId: string): Promise<TeamOwnerProfile[]> {
  try {
    const response = await fetch(`/api/public/team-owners?teamId=${teamId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch team owner profiles');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching public team owner profiles:', error);
    return [];
  }
}

/**
 * Fetches a single public team owner profile by ID
 * @param id The ID of the team owner profile to fetch
 * @returns The team owner profile
 */
export async function getPublicTeamOwnerProfileById(id: string): Promise<TeamOwnerProfile> {
  try {
    const response = await fetch(`/api/public/team-owners/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch team owner profile')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching public team owner profile:', error)
    throw error
  }
}

/**
 * Fetches all organizer profiles for public display
 */
export async function getPublicOrganizerProfiles(): Promise<OrganizerProfile[]> {
  try {
    const response = await fetch('/api/public/organizers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch organizer profiles')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching public organizer profiles:', error)
    throw error
  }
}

/**
 * Fetches team compositions for public display
 * @param formatType Optional filter by format type (VOLLEYBALL or THROWBALL)
 * @param formatId Optional filter by specific format ID
 * @param tournamentId Optional tournament ID (defaults to current tournament)
 * @returns Array of team compositions
 */
export async function getPublicTeamCompositions(
  formatType?: string,
  formatId?: string,
  tournamentId?: string
): Promise<PublicTeamComposition[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (formatType) params.append('formatType', formatType);
    if (formatId) params.append('formatId', formatId);
    if (tournamentId) params.append('tournamentId', tournamentId);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await fetch(`/api/public/team-compositions${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team compositions');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching public team compositions:', error);
    throw error;
  }
}

/**
 * Interface for tournament group data returned from the API
 */
export interface TournamentGroupData {
  id: string;
  name: string;
  description: string | null;
  tournament: {
    id: string;
    name: string;
  };
  format: {
    id: string;
    name: string;
    format_type: string;
  };
  standings: GroupStandingsView[];
  matches: MatchScheduleView[];
}

/**
 * Fetches tournament groups with standings and matches
 * @param tournamentId Tournament ID to fetch groups for (required)
 * @param formatId Optional filter by specific format ID
 * @param formatType Optional filter by format type (VOLLEYBALL or THROWBALL)
 * @param groupId Optional filter for a specific group
 * @returns Array of tournament groups with standings and matches
 */
export async function getPublicTournamentGroups(
  tournamentId: string,
  formatId?: string,
  formatType?: string,
  groupId?: string
): Promise<TournamentGroupData[]> {
  try {
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('tournamentId', tournamentId);
    if (formatId) params.append('formatId', formatId);
    if (formatType) params.append('formatType', formatType);
    if (groupId) params.append('groupId', groupId);
    
    const queryString = `?${params.toString()}`;
    
    const response = await fetch(`/api/public/tournament-groups${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tournament groups');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching public tournament groups:', error);
    throw error;
  }
} 