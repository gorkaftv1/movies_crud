// app/movies/[id]/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { getUserPlaylists, getPlaylistsContainingMovie } from "../../../lib/playlists";
import { isMovieFavorited } from "../../../lib/favorites";
import MovieDetailClient from "../../../components/movies/MoviesDetailClient";

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const movieId = resolvedParams.id;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch movie details server-side
  const { data: movieData, error: movieError } = await supabase
    .from("movies")
    .select("*, profiles(username)")
    .eq("id", movieId)
    .single();

  if (movieError || !movieData) {
    redirect("/movies");
  }

  let isFav = false;
  let playlists: any[] = [];
  let playlistsWithMovie: string[] = [];

  if (user) {
    // Check if favorited
    const { isFavorited } = await isMovieFavorited(supabase, movieId);
    isFav = isFavorited;

    // Get user playlists
    playlists = await getUserPlaylists(supabase, user.id);

    // Get playlists containing this movie
    playlistsWithMovie = await getPlaylistsContainingMovie(supabase, movieId, user.id);
  }

  return (
    <MovieDetailClient
      initialMovie={movieData}
      initialIsFav={isFav}
      initialPlaylists={playlists}
      initialPlaylistsWithMovie={playlistsWithMovie}
      isOwner={user?.id === movieData.user_id}
      currentUserId={user?.id}
    />
  );
}