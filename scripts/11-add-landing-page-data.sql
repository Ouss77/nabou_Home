-- Create landing page data table
CREATE TABLE IF NOT EXISTS landing_page_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  bio TEXT,
  specialties JSONB DEFAULT '[]',
  experience_years INTEGER,
  social_links JSONB DEFAULT '{}',
  external_booking_links JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_page_data_store_id ON landing_page_data(store_id);
