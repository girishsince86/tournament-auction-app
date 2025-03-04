/**
 * Tournament Groups Utility Functions
 * 
 * This file contains utility functions for managing tournament groups,
 * including generating round-robin matches and calculating standings.
 */

import { Match, TournamentGroup, GroupTeam } from '@/types/tournament-management';

/**
 * Generates round-robin matches for a tournament group
 * 
 * @param groupId The ID of the tournament group
 * @param teamIds Array of team IDs in the group
 * @param tournamentId The tournament ID
 * @param formatId The format ID
 * @param startDate The start date for the matches (YYYY-MM-DD)
 * @param defaultStartTime Default start time for matches (HH:MM:SS)
 * @param defaultEndTime Default end time for matches (HH:MM:SS)
 * @param courtId Optional court ID for the matches
 * @returns Array of match objects ready to be inserted into the database
 */
export function generateRoundRobinMatches(
  groupId: string,
  teamIds: string[],
  tournamentId: string,
  formatId: string,
  startDate: string,
  defaultStartTime: string = '09:00:00',
  defaultEndTime: string = '10:00:00',
  courtId?: string
): Partial<Match>[] {
  if (teamIds.length < 2) {
    throw new Error('At least 2 teams are required for round-robin matches');
  }
  
  const matches: Partial<Match>[] = [];
  const teams = [...teamIds];
  
  // If odd number of teams, add a dummy team (bye)
  if (teams.length % 2 !== 0) {
    teams.push('bye');
  }
  
  const totalRounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;
  
  // Calculate date for each round
  const getDateForRound = (roundIndex: number): string => {
    const startDateObj = new Date(startDate);
    startDateObj.setDate(startDateObj.getDate() + roundIndex);
    return startDateObj.toISOString().split('T')[0];
  };
  
  // Calculate time for each match in a round
  const getTimeForMatch = (matchIndex: number): { start: string, end: string } => {
    const [startHour, startMinute] = defaultStartTime.split(':').map(Number);
    const [endHour, endMinute] = defaultEndTime.split(':').map(Number);
    
    // Calculate duration in minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // Calculate new start time
    const newStartTotalMinutes = startTotalMinutes + (matchIndex * durationMinutes);
    const newStartHour = Math.floor(newStartTotalMinutes / 60);
    const newStartMinute = newStartTotalMinutes % 60;
    
    // Calculate new end time
    const newEndTotalMinutes = newStartTotalMinutes + durationMinutes;
    const newEndHour = Math.floor(newEndTotalMinutes / 60);
    const newEndMinute = newEndTotalMinutes % 60;
    
    return {
      start: `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}:00`,
      end: `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}:00`
    };
  };
  
  // Generate matches using the round-robin algorithm
  for (let round = 0; round < totalRounds; round++) {
    const roundDate = getDateForRound(round);
    
    for (let match = 0; match < matchesPerRound; match++) {
      const home = match;
      const away = teams.length - 1 - match;
      
      // Skip matches with the dummy team (bye)
      if (teams[home] !== 'bye' && teams[away] !== 'bye') {
        const { start, end } = getTimeForMatch(match);
        
        matches.push({
          tournament_id: tournamentId,
          format_id: formatId,
          group_id: groupId,
          team1_id: teams[home],
          team2_id: teams[away],
          court_id: courtId,
          scheduled_date: roundDate,
          scheduled_start_time: start,
          scheduled_end_time: end,
          status: 'SCHEDULED',
          match_type: 'REGULAR',
          round_number: round + 1
        });
      }
    }
    
    // Rotate teams for the next round (first team stays fixed)
    teams.splice(1, 0, teams.pop() as string);
  }
  
  return matches;
}

/**
 * Initializes group teams with default values
 * 
 * @param groupId The ID of the tournament group
 * @param teamIds Array of team IDs to add to the group
 * @returns Array of group team objects ready to be inserted into the database
 */
export function initializeGroupTeams(
  groupId: string,
  teamIds: string[]
): Partial<GroupTeam>[] {
  return teamIds.map((teamId) => ({
    group_id: groupId,
    team_id: teamId,
    points: 0,
    matches_played: 0,
    matches_won: 0,
    matches_lost: 0,
    sets_won: 0,
    sets_lost: 0,
    points_scored: 0,
    points_conceded: 0
  }));
}

/**
 * Calculates the number of matches in a round-robin tournament
 * 
 * @param numTeams Number of teams in the tournament
 * @returns Number of matches
 */
export function calculateRoundRobinMatches(numTeams: number): number {
  return (numTeams * (numTeams - 1)) / 2;
}

/**
 * Calculates the number of rounds in a round-robin tournament
 * 
 * @param numTeams Number of teams in the tournament
 * @returns Number of rounds
 */
export function calculateRoundRobinRounds(numTeams: number): number {
  return numTeams - 1;
} 