-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@barbershop.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample barber (password: barber123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('john@barbershop.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'John Smith', 'barber')
ON CONFLICT (email) DO NOTHING;

-- Get the barber's ID for creating a sample store
DO $$
DECLARE
    barber_uuid UUID;
    store_uuid UUID;
BEGIN
    SELECT id INTO barber_uuid FROM users WHERE email = 'john@barbershop.com';
    
    IF barber_uuid IS NOT NULL THEN
        -- Insert sample store
        INSERT INTO stores (barber_id, title, address, description, image_url) 
        VALUES (
            barber_uuid,
            'Classic Cuts Barbershop',
            '123 Main Street, Downtown',
            'Professional barbershop offering traditional and modern cuts with over 10 years of experience.',
            '/placeholder.svg?height=400&width=600'
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO store_uuid;
        
        -- Insert sample services
        IF store_uuid IS NOT NULL THEN
            INSERT INTO services (store_id, name, description, price, duration_minutes) VALUES
            (store_uuid, 'Classic Haircut', 'Traditional scissor cut with styling', 25.00, 30),
            (store_uuid, 'Beard Trim', 'Professional beard shaping and trimming', 15.00, 20),
            (store_uuid, 'Hair & Beard Combo', 'Complete haircut and beard service', 35.00, 45),
            (store_uuid, 'Hot Towel Shave', 'Traditional straight razor shave with hot towel', 30.00, 40)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
