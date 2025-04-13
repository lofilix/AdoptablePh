'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import ProjectManagement from '@/components/shelter/ProjectManagement';
import { Loader2 } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Shelter = Database['public']['Tables']['shelters']['Row'];

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUserAndShelter = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Get user's shelter if they are a shelter admin
        if (profileData.role === 'shelter_admin') {
          const { data: shelterData, error: shelterError } = await supabase
            .from('shelters')
            .select('*')
            .eq('admin_id', user.id)
            .single();

          if (shelterError) throw shelterError;
          setShelter(shelterData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndShelter();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || !shelter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">
          You must be a shelter administrator to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Projects</h1>
      <ProjectManagement shelterId={shelter.id} />
    </div>
  );
} 