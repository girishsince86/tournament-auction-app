export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          team_budget: number;
          registration_deadline: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          team_budget: number;
          registration_deadline: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          team_budget?: number;
          registration_deadline?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other tables
    };
  };
} 