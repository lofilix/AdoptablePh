-- First, check if the enums exist, if not create them
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_type') THEN
        CREATE TYPE donation_type AS ENUM ('general', 'medical', 'shelter');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status') THEN
        CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS donations_updated_at ON donations;

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS handle_updated_at();

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add donation_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'donation_type') THEN
        ALTER TABLE donations ADD COLUMN donation_type donation_type NOT NULL DEFAULT 'general';
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'status') THEN
        ALTER TABLE donations ADD COLUMN status donation_status NOT NULL DEFAULT 'pending';
    END IF;

    -- Add payment_intent_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'payment_intent_id') THEN
        ALTER TABLE donations ADD COLUMN payment_intent_id text UNIQUE;
    END IF;

    -- Add payment_method if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'payment_method') THEN
        ALTER TABLE donations ADD COLUMN payment_method text;
    END IF;

    -- Add receipt_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'receipt_url') THEN
        ALTER TABLE donations ADD COLUMN receipt_url text;
    END IF;

    -- Add is_anonymous if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'is_anonymous') THEN
        ALTER TABLE donations ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;
    END IF;

    -- Add impact_report_sent if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'impact_report_sent') THEN
        ALTER TABLE donations ADD COLUMN impact_report_sent boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create the trigger after all table modifications
CREATE TRIGGER donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'donations_user_id_idx') THEN
        CREATE INDEX donations_user_id_idx ON donations(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'donations_status_idx') THEN
        CREATE INDEX donations_status_idx ON donations(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'donations_created_at_idx') THEN
        CREATE INDEX donations_created_at_idx ON donations(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'donations_payment_intent_id_idx') THEN
        CREATE INDEX donations_payment_intent_id_idx ON donations(payment_intent_id);
    END IF;
END $$;

-- Update RLS policies
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
DROP POLICY IF EXISTS "Anyone can create a donation" ON donations;
DROP POLICY IF EXISTS "System can update donation status" ON donations;

-- Create new policies
CREATE POLICY "Users can view their own donations"
    ON donations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

CREATE POLICY "Anyone can create a donation"
    ON donations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update any donation"
    ON donations FOR UPDATE
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can update their pending donations"
    ON donations FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND status = 'pending'
    ); 