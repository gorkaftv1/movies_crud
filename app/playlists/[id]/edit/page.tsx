import EditPlaylistForm from "@/components/EditPlaylistForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlaylistPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8" style={{backgroundColor: 'rgb(250 250 250)', minHeight: '100vh'}}>
      <EditPlaylistForm playlistId={id} />
    </div>
  );
}
