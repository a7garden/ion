-- Remove avatar_url, add planet
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE profiles ADD COLUMN planet text NOT NULL DEFAULT 'moon';

-- Add check constraint for valid planets
ALTER TABLE profiles ADD CONSTRAINT profiles_planet_check 
  CHECK (planet IN ('moon','earth','mars','crystal','saturn','jupiter','venus','neptune','uranus','pluto'));
