-- Create landing page data table
CREATE TABLE IF NOT EXISTS landing_page_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    bio TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    experience_years INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}'::jsonb,
    external_booking_links JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_page_data_store_id ON landing_page_data(store_id);

-- Add some sample data for existing stores
INSERT INTO landing_page_data (store_id, bio, specialties, experience_years, social_links)
SELECT 
    id as store_id,
    'Professional barber with a passion for creating the perfect look for every client. Specializing in modern cuts and classic styles.' as bio,
    '["Fade Cuts", "Beard Trimming", "Classic Cuts"]'::jsonb as specialties,
    5 as experience_years,
    '{}'::jsonb as social_links
FROM stores 
WHERE NOT EXISTS (
    SELECT 1 FROM landing_page_data WHERE landing_page_data.store_id = stores.id
)
LIMIT 5;
