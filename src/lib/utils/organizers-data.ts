import organizersData from '@/data/organizers-data.json';
import { OrganizerProfile } from '@/types/organizer';

interface OrganizerDataItem {
  first_name: string;
  last_name: string;
  profession?: string;
  sports_background?: string;
  notable_achievements?: string[];
  role?: string;
  philosophy?: string;
  bio?: string;
  contact_email?: string;
  phone_number?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  profile_image_url?: string;
}

/**
 * Normalizes a string for comparison by trimming whitespace and converting to lowercase
 */
function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Enriches an organizer profile with data from the JSON file
 * @param profile The base organizer profile
 * @returns The profile with data from the JSON file
 */
export function enrichOrganizerProfile(profile: Partial<OrganizerProfile>): Partial<OrganizerProfile> {
  if (!profile.first_name) {
    return profile;
  }

  // Normalize the profile names for comparison
  const normalizedFirstName = normalizeString(profile.first_name);
  const normalizedLastName = normalizeString(profile.last_name || '');

  // Find matching organizer data in the JSON file with normalized comparison
  const organizerData = organizersData.organizers.find(
    (organizer) => {
      const organizerFirstName = normalizeString(organizer.first_name);
      const organizerLastName = normalizeString(organizer.last_name || '');
      
      return organizerFirstName === normalizedFirstName && 
             (organizerLastName === normalizedLastName || !profile.last_name);
    }
  );
  
  // If found, replace profile data with JSON data
  if (organizerData) {
    // Keep only essential fields from the database
    const essentialFields = {
      id: profile.id,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
    
    // Create a new profile with JSON data and essential database fields
    return {
      ...essentialFields,
      first_name: organizerData.first_name,
      last_name: organizerData.last_name,
      profession: organizerData.profession,
      sports_background: organizerData.sports_background,
      role: organizerData.role,
      philosophy: organizerData.philosophy,
      bio: profile.bio,
      contact_email: profile.contact_email,
      phone_number: profile.phone_number,
      social_media: profile.social_media,
      profile_image_url: organizerData.profile_image_url || profile.profile_image_url
    };
  }
  
  return profile;
}

/**
 * Gets all organizer data from the JSON file
 * @returns Array of organizer data items
 */
export function getAllOrganizersData(): typeof organizersData.organizers {
  return organizersData.organizers;
}

/**
 * Finds a specific organizer's data in the JSON file
 * @param firstName The first name of the organizer
 * @param lastName The last name of the organizer
 * @returns The organizer data or undefined if not found
 */
export function findOrganizerData(firstName: string, lastName?: string): typeof organizersData.organizers[0] | undefined {
  // Normalize the input names
  const normalizedFirstName = normalizeString(firstName);
  const normalizedLastName = lastName ? normalizeString(lastName) : '';
  
  return organizersData.organizers.find(
    (organizer) => {
      const organizerFirstName = normalizeString(organizer.first_name);
      const organizerLastName = normalizeString(organizer.last_name || '');
      
      return organizerFirstName === normalizedFirstName && 
             (organizerLastName === normalizedLastName || !lastName);
    }
  );
} 