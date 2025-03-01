export interface TeamBudgetDetails {
    initial_budget: number;
    remaining_budget: number;
    allocated_budget: number;
    reserved_budget?: number;
    average_player_cost?: number;
    budget_utilization_percentage: number;
}

export interface TeamBudgetMetrics {
    avg_player_cost: number;
    total_players: number;
    marquee_players?: number;
    capped_players?: number;
    uncapped_players?: number;
    total_cost: number;
    remaining_budget: number;
    budget_utilization: number;
} 