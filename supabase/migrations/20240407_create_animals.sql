-- Create animals table
CREATE TABLE public.animals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type animal_type NOT NULL,
    breed TEXT,
    age_years INTEGER,
    age_months INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female')),
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    weight_kg DECIMAL(5,2),
    description TEXT,
    medical_history TEXT,
    behavior_notes TEXT,
    special_needs TEXT,
    status animal_status DEFAULT 'for_rescuing' NOT NULL,
    primary_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    treatment_details TEXT
); 