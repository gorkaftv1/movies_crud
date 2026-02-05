// app/favorites/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { getMoviesWithFavorites } from "../../lib/favorites";
import FavoritesClient from "../../components/favorites/FavoritesClient";

export default async function FavoritesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch favorites server-side
  const { data, error } = await getMoviesWithFavorites(supabase);

  if (error) {
    console.error("Error fetching favorites:", error);
  }

  // Filter only favorited movies
  const favoritedMovies = data?.filter((movie) => movie.is_favorited) || [];

  return <FavoritesClient initialFavorites={favoritedMovies} />;
}