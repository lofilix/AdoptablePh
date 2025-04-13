'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type ProjectFormProps = {
  shelterId: string
  project?: {
    id: string
    title: string
    description: string
    category: 'infrastructure' | 'medical' | 'food_supplies' | 'equipment' | 'other'
    target_amount: number
    start_date: string
    end_date: string
    image_url?: string
  }
}

export default function ProjectForm({ shelterId, project }: ProjectFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'infrastructure',
    target_amount: project?.target_amount || 0,
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    image_url: project?.image_url || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let image_url = formData.image_url

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${shelterId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath)

        image_url = publicUrl
      }

      const projectData = {
        shelter_id: shelterId,
        ...formData,
        image_url,
        target_amount: parseFloat(formData.target_amount.toString()),
        status: 'active'
      }

      if (project?.id) {
        const { error } = await supabase
          .from('shelter_projects')
          .update(projectData)
          .eq('id', project.id)

        if (error) throw error
        toast.success('Project updated successfully')
      } else {
        const { error } = await supabase
          .from('shelter_projects')
          .insert(projectData)

        if (error) throw error
        toast.success('Project created successfully')
      }

      router.refresh()
      router.push(`/shelter/${shelterId}/projects`)
    } catch (error) {
      toast.error('Error saving project')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="food_supplies">Food Supplies</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="target_amount">Target Amount</Label>
        <Input
          id="target_amount"
          type="number"
          min="0"
          step="0.01"
          value={formData.target_amount}
          onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Project Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  )
} 