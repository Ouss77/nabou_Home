-- Create working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_working_hours_store_id ON working_hours(store_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_working_hours_store_day ON working_hours(store_id, day_of_week);

-- Add constraint to ensure start_time is before end_time when not closed
ALTER TABLE working_hours 
ADD CONSTRAINT check_working_hours_time_order 
CHECK (is_closed = TRUE OR start_time < end_time);

-- Add unique constraint to prevent duplicate entries for same store and day
ALTER TABLE working_hours 
ADD CONSTRAINT unique_store_day 
UNIQUE (store_id, day_of_week);
