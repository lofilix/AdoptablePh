-- Create the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create ENUMs for project category and status
CREATE TYPE project_category AS ENUM ('infrastructure', 'medical', 'food_supplies', 'equipment', 'other');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'cancelled');

-- Create shelter_projects table
CREATE TABLE shelter_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category project_category NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    status project_status NOT NULL DEFAULT 'active',
    updates JSONB[] DEFAULT ARRAY[]::JSONB[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT end_date_after_start_date CHECK (end_date > start_date),
    CONSTRAINT current_amount_not_exceeding_target CHECK (current_amount <= target_amount)
);

-- Create indexes
CREATE INDEX shelter_projects_shelter_id_idx ON shelter_projects(shelter_id);
CREATE INDEX shelter_projects_status_idx ON shelter_projects(status);
CREATE INDEX shelter_projects_category_idx ON shelter_projects(category);

-- Create trigger for updating updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON shelter_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE shelter_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public to view active projects
CREATE POLICY "Public can view active projects"
    ON shelter_projects
    FOR SELECT
    USING (status = 'active');

-- Allow shelter admins to manage their projects
CREATE POLICY "Shelter admins can manage their projects"
    ON shelter_projects
    FOR ALL
    USING (
        shelter_id IN (
            SELECT id FROM shelters
            WHERE admin_id = auth.uid()
        )
    );

-- Allow authenticated users to view all projects except cancelled ones
CREATE POLICY "Authenticated users can view non-cancelled projects"
    ON shelter_projects
    FOR SELECT
    USING (
        status != 'cancelled'
    ); 