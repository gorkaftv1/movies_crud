// app/playlists/[id]/page.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { getPlaylistWithDetails } from "../../../lib/playlists";
import PlaylistDetailClient from "../../../components/playlists/PlaylistDetailClient";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const playlistId = resolvedParams.id;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch playlist data server-side
  const { data, error } = await getPlaylistWithDetails(supabase, playlistId, user);

  if (error || !data) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div
              className="border px-4 py-3 rounded max-w-md mx-auto mb-4"
              style={{
                backgroundColor: "rgba(198, 40, 40, 0.1)",
                borderColor: "rgba(198, 40, 40, 0.2)",
                color: "rgb(183, 28, 28)",
              }}
            >
              {error || "Playlist no encontrada"}
            </div>
            <a
              href="/playlists"
              className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700"
              style={{ backgroundColor: "rgb(198, 40, 40)" }}
            >
              Volver a Playlists
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlaylistDetailClient
      initialPlaylist={data.playlist}
      initialMovies={data.movies}
      isOwner={data.isOwner}
      currentUserId={user?.id}
    />
  );
}