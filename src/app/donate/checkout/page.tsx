'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PawPrint, Heart, Stethoscope, Home } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const predefinedAmounts = [500, 1000, 2500, 5000]

export default function DonationCheckoutPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [donationType, setDonationType] = useState<'general' | 'medical' | 'shelter'>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement payment processing
      // 1. Get final amount (selected or custom)
      // 2. Create donation record in database with user_id
      // 3. Redirect to payment gateway
      // 4. Send confirmation email with impact report
    } catch (error) {
      console.error('Error processing donation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Complete Your Donation</h1>
          <p className="text-gray-600">
            Choose a donation type and amount to make your impact.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>
                Select where you'd like your donation to be used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="general" onValueChange={(value) => setDonationType(value as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="general" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    General Support
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Medical Fund
                  </TabsTrigger>
                  <TabsTrigger value="shelter" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Shelter Projects
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <p className="text-sm text-gray-600 mt-4">
                    Your donation will be distributed among our partner shelters to provide food, 
                    basic medical care, and essential supplies for the animals.
                  </p>
                </TabsContent>

                <TabsContent value="medical">
                  <p className="text-sm text-gray-600 mt-4">
                    Support our spaying/neutering programs and help provide critical medical care 
                    for injured or sick animals.
                  </p>
                </TabsContent>

                <TabsContent value="shelter">
                  <p className="text-sm text-gray-600 mt-4">
                    Help fund specific shelter improvement projects, from building repairs to new 
                    enclosures for the animals.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Select Amount</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className="h-12 text-lg font-semibold"
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                    >
                      ₱{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAmount">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input
                    id="customAmount"
                    type="number"
                    className="pl-8"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(0)
                    }}
                    min="100"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-orange hover:bg-brand-orange/90 h-14 text-lg"
                disabled={isSubmitting}
              >
                <PawPrint className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secured by{' '}
                <span className="font-semibold">GCash</span> and{' '}
                <span className="font-semibold">PayMongo</span>
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
} 