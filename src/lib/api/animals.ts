import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type { Animal, AnimalPhoto, AdoptionApplication, StatusChange } from '@/types/supabase';

const supabase = createClient();

type Tables = Database['public']['Tables'];
type AnimalRow = Tables['animals']['Row'];
type AnimalInsert = Tables['animals']['Insert'];
type AnimalUpdate = Tables['animals']['Update'];
type AdoptionApplicationRow = Tables['adoption_applications']['Row'];
type AdoptionApplicationInsert = Tables['adoption_applications']['Insert'];
type AnimalPhotoRow = Tables['animal_photos']['Row'];
type AnimalPhotoInsert = Tables['animal_photos']['Insert'];
type StatusChangeRow = Tables['status_changes']['Row'];

export async function getAnimalWithPhotos(animalId: string) {
  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .select('*')
    .eq('id', animalId)
    .single();

  if (animalError) throw animalError;

  const { data: photos, error: photosError } = await supabase
    .from('animal_photos')
    .select('*')
    .eq('animal_id', animalId)
    .order('is_primary', { ascending: false });

  if (photosError) throw photosError;

  return {
    ...animal,
    photos: photos || []
  } as AnimalRow & { photos: AnimalPhotoRow[] };
}

export async function createAdoptionApplication(
  animalId: string,
  userId: string,
  applicationData: AdoptionApplicationRow['application_data']
): Promise<AdoptionApplicationRow> {
  const { data, error } = await supabase
    .from('adoption_applications')
    .insert({
      animal_id: animalId,
      user_id: userId,
      application_data: applicationData,
      status: 'pending'
    } satisfies AdoptionApplicationInsert)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create application');
  return data;
}

export async function updateAnimalStatus(
  animalId: string,
  newStatus: AnimalRow['status'],
  notes?: string
): Promise<AnimalRow> {
  const { data, error } = await supabase
    .from('animals')
    .update({ status: newStatus } satisfies AnimalUpdate)
    .eq('id', animalId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update animal status');
  return data;
}

export async function uploadAnimalPhoto(
  animalId: string,
  file: File,
  isPrimary: boolean = false
): Promise<AnimalPhotoRow> {
  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${animalId}/${Date.now()}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('animal-photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('animal-photos')
    .getPublicUrl(fileName);

  // Create photo record
  const { data, error: photoError } = await supabase
    .from('animal_photos')
    .insert({
      animal_id: animalId,
      url: publicUrl,
      is_primary: isPrimary,
      metadata: {
        size: file.size,
        description: file.name,
        tags: [file.type]
      }
    } satisfies AnimalPhotoInsert)
    .select()
    .single();

  if (photoError) throw photoError;
  if (!data) throw new Error('Failed to create photo record');
  return data;
}

export async function getAnimalStatusHistory(animalId: string): Promise<StatusChangeRow[]> {
  const { data, error } = await supabase
    .from('status_changes')
    .select('*')
    .eq('entity_type', 'animal')
    .eq('entity_id', animalId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];
  return data;
}

export async function getAdoptionApplications(
  animalId: string,
  status?: AdoptionApplicationRow['status']
): Promise<AdoptionApplicationRow[]> {
  let query = supabase
    .from('adoption_applications')
    .select('*')
    .eq('animal_id', animalId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];
  return data;
}

export async function reviewAdoptionApplication(
  applicationId: string,
  status: 'approved' | 'rejected',
  reviewNotes: string
): Promise<AdoptionApplicationRow> {
  const { data, error } = await supabase
    .from('adoption_applications')
    .update({
      status,
      review_notes: reviewNotes,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      reviewed_at: new Date().toISOString()
    } satisfies Partial<AdoptionApplicationRow>)
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update application');
  return data;
} 