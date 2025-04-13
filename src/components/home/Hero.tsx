'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center" aria-label="Hero section">
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="A compassionate scene showing a Filipino volunteer caring for an Aspin (native Filipino dog) in our bright, welcoming shelter"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/70 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">
            Support Animal Shelters Across the Philippines
          </h1>
          <p className="mb-8 text-lg sm:text-xl text-white leading-relaxed drop-shadow-md">
            Join our mission to provide essential care, medical support, and loving homes for rescued animals. Together, we can give our dear aspins and puspins a dignified way to survive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4" role="group" aria-label="Call to action">
            <Button
              asChild
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/donate">
                Donate Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm transition-all duration-300"
            >
              <Link href="/shelters">
                View Shelters
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md"
        role="complementary"
        aria-label="Impact statistics"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-white text-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="font-bold text-3xl mb-2">20+</div>
              <div className="text-white text-sm sm:text-base">Partner Shelters</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="font-bold text-3xl mb-2">1,000+</div>
              <div className="text-white text-sm sm:text-base">Animals Helped</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="font-bold text-3xl mb-2">₱500K+</div>
              <div className="text-white text-sm sm:text-base">Donations Distributed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 