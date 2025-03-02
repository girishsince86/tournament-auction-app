# Team Owner Profiles Data

This directory contains JSON data files used as the primary source of data for team owner profiles in the application.

## team-owners-data.json

This file contains the complete information about team owners, with only essential fields (IDs, profile image) coming from the database. This approach offers several advantages:

1. **Complete Content Control**: All profile content is managed in a single JSON file
2. **Separation of Concerns**: Database only stores essential identifiers and references
3. **Version Control**: All content changes are tracked in git
4. **Development Flexibility**: Content can be updated without database changes
5. **Simplified Data Management**: No need for complex database migrations for content updates

## Data Structure

The JSON file contains an array of team owner objects with the following structure:

```json
{
  "owners": [
    {
      "first_name": "First Name",
      "last_name": "Last Name",
      "profession": "Professional title or occupation",
      "sports_interests": "Description of sports interests",
      "family_impact": "How sports has impacted their family",
      "philosophy": "Their philosophy about sports and life",
      "sports_background": "Their sports background and experience",
      "notable_achievements": ["Achievement 1", "Achievement 2"],
      "team_role": "Their role in the team",
      "bio": "Detailed biography of the team owner",
      "contact_email": "contact@example.com",
      "social_media": {
        "linkedin": "https://linkedin.com/in/username",
        "twitter": "https://twitter.com/username",
        "instagram": "https://instagram.com/username",
        "website": "https://example.com"
      }
    }
  ]
}
```

## How It Works

1. The database stores only essential data: IDs, references, and profile image URLs
2. The API routes fetch the minimal database data and then replace most fields with data from the JSON file
3. The matching is done by first_name and last_name
4. The combined data is returned to the client

## Updating Content

To update any content for a team owner:

1. Edit the corresponding entry in `team-owners-data.json`
2. If adding a new team owner, ensure the first_name and last_name match exactly with the database record
3. Deploy the changes

No database migrations are required for content updates, making the process much simpler and more maintainable. 