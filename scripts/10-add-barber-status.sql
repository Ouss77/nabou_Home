-- Add status column to users table for barber trial management
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'trial' 
CHECK (status IN ('trial', 'active', 'expired'));

-- Update existing barbers to have trial status
UPDATE users 
SET status = 'trial' 
WHERE role = 'barber' AND status IS NULL;

-- Admin users don't need status
UPDATE users 
SET status = NULL 
WHERE role = 'admin';
</merged_code>
