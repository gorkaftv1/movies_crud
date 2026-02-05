import { redirect } from 'next/navigation';
import AddMovieForm from '../../components/movies/AddMovieForm';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent('/add-movie')}`);
  }

  return <AddMovieForm />;
}