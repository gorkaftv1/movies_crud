import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Bienvenido a Movies CRUD
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Gestiona tu colección de películas, crea playlists y guarda tus favoritas.
        </p>

        <div className="mb-8">
          <Link
            href="/movies"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Ver Todas las Películas
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link href="/movies" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">🎬 Películas</h3>
              <p className="text-gray-600">Explora y gestiona tu biblioteca de películas</p>
            </div>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow-md border opacity-75">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">📋 Playlists</h3>
            <p className="text-gray-600">Crea listas personalizadas de tus películas (próximamente)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border opacity-75">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">⭐ Favoritos</h3>
            <p className="text-gray-600">Marca y organiza tus películas favoritas (próximamente)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
