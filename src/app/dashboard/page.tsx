'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Shelter = Database['public']['Tables']['shelters']['Row'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          redirect('/login');
          return;
        }

        // Get user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);

          // If user is a shelter admin, get their shelter
          if (profileData.role === 'shelter_admin') {
            const { data: shelterData } = await supabase
              .from('shelters')
              .select('*')
              .eq('admin_id', user.id)
              .single();

            setShelter(shelterData);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    redirect('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profile.role === 'shelter_admin' && shelter && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Shelter Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{shelter.name}</p>
                <p className="text-gray-500">{shelter.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Email: {shelter.email}</p>
                <p>Phone: {shelter.contact_number}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shelter.is_verified 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {shelter.is_verified ? 'Verified' : 'Pending Verification'}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {profile.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome to the admin dashboard</p>
            </CardContent>
          </Card>
        )}

        {profile.role === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle>User Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome to your dashboard</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 