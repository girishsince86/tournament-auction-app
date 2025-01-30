-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'CONDUCTOR', 'TEAM_OWNER');
CREATE TYPE player_position AS ENUM (
    'P1_RIGHT_BACK',
    'P2_RIGHT_FRONT',
    'P3_MIDDLE_FRONT',
    'P4_LEFT_FRONT',
    'P5_LEFT_BACK',
    'P6_MIDDLE_BACK',
    'ANY_POSITION'
);
CREATE TYPE player_status AS ENUM ('AVAILABLE', 'IN_AUCTION', 'SOLD', 'UNSOLD');
CREATE TYPE skill_level AS ENUM (
    'RECREATIONAL_C',
    'INTERMEDIATE_B',
    'UPPER_INTERMEDIATE_BB',
    'COMPETITIVE_A'
);
CREATE TYPE tshirt_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL');

-- Create base tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'TEAM_OWNER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by owner"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Profiles are updatable by owner"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id); 