import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/supabase'

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Get shelters managed by this admin
  const { data: shelters } = await supabase
    .from('shelters')
    .select('id, name, address, contact_number')
    .eq('admin_id', user.id)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Shelters</h1>
        <Link href="/admin/shelters/new">
          <Button>Register New Shelter</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters?.map((shelter) => (
          <Card key={shelter.id}>
            <CardHeader>
              <CardTitle>{shelter.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{shelter.address}</p>
              <p className="text-sm text-muted-foreground">{shelter.contact_number}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href={`/shelter/${shelter.id}`} className="w-full">
                <Button variant="secondary" className="w-full">View Details</Button>
              </Link>
              <Link href={`/shelter/${shelter.id}/animals`} className="w-full">
                <Button variant="outline" className="w-full">Manage Animals</Button>
              </Link>
              <Link href={`/shelter/${shelter.id}/projects`} className="w-full">
                <Button variant="outline" className="w-full">Manage Projects</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!shelters || shelters.length === 0) && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No shelters registered yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click the &quot;Register New Shelter&quot; button to add your first shelter
          </p>
        </div>
      )}
    </div>
  )
} 