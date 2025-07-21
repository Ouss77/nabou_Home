-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_active) VALUES
('Professional Hair Clipper Set', 'Complete professional clipper set with multiple guards and accessories', 89.99, 'Clippers & Trimmers', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 25, true),
('Premium Beard Oil', 'Nourishing beard oil with natural ingredients for healthy beard growth', 24.99, 'Beard Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 50, true),
('Straight Razor Kit', 'Traditional straight razor with leather strop and shaving cream', 149.99, 'Shaving Tools', 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400', 15, true),
('Hair Styling Pomade', 'Strong hold pomade for classic and modern hairstyles', 18.99, 'Styling Products', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 40, true),
('Professional Scissors Set', 'High-quality stainless steel scissors for precision cutting', 79.99, 'Professional Tools', 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=400', 20, true),
('Moisturizing Shampoo', 'Gentle cleansing shampoo for all hair types', 16.99, 'Hair Care', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400', 60, true),
('Aftershave Balm', 'Soothing aftershave balm to prevent irritation', 22.99, 'Skincare', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 35, true),
('Barber Cape', 'Professional waterproof barber cape with snap closure', 29.99, 'Accessories', 'https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=400', 30, true),
('Beard Trimmer', 'Cordless precision beard trimmer with multiple length settings', 59.99, 'Clippers & Trimmers', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', 45, true),
('Hair Wax', 'Flexible hold hair wax for textured styling', 14.99, 'Styling Products', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 55, true);
