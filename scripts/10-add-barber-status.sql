-- Add status column to users table for barber account management
ALTER TABLE users 
ADD COLUMN status VARCHAR(20) DEFAULT 'trial' 
CHECK (status IN ('trial', 'active', 'expired'));

-- Update existing barbers to have trial status
UPDATE users 
SET status = 'trial' 
WHERE role = 'barber' AND status IS NULL;

-- Create index for better performance on status queries
CREATE INDEX idx_users_status ON users(status) WHERE role = 'barber';
