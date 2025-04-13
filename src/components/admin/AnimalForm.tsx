'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload } from 'lucide-react'
import Image from 'next/image'

interface AnimalFormProps {
  shelterId: string
  animal?: {
    id: string
    name: string
    type: 'dog' | 'cat' | 'other'
    breed?: string
    age_years?: number
    age_months?: number
    gender?: 'male' | 'female'
    size?: 'small' | 'medium' | 'large'
    weight_kg?: string
    description?: string
    medical_history?: string
    behavior_notes?: string
    special_needs?: string
    status: 'for_rescuing' | 'found_forever_home' | 'found_foster' | 'under_treatment'
    primary_image_url?: string
    treatment_details?: string
  }
  onSuccess?: () => void
}

export function AnimalForm({ shelterId, animal, onSuccess }: AnimalFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalImagesRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: animal?.name || '',
    type: animal?.type || 'dog',
    breed: animal?.breed || '',
    age_years: animal?.age_years ?? null,
    age_months: animal?.age_months ?? null,
    gender: animal?.gender || 'male',
    size: animal?.size || 'medium',
    weight_kg: animal?.weight_kg || '',
    description: animal?.description || '',
    medical_history: animal?.medical_history || '',
    behavior_notes: animal?.behavior_notes || '',
    special_needs: animal?.special_needs || '',
    status: animal?.status || 'for_rescuing',
    primary_image_url: animal?.primary_image_url || '',
    treatment_details: animal?.treatment_details || '',
    is_age_unknown: !animal?.age_years && !animal?.age_months
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Validate required fields
      if (!formData.name) {
        toast.error('Name is required')
        setLoading(false)
        return
      }

      // Convert weight from string to number
      const weightInKg = formData.weight_kg ? parseFloat(formData.weight_kg) : null

      const animalData = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed?.trim() || null,
        age_years: formData.is_age_unknown ? null : (formData.age_years || 0),
        age_months: formData.is_age_unknown ? null : (formData.age_months || 0),
        gender: formData.gender,
        size: formData.size,
        weight_kg: weightInKg,
        description: formData.description?.trim() || null,
        medical_history: formData.medical_history?.trim() || null,
        behavior_notes: formData.behavior_notes?.trim() || null,
        special_needs: formData.special_needs?.trim() || null,
        status: formData.status,
        primary_image_url: formData.primary_image_url || null,
        treatment_details: formData.status === 'under_treatment' ? (formData.treatment_details?.trim() || null) : null,
        shelter_id: shelterId
      }

      let newAnimalId: string | undefined

      if (animal?.id) {
        // Update existing animal
        const { error: updateError } = await supabase
          .from('animals')
          .update({
            ...animalData,
            updated_at: new Date().toISOString()
          })
          .eq('id', animal.id)

        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
        newAnimalId = animal.id
      } else {
        // Create new animal
        const { data, error: insertError } = await supabase
          .from('animals')
          .insert([{
            ...animalData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        newAnimalId = data?.id
      }

      // Handle additional images if any
      if (additionalImages.length > 0 && newAnimalId) {
        const imageInserts = additionalImages.map((imageUrl, index) => ({
          animal_id: newAnimalId,
          image_url: imageUrl,
          display_order: index,
          created_at: new Date().toISOString()
        }))

        const { error: imageError } = await supabase
          .from('animal_images')
          .insert(imageInserts)

        if (imageError) {
          console.error('Error saving additional images:', imageError)
          toast.error('Some images may not have been saved properly')
        }
      }

      toast.success(animal?.id ? 'Pet profile updated successfully' : 'Pet profile created successfully')
      
      if (!animal?.id) {
        // Reset form for new entries
        setFormData({
          name: '',
          type: 'dog',
          breed: '',
          age_years: null,
          age_months: null,
          gender: 'male',
          size: 'medium',
          weight_kg: '',
          description: '',
          medical_history: '',
          behavior_notes: '',
          special_needs: '',
          status: 'for_rescuing',
          primary_image_url: '',
          treatment_details: '',
          is_age_unknown: true
        })
        setAdditionalImages([])
      }

      // Call onSuccess after everything is done
      if (typeof onSuccess === 'function') {
        onSuccess()
      }

    } catch (error) {
      console.error('Error saving pet profile:', error)
      toast.error('Failed to save pet profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const supabase = createClient()

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('animal-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('animal-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({
        ...prev,
        primary_image_url: publicUrl
      }))

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAdditionalImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingAdditionalImages(true)
      const supabase = createClient()

      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('animal-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('animal-images')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      setAdditionalImages(prev => [...prev, ...uploadedUrls])
      toast.success('Images uploaded successfully')
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploadingAdditionalImages(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Primary Image</Label>
        <div className="space-y-4">
          {formData.primary_image_url && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
              <Image
                src={formData.primary_image_url}
                alt="Primary pet image"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dog' | 'cat' | 'other' })}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age_status">Age Information</Label>
        <select
          id="age_status"
          value={formData.is_age_unknown ? 'unknown' : 'known'}
          onChange={(e) => {
            const isUnknown = e.target.value === 'unknown'
            setFormData({
              ...formData,
              is_age_unknown: isUnknown,
              age_years: isUnknown ? null : 0,
              age_months: isUnknown ? null : 0
            })
          }}
          className="w-full px-3 py-2 border rounded-md mb-4"
        >
          <option value="known">Known Age</option>
          <option value="unknown">Unknown Age</option>
        </select>

        {!formData.is_age_unknown && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age_years">Years</Label>
              <Input
                id="age_years"
                type="number"
                min="0"
                value={formData.age_years ?? 0}
                onChange={(e) => setFormData({ ...formData, age_years: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_months">Months</Label>
              <Input
                id="age_months"
                type="number"
                min="0"
                max="11"
                value={formData.age_months ?? 0}
                onChange={(e) => setFormData({ ...formData, age_months: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter total months for pets under 1 year (e.g., 6 months old = 0 years, 6 months)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <select
            id="size"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value as 'small' | 'medium' | 'large' })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          <Input
            id="weight_kg"
            type="text"
            inputMode="decimal"
            value={formData.weight_kg}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setFormData({ ...formData, weight_kg: value })
            }}
            placeholder="Enter weight"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical_history">Medical History</Label>
        <Textarea
          id="medical_history"
          value={formData.medical_history}
          onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="behavior_notes">Behavior Notes</Label>
        <Textarea
          id="behavior_notes"
          value={formData.behavior_notes}
          onChange={(e) => setFormData({ ...formData, behavior_notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_needs">Special Needs</Label>
        <Textarea
          id="special_needs"
          value={formData.special_needs}
          onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="for_rescuing">For Rescuing</option>
          <option value="found_forever_home">Found a Forever Home</option>
          <option value="found_foster">Found a Foster</option>
          <option value="under_treatment">Under Treatment</option>
        </select>
      </div>

      {formData.status === 'under_treatment' && (
        <div className="space-y-2">
          <Label htmlFor="treatment_details">Treatment Details</Label>
          <Textarea
            id="treatment_details"
            value={formData.treatment_details}
            onChange={(e) => setFormData({ ...formData, treatment_details: e.target.value })}
            placeholder="Enter current medications, treatments, and medical procedures..."
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Additional Images</Label>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {additionalImages.map((url, index) => (
              <div key={index} className="relative">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={url}
                    alt={`Additional ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAdditionalImagesUpload}
              ref={additionalImagesRef}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => additionalImagesRef.current?.click()}
              disabled={uploadingAdditionalImages}
            >
              {uploadingAdditionalImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add More Images'
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : animal?.id ? 'Update Pet Profile' : 'Create Pet Profile'}
      </Button>
    </form>
  )
} 