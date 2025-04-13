import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimalManagement from '@/components/shelter/AnimalManagement';
import ProjectManagement from '@/components/shelter/ProjectManagement';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ShelterPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Get shelter details
  const { data: shelter } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!shelter) {
    redirect('/404')
  }

  // Check if user is authenticated and get their role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = user && shelter.admin_id === user.id

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{shelter.name}</h1>
        {isAdmin && (
          <Link href={`/admin`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Address:</strong> {shelter.address}</p>
            <p><strong>Phone:</strong> {shelter.contact_number}</p>
            <p><strong>Email:</strong> {shelter.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/shelter/${shelter.id}/animals`}>
              <Button variant="secondary" className="w-full">View Animals</Button>
            </Link>
            <Link href={`/shelter/${shelter.id}/projects`}>
              <Button variant="secondary" className="w-full">View Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="animals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="animals">
          <AnimalManagement shelterId={params.id} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectManagement shelterId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 