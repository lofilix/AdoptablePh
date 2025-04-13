'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

type Profile = {
  id: string
  role: 'admin' | 'donor'
}

export default function Navbar() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .single()
          
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="border-b">
      <div className="container flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-bold">
          AdoptablePH
        </Link>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="ghost">Admin Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 