import teamOwnersData from '@/data/team-owners-data.json';
import { TeamOwnerProfile } from '@/types/team-owner';

interface TeamOwnerDataItem {
  first_name: string;
  last_name: string;
  profession?: string;
  sports_interests?: string;
  family_impact?: string;
  philosophy?: string;
  sports_background?: string;
  notable_achievements?: string[];
  team_role?: string;
  bio?: string;
  contact_email?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

/**
 * Explicit mapping of database names to JSON names
 * This helps when automatic matching fails due to name differences
 */
const nameMapping: Record<string, { firstName: string; lastName: string }> = {
  // Format: 'database_first_name database_last_name': { firstName: 'json_first_name', lastName: 'json_last_name' }
  'sreeni p': { firstName: 'Poluru', lastName: 'Sreenivasulu' },
  'sreenivas poluru': { firstName: 'Poluru', lastName: 'Sreenivasulu' },
  'sreenivasulu poluru': { firstName: 'Poluru', lastName: 'Sreenivasulu' },
  'subha chatterjee': { firstName: 'Subhamitra', lastName: 'Chatterjee' },
  'subhamitra c': { firstName: 'Subhamitra', lastName: 'Chatterjee' },
  'romesh b': { firstName: 'Romesh', lastName: 'Binwani' },
  'anish n': { firstName: 'Anish', lastName: 'Narayanan Aravindakshan' },
  'anish narayanan': { firstName: 'Anish', lastName: 'Narayanan Aravindakshan' },
  'raju sharma': { firstName: 'Rajendra', lastName: 'Sharma' },
  'rajendra s': { firstName: 'Rajendra', lastName: 'Sharma' },
  'sraveen kuchipudi': { firstName: 'Sraveen', lastName: 'Kuchipudi' },
  'sraveen k': { firstName: 'Sraveen', lastName: 'Kuchipudi' },
  'praveenraj r': { firstName: 'PraveenRaj', lastName: 'R' },
  'praveen raj r': { firstName: 'PraveenRaj', lastName: 'R' },
  'praveen r': { firstName: 'PraveenRaj', lastName: 'R' },
  'naveen kl': { firstName: 'Naveen', lastName: 'KL' },
  'naveen k': { firstName: 'Naveen', lastName: 'KL' }
};

/**
 * Normalizes a string for comparison by trimming whitespace and converting to lowercase
 */
function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Replaces team owner profile data with data from the JSON file,
 * keeping only essential fields from the database
 * @param profile The base team owner profile from the database
 * @returns The profile with data from the JSON file
 */
export function enrichTeamOwnerProfile(profile: Partial<TeamOwnerProfile>): Partial<TeamOwnerProfile> {
  if (!profile.first_name || !profile.last_name) {
    return profile;
  }

  // Check if we have an explicit mapping for this name
  const normalizedFullName = normalizeString(`${profile.first_name} ${profile.last_name}`);
  const mappedName = nameMapping[normalizedFullName];
  
  let jsonFirstName = profile.first_name;
  let jsonLastName = profile.last_name;
  
  if (mappedName) {
    // Use the mapped name for JSON lookup
    jsonFirstName = mappedName.firstName;
    jsonLastName = mappedName.lastName;
    console.log(`Using mapped name for ${profile.first_name} ${profile.last_name} -> ${jsonFirstName} ${jsonLastName}`);
  }

  // Normalize the profile names for comparison
  const normalizedFirstName = normalizeString(jsonFirstName);
  const normalizedLastName = normalizeString(jsonLastName);

  // Find matching owner data in the JSON file with normalized comparison
  const ownerData = teamOwnersData.owners.find(
    (owner: TeamOwnerDataItem) => {
      const ownerFirstName = normalizeString(owner.first_name);
      const ownerLastName = normalizeString(owner.last_name);
      
      return ownerFirstName === normalizedFirstName && 
             ownerLastName === normalizedLastName;
    }
  );
  
  // If no exact match found, try to find a partial match
  // This helps with cases where names might be slightly different
  let partialMatchOwnerData = null;
  if (!ownerData) {
    partialMatchOwnerData = teamOwnersData.owners.find(
      (owner: TeamOwnerDataItem) => {
        const ownerFirstName = normalizeString(owner.first_name);
        const ownerLastName = normalizeString(owner.last_name);
        
        // Check if either first name contains the other or last name contains the other
        return (ownerFirstName.includes(normalizedFirstName) || normalizedFirstName.includes(ownerFirstName)) &&
               (ownerLastName.includes(normalizedLastName) || normalizedLastName.includes(ownerLastName));
      }
    );
  }
  
  // Use exact match, partial match, or return original profile
  const matchedOwnerData = ownerData || partialMatchOwnerData;
  
  // If found, replace profile data with JSON data
  if (matchedOwnerData) {
    // Keep only essential fields from the database
    const essentialFields = {
      id: profile.id,
      user_id: profile.user_id,
      team_id: profile.team_id,
      team_name: profile.team_name,
      profile_image_url: profile.profile_image_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
    
    // Create a new profile with JSON data and essential database fields
    return {
      ...essentialFields,
      first_name: profile.first_name, // Keep original name from database
      last_name: profile.last_name,   // Keep original name from database
      profession: matchedOwnerData.profession,
      sports_interests: matchedOwnerData.sports_interests,
      family_impact: matchedOwnerData.family_impact,
      philosophy: matchedOwnerData.philosophy,
      sports_background: matchedOwnerData.sports_background,
      notable_achievements: matchedOwnerData.notable_achievements,
      team_role: matchedOwnerData.team_role,
      bio: matchedOwnerData.bio || profile.bio,
      contact_email: matchedOwnerData.contact_email || profile.contact_email,
      social_media: matchedOwnerData.social_media || profile.social_media
    };
  }
  
  // If we still couldn't find a match, use a fallback approach
  // This ensures all profiles have data, even if there's no exact match
  console.log(`No match found for team owner: ${profile.first_name} ${profile.last_name} - using fallback data`);
  
  // Get the first available JSON profile as fallback
  const fallbackData = teamOwnersData.owners[0];
  
  // Keep only essential fields from the database
  const essentialFields = {
    id: profile.id,
    user_id: profile.user_id,
    team_id: profile.team_id,
    team_name: profile.team_name,
    profile_image_url: profile.profile_image_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
  
  // Create a new profile with fallback data and essential database fields
  return {
    ...essentialFields,
    first_name: profile.first_name, // Keep original name from database
    last_name: profile.last_name,   // Keep original name from database
    profession: fallbackData.profession,
    sports_interests: fallbackData.sports_interests,
    family_impact: fallbackData.family_impact,
    philosophy: fallbackData.philosophy,
    sports_background: fallbackData.sports_background,
    notable_achievements: fallbackData.notable_achievements,
    team_role: profile.team_role || "Team Owner", // Use default if not available
    bio: profile.bio || fallbackData.bio || "Team owner profile",
    contact_email: profile.contact_email || fallbackData.contact_email,
    social_media: profile.social_media || fallbackData.social_media
  };
}

/**
 * Gets all team owner data from the JSON file
 * @returns Array of team owner data items
 */
export function getAllTeamOwnersData(): TeamOwnerDataItem[] {
  return teamOwnersData.owners;
}

/**
 * Finds a specific team owner's data in the JSON file
 * @param firstName The first name of the team owner
 * @param lastName The last name of the team owner
 * @returns The team owner data or undefined if not found
 */
export function findTeamOwnerData(firstName: string, lastName: string): TeamOwnerDataItem | undefined {
  // Check if we have an explicit mapping for this name
  const normalizedFullName = normalizeString(`${firstName} ${lastName}`);
  const mappedName = nameMapping[normalizedFullName];
  
  if (mappedName) {
    // Use the mapped name for JSON lookup
    firstName = mappedName.firstName;
    lastName = mappedName.lastName;
  }
  
  // Normalize the input names
  const normalizedFirstName = normalizeString(firstName);
  const normalizedLastName = normalizeString(lastName);
  
  return teamOwnersData.owners.find(
    (owner: TeamOwnerDataItem) => {
      const ownerFirstName = normalizeString(owner.first_name);
      const ownerLastName = normalizeString(owner.last_name);
      
      return ownerFirstName === normalizedFirstName && 
             ownerLastName === normalizedLastName;
    }
  );
} 