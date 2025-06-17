-- Create store_images table for multiple images per store
CREATE TABLE IF NOT EXISTS store_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL, -- Base64 encoded image data
  image_name VARCHAR(255) NOT NULL,
  image_type VARCHAR(50) NOT NULL, -- MIME type (image/jpeg, image/png, etc.)
  image_size INTEGER NOT NULL, -- Size in bytes
  is_primary BOOLEAN NOT NULL DEFAULT FALSE, -- Mark one image as primary/cover
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_images_store_id ON store_images(store_id);
CREATE INDEX IF NOT EXISTS idx_store_images_primary ON store_images(store_id, is_primary);

-- Ensure only one primary image per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_images_unique_primary 
ON store_images(store_id) WHERE is_primary = TRUE;
