-- Add additional profile fields for barbers
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Update existing barbers to have profile_completed = true if they have stores
UPDATE users 
SET profile_completed = TRUE 
WHERE role = 'barber' 
AND id IN (SELECT DISTINCT barber_id FROM stores);
