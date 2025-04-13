'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PawPrint } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

const predefinedAmounts = [500, 1000, 2500, 5000]

type Donation = Database['public']['Tables']['donations']['Insert']

export default function AnonymousDonationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount

      if (finalAmount < 100) {
        toast.error('Minimum donation amount is ₱100')
        return
      }

      const supabase = createClient()

      // Create donation record
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          email,
          amount: finalAmount,
          is_anonymous: true,
          donation_type: 'general',
          status: 'pending'
        } satisfies Donation)
        .select()
        .single()

      if (donationError) throw donationError

      // TODO: Integrate with payment gateway
      // For now, we'll simulate a successful payment
      toast.success('Redirecting to payment gateway...')
      
      // Redirect to a success page after 2 seconds
      setTimeout(() => {
        router.push('/donate/success?session_id=' + donation.id)
      }, 2000)
    } catch (error) {
      console.error('Error processing donation:', error)
      toast.error('Failed to process donation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Anonymous Donation</h1>
          <p className="text-gray-600">
            Your email will only be used to send you the impact report and donation receipt.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

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