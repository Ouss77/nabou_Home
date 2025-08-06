-- Add unique constraint to prevent double booking
-- This ensures no two appointments can exist for the same store, date, and time
ALTER TABLE appointments 
ADD CONSTRAINT unique_store_date_time 
UNIQUE (store_id, appointment_date, appointment_time);

-- Add index for better performance on concurrent booking checks
CREATE INDEX IF NOT EXISTS idx_appointments_store_date_time 
ON appointments(store_id, appointment_date, appointment_time);

-- Add index for status-based queries
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status);
