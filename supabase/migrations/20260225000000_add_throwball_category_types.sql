-- Add throwball registration categories to category_type enum.
-- Required before loading throwball players from tournament_registrations.

ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'THROWBALL_WOMEN';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'THROWBALL_13_17_MIXED';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'THROWBALL_8_12_MIXED';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'VOLLEYBALL_U12_BOYS';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'VOLLEYBALL_U16_BOYS';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'VOLLEYBALL_OPEN_MEN';
