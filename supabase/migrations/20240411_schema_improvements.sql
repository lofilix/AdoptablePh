-- Create missing enums if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_type') THEN
        CREATE TYPE animal_type AS ENUM ('dog', 'cat', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'animal_status') THEN
        CREATE TYPE animal_status AS ENUM ('for_rescuing', 'available', 'adopted', 'fostered', 'under_treatment');
    END IF;
END $$;

-- Add email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Add phone validation function
CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone ~* '^\+?[0-9]{10,15}$';
END;
$$ LANGUAGE plpgsql;

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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_user ON adoption_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_animal ON adoption_applications(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal ON animal_photos(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_primary ON animal_photos(animal_id) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_status_changes_entity ON status_changes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_date ON status_changes(changed_at DESC);

-- Add email and phone validation to existing tables
ALTER TABLE public.shelters
ADD CONSTRAINT valid_email CHECK (is_valid_email(email)),
ADD CONSTRAINT valid_phone CHECK (is_valid_phone(contact_number));

-- Add triggers for maintaining data consistency

-- Ensure only one primary photo per animal
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary THEN
        UPDATE animal_photos
        SET is_primary = false
        WHERE animal_id = NEW.animal_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_photo_trigger
BEFORE INSERT OR UPDATE ON animal_photos
FOR EACH ROW
EXECUTE FUNCTION ensure_single_primary_photo();

-- Track status changes
CREATE OR REPLACE FUNCTION track_status_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Add status tracking triggers to relevant tables
CREATE TRIGGER track_animal_status_changes
AFTER UPDATE ON animals
FOR EACH ROW
EXECUTE FUNCTION track_status_changes('animal');

CREATE TRIGGER track_application_status_changes
AFTER UPDATE ON adoption_applications
FOR EACH ROW
EXECUTE FUNCTION track_status_changes('application');

-- Enable RLS on new tables
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adoption_applications
CREATE POLICY "Users can view their own applications"
    ON adoption_applications
    FOR SELECT
    USING (auth.uid() = user_id);

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

-- RLS Policies for animal_photos
CREATE POLICY "Anyone can view animal photos"
    ON animal_photos
    FOR SELECT
    USING (true);

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

-- RLS Policies for status_changes
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

-- RLS Policies for shelter_details
CREATE POLICY "Anyone can view shelter details"
    ON shelter_details
    FOR SELECT
    USING (true);

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

-- Add updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_adoption_applications_updated_at
    BEFORE UPDATE ON adoption_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shelter_details_updated_at
    BEFORE UPDATE ON shelter_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 