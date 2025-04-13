-- First, check if the profile exists
DO $$
DECLARE
    user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace this with your actual user ID
BEGIN
    -- If profile doesn't exist, create it
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        INSERT INTO profiles (id, role)
        VALUES (user_id, 'admin');
    -- If profile exists, update it
    ELSE
        UPDATE profiles
        SET role = 'admin'
        WHERE id = user_id;
    END IF;
END $$; 