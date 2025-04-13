import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function DonationSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl mb-2">Thank You for Your Donation!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600">
              Your donation will help provide care and support for animals in need. We've sent a
              confirmation email with your receipt and will follow up with an impact report showing
              how your donation made a difference.
            </p>

            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/animals">
                  Meet Our Animals
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>
                Having trouble? Contact us at{' '}
                <a href="mailto:support@adoptableph.org" className="text-brand-teal hover:underline">
                  support@adoptableph.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 