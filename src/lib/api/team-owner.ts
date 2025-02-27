import { TeamOwnerProfile, TeamOwnerUpdateRequest, TeamNameUpdateRequest, ApiResponse } from '@/types/team-owner';

/**
 * Fetches the team owner profile for the current user
 */
export async function getTeamOwnerProfile(): Promise<ApiResponse<TeamOwnerProfile>> {
  try {
    const response = await fetch('/api/team-management/owner-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Profile fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error
      });
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
}

/**
 * Creates a new team owner profile
 */
export async function createTeamOwnerProfile(data: TeamOwnerUpdateRequest): Promise<ApiResponse<TeamOwnerProfile>> {
  const response = await fetch('/api/team-management/owner-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create profile');
  }

  return result;
}

/**
 * Updates an existing team owner profile
 */
export async function updateTeamOwnerProfile(data: TeamOwnerUpdateRequest): Promise<ApiResponse<TeamOwnerProfile>> {
  const response = await fetch('/api/team-management/owner-profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update profile');
  }

  return result;
}

/**
 * Updates a team's name
 */
export async function updateTeamName(teamId: string, data: TeamNameUpdateRequest): Promise<ApiResponse<{ name: string }>> {
  const response = await fetch(`/api/teams/${teamId}/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update team name');
  }

  return result;
}

/**
 * Uploads a profile image
 */
export async function uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; path: string }>> {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `profile-images/${fileName}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('filePath', filePath);

  const response = await fetch('/api/team-management/upload-image', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to upload image');
  }

  return result;
}

/**
 * Deletes a profile image
 */
export async function deleteProfileImage(imageUrl: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await fetch('/api/team-management/upload-image', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete image');
  }

  return result;
} 