'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type AnimalRow = Tables['animals']['Row']

interface FeaturedAnimalsProps {
  animals: AnimalRow[]
}

export function FeaturedAnimals({ animals }: FeaturedAnimalsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {animals.map((animal) => (
        <Card key={animal.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={animal.image_url || '/placeholder-pet.jpg'}
              alt={animal.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">{animal.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{animal.description}</p>
            <Button asChild className="w-full">
              <Link href={`/animals/${animal.id}`}>
                Learn More
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 