'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AnimalForm } from '@/components/admin/AnimalForm'
import { Loader2, Plus } from 'lucide-react'
import Image from 'next/image'

interface Animal {
  id: string
  name: string
  type: 'dog' | 'cat' | 'other'
  breed?: string
  age_years: number
  age_months: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  weight_kg?: number
  description?: string
  status: 'for_rescuing' | 'found_forever_home' | 'found_foster' | 'under_treatment'
  primary_image_url?: string
  created_at: string
}

interface Shelter {
  id: string
  name: string
  logo_url?: string
  description?: string
}

export default function ShelterDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [shelter, setShelter] = useState<Shelter | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)

  const fetchShelterAndAnimals = async () => {
    try {
      setLoading(true)
      
      // Fetch shelter details
      const { data: shelterData, error: shelterError } = await supabase
        .from('shelters')
        .select('*')
        .eq('id', params.id)
        .single()

      if (shelterError) throw shelterError
      setShelter(shelterData)

      // Fetch animals for this shelter
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('shelter_id', params.id)
        .order('created_at', { ascending: false })

      if (animalsError) throw animalsError
      setAnimals(animalsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShelterAndAnimals()
  }, [params.id])

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'for_rescuing': 'For Rescuing',
      'found_forever_home': 'Found Forever Home',
      'found_foster': 'Found Foster Home',
      'under_treatment': 'Under Treatment'
    } as const;
    return statusMap[status as keyof typeof statusMap] || status;
  }

  const getAgeDisplay = (age_years: number | null, age_months: number | null) => {
    if (age_years === null && age_months === null) {
      return 'Unknown Age';
    }
    if (age_years === 0 && age_months === 0) {
      return 'Newborn';
    }
    const parts = [];
    if (age_years && age_years > 0) parts.push(`${age_years}y`);
    if (age_months && age_months > 0) parts.push(`${age_months}m`);
    return parts.join(' ') || 'Newborn';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!shelter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Shelter not found</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {shelter.logo_url && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
              <Image
                src={shelter.logo_url}
                alt={shelter.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{shelter.name}</h1>
            {shelter.description && (
              <p className="text-muted-foreground">{shelter.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setIsAddAnimalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Animal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => (
          <Card key={animal.id} className="overflow-hidden">
            <div className="relative h-48">
              {animal.primary_image_url ? (
                <Image
                  src={animal.primary_image_url}
                  alt={animal.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-lg font-semibold text-white">{animal.name}</h3>
                <p className="text-sm text-white/80">
                  {animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}
                  {animal.breed ? ` • ${animal.breed}` : ''}
                </p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {getAgeDisplay(animal.age_years, animal.age_months)}
                </span>
                <span className="text-sm font-medium">
                  {animal.gender.charAt(0).toUpperCase() + animal.gender.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  animal.status === 'for_rescuing' ? 'bg-orange-100 text-orange-800' :
                  animal.status === 'found_forever_home' ? 'bg-green-100 text-green-800' :
                  animal.status === 'found_foster' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusDisplay(animal.status)}
                </span>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedAnimal(animal)}
              >
                Edit Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {animals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No animals added yet</p>
        </div>
      )}

      <Dialog open={isAddAnimalOpen} onOpenChange={setIsAddAnimalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Animal</DialogTitle>
          </DialogHeader>
          <AnimalForm
            shelterId={shelter.id}
            onSuccess={() => {
              setIsAddAnimalOpen(false)
              fetchShelterAndAnimals()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedAnimal} onOpenChange={(open) => !open && setSelectedAnimal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Animal Details</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <AnimalForm
              shelterId={shelter.id}
              animal={selectedAnimal}
              onSuccess={() => {
                setSelectedAnimal(null)
                fetchShelterAndAnimals()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 