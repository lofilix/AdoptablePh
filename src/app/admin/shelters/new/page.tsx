'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewShelterPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('shelters')
        .insert({
          ...formData,
          admin_id: user.id,
          is_verified: false
        })

      if (error) throw error

      toast.success('Shelter registered successfully')
      router.push('/admin')
    } catch (error) {
      toast.error('Error registering shelter')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Register New Shelter</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to register your animal shelter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Shelter Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell us about your shelter..."
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Shelter'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 