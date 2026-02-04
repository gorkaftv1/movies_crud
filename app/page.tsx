import Link from "next/link";
import { MovieIcon, PlaylistIcon, HeartIcon } from "@/components/Icons";

export default function Home() {
  return (
    <div className="min-h-screen" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6" style={{color: 'rgb(198, 40, 40)'}}>
            Movies CRUD
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Gestiona tu colección de películas, crea tu biblioteca personal y comparte tus descubrimientos cinematográficos.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Link href="/movies" className="group">
              <div className="p-8 text-center rounded-lg shadow-lg transition-all group-hover:shadow-xl group-hover:border-red-200 border border-transparent" style={{backgroundColor: 'white'}}>
                <div className="flex justify-center mb-4">
                  <MovieIcon size={48} color="rgb(198, 40, 40)" />
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors" style={{color: 'rgb(198, 40, 40)'}}>
                  Películas
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explora y gestiona tu biblioteca de películas con carátulas y detalles completos
                </p>
              </div>
            </Link>
            <Link href="/playlists" className="group">
              <div className="p-8 text-center rounded-lg shadow-lg transition-all group-hover:shadow-xl group-hover:border-red-200 border border-transparent" style={{backgroundColor: 'white'}}>
                <div className="flex justify-center mb-4">
                  <PlaylistIcon size={48} color="rgb(198, 40, 40)" />
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors" style={{color: 'rgb(198, 40, 40)'}}>
                  Playlists
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Crea listas personalizadas de tus películas favoritas
                </p>
              </div>
            </Link>
            <Link href="/favorites" className="group">
              <div className="p-8 text-center rounded-lg shadow-lg transition-all group-hover:shadow-xl group-hover:border-red-200 border border-transparent" style={{backgroundColor: 'white'}}>
                <div className="flex justify-center mb-4">
                  <HeartIcon size={48} color="rgb(198, 40, 40)" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">
                  Favoritos
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Marca y organiza tus películas más queridas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
