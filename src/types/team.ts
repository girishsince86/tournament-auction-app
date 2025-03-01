export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  tournament_id: string;
  owner_id?: string;
  budget_remaining?: number;
  created_at?: string;
  updated_at?: string;
  players?: TeamPlayer[];
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  purchase_price?: number;
  created_at?: string;
  updated_at?: string;
  player?: {
    id: string;
    name: string;
    skill_level?: string;
    profile_image_url?: string;
  };
} 