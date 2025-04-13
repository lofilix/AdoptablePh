'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogIn, Shield, User, Menu, X } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { UserCircle, LogOut } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUserRole(profile.role)
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">AdoptablePH</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/donate" className="text-sm font-medium hover:text-primary">
                Donate
              </Link>
              <Link href="/impact" className="text-sm font-medium hover:text-primary">
                Impact
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && !user && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}

            {!isLoading && user && (
              <div className="relative">
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Menu className="h-5 w-5" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-2">
                    {userRole === 'admin' && (
                      <Link 
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      href="/donor"
                      className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Donor Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}

            {!isLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 