-- Add status column to users table for barber account management
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT NULL;

-- Add check constraint to ensure only valid status values
ALTER TABLE users ADD CONSTRAINT check_user_status 
CHECK (status IS NULL OR status IN ('trial', 'active', 'expired'));

-- Set default status for existing barbers
UPDATE users SET status = 'trial' WHERE role = 'barber' AND status IS NULL;

-- Create index for efficient status queries
CREATE INDEX idx_users_status ON users(status) WHERE status IS NOT NULL;
