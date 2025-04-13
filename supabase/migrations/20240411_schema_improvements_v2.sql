-- Step 1: Create enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_type') THEN
        CREATE TYPE animal_type AS ENUM ('dog', 'cat', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_status') THEN
        CREATE TYPE animal_status AS ENUM ('for_rescuing', 'available', 'adopted', 'fostered', 'under_treatment');
    END IF;
END $$;

-- Step 2: Create validation functions
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $BODY$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$BODY$ LANGUAGE plpgsql;

-- Step 3: Create tables
-- Create adoption applications table
CREATE TABLE IF NOT EXISTS public.adoption_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')) DEFAULT 'pending',
    application_data JSONB NOT NULL,
    review_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT valid_review CHECK (
        (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR
        (status IN ('pending', 'withdrawn'))
    )
);

-- Create animal photos table
CREATE TABLE IF NOT EXISTS public.animal_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (url ~ '^https?://'),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create status changes audit table
CREATE TABLE IF NOT EXISTS public.status_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('animal', 'application', 'project', 'donation')),
    entity_id UUID NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create shelter details table
CREATE TABLE IF NOT EXISTS public.shelter_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shelter_id UUID REFERENCES public.shelters(id) ON DELETE CASCADE UNIQUE,
    operating_hours JSONB,
    contact_preferences JSONB,
    social_media_links JSONB,
    facilities TEXT[],
    services_offered TEXT[],
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_operating_hours CHECK (
        operating_hours ? 'weekday_hours' AND
        operating_hours ? 'weekend_hours'
    )
);

-- Step 4: Add email validation constraint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'valid_email'
        AND table_name = 'shelters'
    ) THEN
        ALTER TABLE public.shelters
        ADD CONSTRAINT valid_email CHECK (is_valid_email(email));
    END IF;
END $$;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_user ON adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_animal ON adoption_applications(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal ON animal_photos(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_primary ON animal_photos(animal_id) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_status_changes_entity ON status_changes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_date ON status_changes(changed_at DESC);

-- Step 6: Create trigger functions
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $BODY$
BEGIN
    IF NEW.is_primary THEN
        UPDATE animal_photos
        SET is_primary = false
        WHERE animal_id = NEW.animal_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_status_changes()
RETURNS TRIGGER AS $BODY$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO status_changes (
            entity_type,
            entity_id,
            old_status,
            new_status,
            changed_by,
            notes
        ) VALUES (
            TG_ARGV[0],
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            'Status changed via ' || TG_ARGV[0] || ' update'
        );
    END IF;
    RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $BODY$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

-- Step 7: Enable RLS
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_details ENABLE ROW LEVEL SECURITY;

-- Step 8: Create triggers
DO $$ 
DECLARE
    trigger_exists boolean;
BEGIN
    -- Create ensure_single_primary_photo trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_single_primary_photo_trigger'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER ensure_single_primary_photo_trigger
        BEFORE INSERT OR UPDATE ON animal_photos
        FOR EACH ROW
        EXECUTE FUNCTION ensure_single_primary_photo();
    END IF;

    -- Create track_animal_status_changes trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'track_animal_status_changes'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER track_animal_status_changes
        AFTER UPDATE ON animals
        FOR EACH ROW
        EXECUTE FUNCTION track_status_changes('animal');
    END IF;

    -- Create track_application_status_changes trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'track_application_status_changes'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER track_application_status_changes
        AFTER UPDATE ON adoption_applications
        FOR EACH ROW
        EXECUTE FUNCTION track_status_changes('application');
    END IF;

    -- Create updated_at triggers
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_adoption_applications_updated_at'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER update_adoption_applications_updated_at
            BEFORE UPDATE ON adoption_applications
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_shelter_details_updated_at'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER update_shelter_details_updated_at
            BEFORE UPDATE ON shelter_details
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Step 9: Create RLS policies
DO $$ BEGIN
    -- Adoption applications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own applications') THEN
        CREATE POLICY "Users can view their own applications"
            ON adoption_applications
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Shelter admins can view applications for their animals') THEN
        CREATE POLICY "Shelter admins can view applications for their animals"
            ON adoption_applications
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM animals a
                    JOIN shelters s ON a.shelter_id = s.id
                    WHERE a.id = adoption_applications.animal_id
                    AND s.admin_id = auth.uid()
                )
            );
    END IF;

    -- Animal photos policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view animal photos') THEN
        CREATE POLICY "Anyone can view animal photos"
            ON animal_photos
            FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Shelter admins can manage their animal photos') THEN
        CREATE POLICY "Shelter admins can manage their animal photos"
            ON animal_photos
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM animals a
                    JOIN shelters s ON a.shelter_id = s.id
                    WHERE a.id = animal_photos.animal_id
                    AND s.admin_id = auth.uid()
                )
            );
    END IF;

    -- Status changes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all status changes') THEN
        CREATE POLICY "Admins can view all status changes"
            ON status_changes
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
    END IF;

    -- Shelter details policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view shelter details') THEN
        CREATE POLICY "Anyone can view shelter details"
            ON shelter_details
            FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Shelter admins can manage their shelter details') THEN
        CREATE POLICY "Shelter admins can manage their shelter details"
            ON shelter_details
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM shelters
                    WHERE shelters.id = shelter_details.shelter_id
                    AND shelters.admin_id = auth.uid()
                )
            );
    END IF;
END $$; 