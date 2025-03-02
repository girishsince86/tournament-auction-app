export interface OrganizerProfile {
  id: string;
  first_name: string;
  last_name: string;
  profession?: string;
  sports_background?: string;
  notable_achievements?: string[];
  role?: string;
  contact_email?: string;
  phone_number?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  profile_image_url?: string;
  bio?: string;
  philosophy?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 