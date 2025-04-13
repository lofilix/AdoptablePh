'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Dog, Heart, Home, Stethoscope, Users } from 'lucide-react'
import type { Database } from '@/types/supabase'
import { Hero } from '@/components/home/Hero'
import { Card, CardContent } from '@/components/ui/card'

type Tables = Database['public']['Tables']
type AnimalRow = Tables['animals']['Row']
type ShelterRow = Tables['shelters']['Row']

interface Animal extends AnimalRow {
  shelter?: ShelterRow | null
}

export default function HomePage() {
  const [featuredAnimals, setFeaturedAnimals] = useState<Animal[]>([])
  const [shelters, setShelters] = useState<ShelterRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Fetch featured animals with their shelters
        const { data: animals } = await supabase
          .from('animals')
          .select(`
            *,
            shelter:shelters(*)
          `)
          .filter('is_featured', 'eq', true)
          .limit(3)
          .returns<Animal[]>()

        // Fetch verified shelters
        const { data: verifiedShelters } = await supabase
          .from('shelters')
          .select()
          .filter('is_verified', 'eq', true)
          .limit(3)
          .returns<ShelterRow[]>()

        if (animals) setFeaturedAnimals(animals)
        if (verifiedShelters) setShelters(verifiedShelters)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-brand-dark">Our Mission</h2>
            <p className="text-lg text-brand-dark/80 leading-relaxed mb-12">
              AdoptablePH provides a centralized platform for supporting animal shelters throughout the Philippines. 
              We connect donors with verified local shelters, ensuring transparent and effective distribution of resources 
              where they're needed most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Direct Support</h3>
                <p className="text-brand-dark/70">
                  100% of your donation goes directly to verified animal shelters for immediate impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Medical Care</h3>
                <p className="text-brand-dark/70">
                  Fund vital medical procedures, including spaying and neutering programs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Shelter Support</h3>
                <p className="text-brand-dark/70">
                  Help improve shelter facilities and provide better living conditions for animals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Impact</h3>
                <p className="text-brand-dark/70">
                  Build a network of caring individuals and organizations across the Philippines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Make a Difference Today</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Your support helps us continue our mission of providing care and shelter to animals in need 
            across the Philippines. Every donation makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8"
            >
              <Link href="/donate">
                Donate Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent hover:bg-white/10 text-white border-white/20"
            >
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 