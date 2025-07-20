-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on is_active for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_active) VALUES
('Professional Hair Clipper Set', 'High-quality cordless clipper with multiple guards and accessories', 89.99, 'Clippers & Trimmers', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 25, true),
('Premium Pomade', 'Strong hold pomade for classic styling with natural shine', 24.99, 'Styling Products', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 50, true),
('Straight Razor Kit', 'Traditional straight razor with leather strop and shaving cream', 149.99, 'Shaving Tools', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 15, true),
('Beard Oil Set', 'Nourishing beard oil collection with 3 different scents', 34.99, 'Beard Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 40, true),
('Professional Scissors', 'Japanese steel haircutting scissors for precision cuts', 199.99, 'Professional Tools', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 20, true),
('Hair Wax', 'Matte finish hair wax for textured styling', 18.99, 'Styling Products', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 60, true),
('Shaving Brush', 'Badger hair shaving brush for rich lather', 45.99, 'Shaving Tools', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 30, true),
('Aftershave Balm', 'Soothing aftershave balm with aloe vera', 22.99, 'Skincare', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 35, true),
('Barber Cape', 'Professional waterproof barber cape', 29.99, 'Accessories', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 45, true),
('Hair Tonic', 'Refreshing hair tonic for scalp health', 19.99, 'Hair Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 55, true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
