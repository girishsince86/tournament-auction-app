import { useState, useCallback } from 'react';
import type { FilterState, SortState } from '../types/filter';
import type { PlayerWithPreference } from '../types/player';
import { INITIAL_FILTER_STATE, INITIAL_SORT_STATE } from '../constants/index';

interface UseFiltersAndSortReturn {
    filterState: FilterState;
    sortState: SortState;
    setFilterState: (state: FilterState) => void;
    setSortState: (state: SortState) => void;
    handleClearFilters: () => void;
    filterPlayers: (players: PlayerWithPreference[]) => PlayerWithPreference[];
    sortPlayers: (players: PlayerWithPreference[]) => PlayerWithPreference[];
}

export function useFiltersAndSort(): UseFiltersAndSortReturn {
    const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
    const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE);

    const handleClearFilters = useCallback(() => {
        setFilterState(INITIAL_FILTER_STATE);
    }, []);

    const filterPlayers = useCallback((players: PlayerWithPreference[]) => {
        return players?.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(filterState.searchQuery.toLowerCase());
            const matchesPosition = !filterState.position || player.player_position === filterState.position;
            const matchesSkill = !filterState.skillLevel || player.skill_level === filterState.skillLevel;
            const matchesCategory = !filterState.category || player.category?.category_type === filterState.category;
            return matchesSearch && matchesPosition && matchesSkill && matchesCategory;
        }) || [];
    }, [filterState]);

    const sortPlayers = useCallback((players: PlayerWithPreference[]) => {
        return [...players].sort((a, b) => {
            const direction = sortState.direction === 'asc' ? 1 : -1;
            
            switch (sortState.field) {
                case 'name':
                    return direction * (a.name || '').localeCompare(b.name || '');
                case 'base_price':
                    return direction * (a.base_price - b.base_price);
                case 'position':
                    return direction * (a.player_position || '').localeCompare(b.player_position || '');
                case 'skill_level':
                    return direction * (a.skill_level || '').localeCompare(b.skill_level || '');
                default:
                    return 0;
            }
        });
    }, [sortState]);

    return {
        filterState,
        sortState,
        setFilterState,
        setSortState,
        handleClearFilters,
        filterPlayers,
        sortPlayers
    };
} 