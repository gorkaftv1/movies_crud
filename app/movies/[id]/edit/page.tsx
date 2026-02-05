import EditMovieForm from "../../../../components/movies/EditMovieForm";

interface EditMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMoviePage({ params }: EditMoviePageProps) {
  const { id } = await params;
  return <EditMovieForm movieId={id} />;
}
