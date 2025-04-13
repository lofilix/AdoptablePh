-- Create a trigger function to format phone numbers before insert/update
CREATE OR REPLACE FUNCTION format_phone_number()
RETURNS TRIGGER AS $$
DECLARE
    formatted TEXT;
BEGIN
    IF NEW.contact_number IS NULL THEN
        RETURN NEW;
    END IF;

    -- Remove all non-digit characters except leading +
    formatted := regexp_replace(NEW.contact_number, '[^0-9+]', '', 'g');
    
    -- If the number starts with 0, replace with +63
    IF formatted ~ '^0' THEN
        formatted := '+63' || substring(formatted from 2);
    END IF;
    
    -- If the number doesn't start with +, add +63
    IF formatted !~ '^\+' THEN
        formatted := '+63' || formatted;
    END IF;

    -- If the formatted number is not valid, raise an error
    IF NOT is_valid_phone(formatted) THEN
        RAISE EXCEPTION 'Invalid phone number format. Please enter a valid phone number with 9-15 digits.';
    END IF;

    NEW.contact_number := formatted;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS format_phone_number_trigger ON public.shelters;
CREATE TRIGGER format_phone_number_trigger
    BEFORE INSERT OR UPDATE ON public.shelters
    FOR EACH ROW
    EXECUTE FUNCTION format_phone_number();

-- Add a comment explaining the phone number format
COMMENT ON COLUMN public.shelters.contact_number IS 'Phone number must be 9-15 digits, optionally starting with +. Will be automatically formatted with +63 prefix if not provided.'; 