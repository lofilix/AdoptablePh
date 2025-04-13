import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProjectForm from '@/components/shelter/ProjectForm'

export default async function NewProjectPage({
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

  // Only shelter admins can create projects
  if (shelter.admin_id !== user.id) {
    redirect(`/shelter/${params.id}`)
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Create New Project</h1>
      <ProjectForm shelterId={params.id} />
    </div>
  )
} 