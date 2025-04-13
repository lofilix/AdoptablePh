-- Drop existing table and its dependencies
DROP TABLE IF EXISTS shelter_projects CASCADE;

-- Create shelter projects table
CREATE TABLE shelter_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('infrastructure', 'medical', 'food_supplies', 'equipment', 'other')),
    target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(10, 2) DEFAULT 0 NOT NULL CHECK (current_amount >= 0),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    image_url TEXT,
    updates TEXT[] DEFAULT ARRAY[]::TEXT[],
    CHECK (end_date >= start_date)
);

-- Create index on shelter_id for faster lookups
CREATE INDEX IF NOT EXISTS shelter_projects_shelter_id_idx ON shelter_projects(shelter_id);

-- Enable Row Level Security
ALTER TABLE shelter_projects ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_shelter_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_shelter_projects_updated_at ON shelter_projects;
CREATE TRIGGER update_shelter_projects_updated_at
    BEFORE UPDATE ON shelter_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_shelter_projects_updated_at();

-- Create policies for shelter projects

-- Public can view active projects
DROP POLICY IF EXISTS "Public can view active projects" ON shelter_projects;
CREATE POLICY "Public can view active projects"
    ON shelter_projects
    FOR SELECT
    TO public
    USING (status = 'active');

-- Shelter admins can manage their own projects
DROP POLICY IF EXISTS "Shelter admins can manage their projects" ON shelter_projects;
CREATE POLICY "Shelter admins can manage their projects"
    ON shelter_projects
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM shelters
            WHERE shelters.id = shelter_projects.shelter_id
            AND shelters.admin_id = auth.uid()
        )
    );

-- Platform admins can view all projects
DROP POLICY IF EXISTS "Admins can view all projects" ON shelter_projects;
CREATE POLICY "Admins can view all projects"
    ON shelter_projects
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    ); 