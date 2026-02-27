import { useState, useCallback } from 'react';
import { TeamOwnerProfile, TeamOwnerUpdateRequest, TeamNameUpdateRequest, ApiResponse } from '@/types/team-owner';
import { 
  getTeamOwnerProfile, 
  createTeamOwnerProfile, 
  updateTeamOwnerProfile,
  updateTeamName,
  uploadProfileImage,
  deleteProfileImage
} from '@/lib/api/team-owner';
import { useToast } from '@/components/ui/use-toast';

export function useTeamOwnerProfile() {
  const [profile, setProfile] = useState<TeamOwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getTeamOwnerProfile();
      setProfile(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createProfile = useCallback(async (profileData: TeamOwnerUpdateRequest) => {
    try {
      setIsLoading(true);
      const response = await createTeamOwnerProfile(profileData);
      setProfile(response.data);
      toast({
        title: 'Success',
        description: 'Profile created successfully',
      });
      return response.data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (profileData: TeamOwnerUpdateRequest) => {
    try {
      setIsLoading(true);
      const response = await updateTeamOwnerProfile(profileData);
      setProfile(response.data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return response.data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleTeamNameUpdate = useCallback(async (teamId: string, updateData: TeamNameUpdateRequest) => {
    try {
      setIsLoading(true);
      await updateTeamName(teamId, updateData);
      await fetchProfile(); // Refresh profile to get updated team name
      toast({
        title: 'Success',
        description: 'Team name updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team name',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, toast]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      
      // Upload the image first
      const response = await uploadProfileImage(file);
      
      // If we have a current profile, update it
      if (profile) {
        // Create update request with all required fields
        const updateRequest: TeamOwnerUpdateRequest = {
          first_name: profile.first_name,
          last_name: profile.last_name,
          contact_email: profile.contact_email,
          bio: profile.bio,
          profile_image_url: response.data.imageUrl,
          // Optional fields
          sports_background: profile.sports_background,
          notable_achievements: profile.notable_achievements,
          team_role: profile.team_role,
          phone_number: profile.phone_number,
          social_media: profile.social_media
        };

        const updatedProfile = await updateTeamOwnerProfile(updateRequest);
        setProfile(updatedProfile.data);
      }

      toast({
        title: 'Success',
        description: 'Profile image uploaded successfully',
      });

      return response;
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload profile image',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);

  const handleImageDelete = useCallback(async (imageUrl: string) => {
    try {
      setIsLoading(true);

      // Delete the image first
      await deleteProfileImage(imageUrl);

      // If we have a profile, update it to remove the image URL
      if (profile) {
        // Create update request with all required fields
        const updateRequest: TeamOwnerUpdateRequest = {
          first_name: profile.first_name,
          last_name: profile.last_name,
          contact_email: profile.contact_email,
          bio: profile.bio,
          profile_image_url: undefined,
          // Optional fields
          sports_background: profile.sports_background,
          notable_achievements: profile.notable_achievements,
          team_role: profile.team_role,
          phone_number: profile.phone_number,
          social_media: profile.social_media
        };
        
        const updatedProfile = await updateTeamOwnerProfile(updateRequest);
        setProfile(updatedProfile.data);
      }
      
      toast({
        title: 'Success',
        description: 'Profile image deleted successfully',
      });
    } catch (error) {
      console.error('Image delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete profile image',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);

  return {
    profile,
    isLoading,
    fetchProfile,
    createProfile,
    updateProfile,
    handleTeamNameUpdate,
    handleImageUpload,
    handleImageDelete
  };
} 