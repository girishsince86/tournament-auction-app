export interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_teams?: number;
  max_players_per_team?: number;
  min_players_per_team?: number;
  team_points_budget?: number;
  is_active: boolean;
  team_budget?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
} 