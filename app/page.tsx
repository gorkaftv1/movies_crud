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

          <div className="mb-12">
            <Link
              href="/movies"
              className="inline-block text-lg px-8 py-4 rounded-lg text-white font-medium transition-colors hover:bg-red-700"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              Explorar Películas
            </Link>
          </div>

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
            
            <div className="p-8 text-center opacity-60 rounded-lg shadow-lg" style={{backgroundColor: 'white'}}>
              <div className="flex justify-center mb-4">
                <PlaylistIcon size={48} color="rgb(156, 163, 175)" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                Playlists
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crea listas personalizadas de tus películas favoritas
                <span className="block text-sm mt-2 font-medium" style={{color: 'rgb(198, 40, 40)'}}>Próximamente</span>
              </p>
            </div>
            
            <div className="p-8 text-center opacity-60 rounded-lg shadow-lg" style={{backgroundColor: 'white'}}>
              <div className="flex justify-center mb-4">
                <HeartIcon size={48} color="rgb(156, 163, 175)" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                Favoritos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Marca y organiza tus películas más queridas
                <span className="block text-sm mt-2 font-medium" style={{color: 'rgb(198, 40, 40)'}}>Próximamente</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
