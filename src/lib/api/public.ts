import { TeamOwnerProfile } from '@/types/team-owner';

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