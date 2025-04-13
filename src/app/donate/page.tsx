import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCircle, UserX } from 'lucide-react'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/server'

export default async function DonatePage() {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Make a Difference Today</h1>
          <p className="text-lg text-gray-600">
            Choose how you'd like to donate. Both options will provide you with an impact report
            showing how your donation helped our animal friends.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-brand-teal" />
                Donate with Account
              </CardTitle>
              <CardDescription>
                Track your donations and get personalized impact reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <span className="bg-brand-teal/10 text-brand-teal rounded-full p-1 mr-2">✓</span>
                  Track all your donations in one place
                </li>
                <li className="flex items-center">
                  <span className="bg-brand-teal/10 text-brand-teal rounded-full p-1 mr-2">✓</span>
                  Receive personalized impact reports
                </li>
                <li className="flex items-center">
                  <span className="bg-brand-teal/10 text-brand-teal rounded-full p-1 mr-2">✓</span>
                  Get tax deduction receipts automatically
                </li>
              </ul>
              <Button asChild className="w-full bg-brand-teal hover:bg-brand-teal/90">
                <Link href={user ? "/donate/checkout" : "/login?redirect=/donate/checkout"}>
                  Continue with Account
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-6 h-6 text-brand-orange" />
                Donate Anonymously
              </CardTitle>
              <CardDescription>
                Quick donation with just an email for your impact report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <span className="bg-brand-orange/10 text-brand-orange rounded-full p-1 mr-2">✓</span>
                  No account required
                </li>
                <li className="flex items-center">
                  <span className="bg-brand-orange/10 text-brand-orange rounded-full p-1 mr-2">✓</span>
                  Receive one-time impact report
                </li>
                <li className="flex items-center">
                  <span className="bg-brand-orange/10 text-brand-orange rounded-full p-1 mr-2">✓</span>
                  Get tax deduction receipt via email
                </li>
              </ul>
              <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange/90">
                <Link href="/donate/anonymous">
                  Donate Anonymously
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            100% of your donation goes directly to the animal shelters. AdoptablePH does not take any
            fees from your donation.
          </p>
        </div>
      </div>
    </div>
  )
} 