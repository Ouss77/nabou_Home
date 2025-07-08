-- Add status column to users table for barber trial management
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'trial';

-- Update existing barbers to have trial status
UPDATE users SET status = 'trial' WHERE role = 'barber' AND status IS NULL;

-- Add constraint to ensure valid status values
ALTER TABLE users ADD CONSTRAINT check_user_status 
CHECK (status IN ('trial', 'active', 'expired'));
