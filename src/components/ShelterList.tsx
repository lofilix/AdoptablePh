'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type ShelterRow = Tables['shelters']['Row']

interface ShelterListProps {
  shelters: ShelterRow[]
}

export function ShelterList({ shelters }: ShelterListProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {shelters.map((shelter) => (
        <Card key={shelter.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={shelter.logo_url || '/placeholder-shelter.jpg'}
              alt={shelter.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-3">{shelter.name}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{shelter.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{shelter.contact_number}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{shelter.email}</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={`/shelters/${shelter.id}`}>
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 