-- Add UNDONE to the auction_status enum so undo operations are valid
ALTER TYPE auction_status ADD VALUE IF NOT EXISTS 'UNDONE';
