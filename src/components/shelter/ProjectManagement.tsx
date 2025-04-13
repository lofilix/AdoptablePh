'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'medical' | 'food_supplies' | 'equipment' | 'other';
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  image_url?: string;
  status: 'active' | 'completed' | 'cancelled';
  updates: string[];
  created_at: string;
};

type ProjectManagementProps = {
  shelterId: string;
};

export default function ProjectManagement({ shelterId }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as Project['category'],
    target_amount: '',
    start_date: '',
    end_date: '',
    image_url: '',
    shelter_id: shelterId,
    status: 'active' as const
  });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('shelter_projects')
        .select('*')
        .eq('shelter_id', shelterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shelterId) {
      fetchProjects();
    }
  }, [shelterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        shelter_id: shelterId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target_amount: parseFloat(formData.target_amount),
        current_amount: 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        image_url: formData.image_url || null,
        status: 'active' as const
      };

      const { error } = await supabase
        .from('shelter_projects')
        .insert([projectData]);

      if (error) throw error;

      toast.success('Project created successfully');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        target_amount: '',
        start_date: '',
        end_date: '',
        image_url: '',
        shelter_id: shelterId,
        status: 'active'
      });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as Project['category'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="food_supplies">Food Supplies</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount</Label>
            <Input
              id="target_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Project
          </Button>
        </form>
      )}

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground">No projects created yet.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{project.category.replace('_', ' ')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <p className="text-sm">{project.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((project.current_amount / project.target_amount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (project.current_amount / project.target_amount) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₱{project.current_amount.toLocaleString()}</span>
                  <span>₱{project.target_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Start: {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
                <span>End: {format(new Date(project.end_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 