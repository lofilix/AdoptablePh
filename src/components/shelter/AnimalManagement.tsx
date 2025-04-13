'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimalForm } from '@/components/shelter/AnimalForm';
import { format } from 'date-fns';

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
  image_url: string;
  created_at: string;
  shelter_id: string;
}

interface AnimalManagementProps {
  shelterId: string;
}

export default function AnimalManagement({ shelterId }: AnimalManagementProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('shelter_id', shelterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalSubmitted = () => {
    setShowForm(false);
    setSelectedAnimal(null);
    fetchAnimals();
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Animals</h2>
        <Button onClick={() => setShowForm(true)}>Add New Animal</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimalForm
              animal={selectedAnimal}
              shelterId={shelterId}
              onSubmitted={handleAnimalSubmitted}
              onCancel={() => {
                setShowForm(false);
                setSelectedAnimal(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((animal) => (
          <Card key={animal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {animal.image_url && (
                <img
                  src={animal.image_url}
                  alt={animal.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardTitle className="flex justify-between items-center">
                <span>{animal.name}</span>
                <span className="text-sm font-normal px-2 py-1 bg-primary/10 rounded-full">
                  {animal.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-semibold">Type:</span> {animal.type}</p>
                <p><span className="font-semibold">Breed:</span> {animal.breed}</p>
                <p><span className="font-semibold">Age:</span> {animal.age} years</p>
                <p><span className="font-semibold">Added:</span> {format(new Date(animal.created_at), 'PPP')}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(animal)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {animals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No animals added yet.</p>
        </div>
      )}
    </div>
  );
} 