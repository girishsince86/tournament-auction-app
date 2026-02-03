-- SQL script to update player heights from tournament_registrations

-- First, set all heights in the players table to NULL
UPDATE players SET height = NULL, updated_at = NOW();
