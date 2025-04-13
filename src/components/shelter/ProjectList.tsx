'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type Project = {
  id: string
  title: string
  description: string
  category: string
  target_amount: number
  current_amount: number
  start_date: string
  end_date: string
  image_url?: string
  status: 'active' | 'completed' | 'cancelled'
}

type ProjectListProps = {
  shelterId: string
  projects: Project[]
  isAdmin?: boolean
}

export default function ProjectList({ shelterId, projects, isAdmin }: ProjectListProps) {
  const supabase = createClientComponentClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const filteredProjects = projects.filter(project => 
    filter === 'all' ? true : project.status === filter
  )

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('shelter_projects')
        .update({ status: newStatus })
        .eq('id', projectId)

      if (error) throw error
      toast.success('Project status updated')
      window.location.reload()
    } catch (error) {
      toast.error('Error updating project status')
      console.error('Error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Link href={`/shelter/${shelterId}/projects/new`}>
            <Button>Create New Project</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{project.title}</CardTitle>
            </CardHeader>
            {project.image_url && (
              <div className="relative h-48 mx-4">
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {project.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{formatCurrency(project.current_amount)} of {formatCurrency(project.target_amount)}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${calculateProgress(project.current_amount, project.target_amount)}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Category: {project.category}</span>
                <span className={`capitalize ${
                  project.status === 'active' ? 'text-green-600' :
                  project.status === 'completed' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {project.status}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/shelter/${shelterId}/projects/${project.id}`} className="flex-grow">
                <Button variant="secondary" className="w-full">View Details</Button>
              </Link>
              {isAdmin && project.status === 'active' && (
                <Select
                  onValueChange={(value) => handleStatusChange(project.id, value as Project['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Mark Completed</SelectItem>
                    <SelectItem value="cancelled">Cancel Project</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  )
} 