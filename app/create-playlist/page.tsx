import { redirect } from 'next/navigation';
import CreatePlaylistClient from '../../components/playlists/CreatePlaylistClient';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent('/create-playlist')}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreatePlaylistClient />
    </div>
  );
}