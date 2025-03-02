export interface TeamOwnerProfile {
  id: string;
  user_id: string;
  team_id: string;
  team_name?: string;
  first_name: string;
  last_name: string;
  sports_background?: string;
  notable_achievements?: string[];
  team_role?: string;
  contact_email: string;
  phone_number?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  profile_image_url?: string;
  bio: string;
  created_at: string;
  updated_at: string;
  profession?: string;
  sports_interests?: string;
  family_impact?: string;
  philosophy?: string;
}

export interface TeamOwnerUpdateRequest {
  first_name: string;
  last_name: string;
  team_id: string;
  sports_background?: string;
  notable_achievements?: string[];
  team_role?: string;
  contact_email: string;
  phone_number?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  profile_image_url?: string;
  bio: string;
  profession?: string;
  sports_interests?: string;
  family_impact?: string;
  philosophy?: string;
}

export interface TeamNameUpdateRequest {
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface TeamOwnerProfileUpdateInput extends Partial<TeamOwnerUpdateRequest> {
  profile_image_url?: string | undefined;
} 