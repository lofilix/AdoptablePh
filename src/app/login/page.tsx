'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Check if there's a stored session
    const storedSession = localStorage.getItem('rememberSession')
    if (storedSession === 'true') {
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Store the session preference
      localStorage.setItem('rememberSession', rememberMe.toString())

      toast.success('Logged in successfully')
      router.refresh()
      router.push('/admin')
    } catch (error) {
      toast.error('Error logging in')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // Store the session preference for new users
      localStorage.setItem('rememberSession', rememberMe.toString())

      toast.success('Check your email to confirm your account')
    } catch (error) {
      toast.error('Error signing up')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked: boolean) => setRememberMe(checked)}
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={handleSignUp} disabled={loading}>
            Sign Up
          </Button>
        </div>
      </form>
    </div>
  )
} 