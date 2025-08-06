-- Create blocked_times table
CREATE TABLE IF NOT EXISTS blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blocked_times_store_id ON blocked_times(store_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_date ON blocked_times(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_times_store_date ON blocked_times(store_id, blocked_date);

-- Add constraint to ensure start_time is before end_time
ALTER TABLE blocked_times 
ADD CONSTRAINT check_time_order 
CHECK (start_time < end_time);
