import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AnimalManagement from '@/components/shelter/AnimalManagement'

export default async function AnimalsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated and get their role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get shelter details and check if user is admin
  const { data: shelter } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!shelter) {
    redirect('/404')
  }

  const isAdmin = shelter.admin_id === user.id

  if (!isAdmin) {
    redirect(`/shelter/${params.id}`)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{shelter.name} - Animals</h1>
      </div>
      
      <AnimalManagement shelterId={params.id} />
    </div>
  )
} 