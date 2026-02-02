# Movies CRUD

Una aplicación web para gestionar una colección de películas con autenticación y subida de imágenes.

## Tecnologías

- **Next.js 16** - Framework React
- **Supabase** - Base de datos y autenticación
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos

## Funcionalidades

- 🔐 **Autenticación** - Login/registro de usuarios
- 🎬 **Gestión de películas** - Añadir, ver películas
- 📸 **Subida de imágenes** - Carátulas con vista previa
- 📱 **Responsive** - Adaptado a móviles

## Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Variables de entorno** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Base de datos** - Ejecutar en Supabase:
   ```sql
   -- db/init.sql
   -- db/storage_public.sql
   -- db/public_policies.sql
   ```

4. **Ejecutar**:
   ```bash
   npm run dev
   ```

## Uso

- **Página principal**: Ver información general
- **Películas** (`/movies`): Galería de todas las películas
- **Añadir película** (`/add-movie`): Formulario para usuarios autenticados
- **Login/Registro**: Autenticación de usuarios

## Estructura

```
├── app/                 # Páginas (App Router)
├── components/          # Componentes React
├── db/                  # Scripts SQL
├── lib/supabase/        # Configuración Supabase
└── middleware.ts        # Protección de rutas
```
