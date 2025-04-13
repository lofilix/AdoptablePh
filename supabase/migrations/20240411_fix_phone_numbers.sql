-- Add phone validation function first
CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- More lenient validation: allow 9-15 digits (to handle international numbers)
    RETURN phone ~* '^\+?[0-9]{9,15}$';
END;
$$ LANGUAGE plpgsql;

-- Temporarily disable the constraints
ALTER TABLE public.shelters DROP CONSTRAINT IF EXISTS valid_phone;
ALTER TABLE public.shelters ALTER COLUMN contact_number DROP NOT NULL;

-- Function to clean phone numbers
CREATE OR REPLACE FUNCTION clean_phone_number(phone TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    -- Remove all non-digit characters except leading +
    cleaned := regexp_replace(phone, '[^0-9+]', '', 'g');
    
    -- If the number starts with 0, replace with +63 (Philippines country code)
    IF cleaned ~ '^0' THEN
        cleaned := '+63' || substring(cleaned from 2);
    END IF;
    
    -- If the number doesn't start with +, add +63
    IF cleaned !~ '^\+' THEN
        cleaned := '+63' || cleaned;
    END IF;
    
    RETURN cleaned;
END;
$$ LANGUAGE plpgsql;

-- First, let's see what phone numbers we have
SELECT id, contact_number, clean_phone_number(contact_number) as cleaned_number
FROM public.shelters
WHERE contact_number IS NOT NULL;

-- Update existing phone numbers
UPDATE public.shelters
SET contact_number = clean_phone_number(contact_number)
WHERE contact_number IS NOT NULL;

-- Set invalid phone numbers to NULL and log them
UPDATE public.shelters
SET contact_number = NULL
WHERE contact_number IS NOT NULL 
AND NOT is_valid_phone(contact_number);

-- Verify all remaining phone numbers are valid
SELECT id, contact_number
FROM public.shelters
WHERE contact_number IS NOT NULL 
AND NOT is_valid_phone(contact_number);

-- Re-enable the constraints
ALTER TABLE public.shelters
ADD CONSTRAINT valid_phone CHECK (is_valid_phone(contact_number));

-- Only add back NOT NULL if all records have valid phone numbers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.shelters 
        WHERE contact_number IS NULL
    ) THEN
        ALTER TABLE public.shelters ALTER COLUMN contact_number SET NOT NULL;
    END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS clean_phone_number; 