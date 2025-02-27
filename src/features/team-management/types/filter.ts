export interface FilterState {
    position: string;
    skillLevel: string;
    searchQuery: string;
    category: string;
}

export interface SortState {
    field: 'name' | 'base_price' | 'position' | 'skill_level';
    direction: 'asc' | 'desc';
}

export interface SelectedPlayerData {
    player_id: string;
    max_bid: number;
} 