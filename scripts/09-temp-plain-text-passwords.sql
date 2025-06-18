-- Temporarily update demo users to use plain text passwords for testing
UPDATE users 
SET password_hash = 'admin123' 
WHERE email = 'admin@barbershop.com';

UPDATE users 
SET password_hash = 'barber123' 
WHERE email = 'john@barbershop.com';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
