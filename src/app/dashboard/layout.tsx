'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';
import { Home, Users, PawPrint, FileText, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          redirect('/login');
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        redirect('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    redirect('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    redirect('/login');
    return null;
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    ...(profile.role === 'shelter_admin' ? [
      { name: 'Animals', href: '/dashboard/animals', icon: PawPrint },
      { name: 'Projects', href: '/dashboard/projects', icon: FileText },
    ] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Link href="/" className="text-xl font-bold">
                  AdoptablePH
                </Link>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="flex md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4">
          <Link href="/" className="text-xl font-bold">
            AdoptablePH
          </Link>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col md:pl-64">
          <main className="flex-1">
            <div className="py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}