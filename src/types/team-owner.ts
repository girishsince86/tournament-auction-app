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
  social_media?: string;
  profile_image_url?: string;
  bio: string;
  created_at: string;
  updated_at: string;
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
  social_media?: string;
  profile_image_url?: string;
  bio: string;
}

export interface TeamNameUpdateRequest {
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 