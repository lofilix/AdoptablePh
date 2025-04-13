export default function ShelterProjectsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shelter Projects</h1>
      <p>Shelter ID: {params.id}</p>
    </div>
  )
} 