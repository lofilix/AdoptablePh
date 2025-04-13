'use client'

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  weight: number;
  description: string;
  medical_history: string;
  behavior_notes: string;
  special_needs: string;
  status: string;
  image_url?: string;
  shelter_id: string;
}

interface AnimalFormProps {
  shelterId: string;
  animal?: Animal | null;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function AnimalForm({ shelterId, animal, onSubmitted, onCancel }: AnimalFormProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: animal?.name || '',
    type: animal?.type || 'dog',
    breed: animal?.breed || '',
    age: animal?.age || 0,
    gender: animal?.gender || 'male',
    size: animal?.size || 'medium',
    weight: animal?.weight || 0,
    description: animal?.description || '',
    medical_history: animal?.medical_history || '',
    behavior_notes: animal?.behavior_notes || '',
    special_needs: animal?.special_needs || '',
    status: animal?.status || 'available',
    image_url: animal?.image_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = formData.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${shelterId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('animal-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('animal-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const animalData = {
        ...formData,
        shelter_id: shelterId,
        image_url
      };

      if (animal?.id) {
        const { error } = await supabase
          .from('animals')
          .update(animalData)
          .eq('id', animal.id);

        if (error) throw error;
        toast.success('Animal updated successfully');
      } else {
        const { error } = await supabase
          .from('animals')
          .insert(animalData);

        if (error) throw error;
        toast.success('Animal added successfully');
      }

      onSubmitted();
    } catch (error) {
      toast.error('Error saving animal');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">Dog</SelectItem>
            <SelectItem value="cat">Cat</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="breed">Breed</Label>
        <Input
          id="breed"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="age">Age (years)</Label>
        <Input
          id="age"
          type="number"
          min="0"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="size">Size</Label>
        <Select
          value={formData.size}
          onValueChange={(value) => setFormData({ ...formData, size: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          min="0"
          step="0.1"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="medical_history">Medical History</Label>
        <Textarea
          id="medical_history"
          value={formData.medical_history}
          onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="behavior_notes">Behavior Notes</Label>
        <Textarea
          id="behavior_notes"
          value={formData.behavior_notes}
          onChange={(e) => setFormData({ ...formData, behavior_notes: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="special_needs">Special Needs</Label>
        <Textarea
          id="special_needs"
          value={formData.special_needs}
          onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="adopted">Adopted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : animal ? 'Update Animal' : 'Add Animal'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
} 