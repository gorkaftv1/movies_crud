# Movies CRUD

Una aplicación web completa para gestionar películas, playlists y favoritos con autenticación avanzada, arquitectura normalizada y patrón híbrido Server/Client Components.

## 🚀 Tecnologías

- **Next.js 15** - Framework React con App Router, Server Components y Server Actions
- **Supabase** - Base de datos PostgreSQL, autenticación con Row Level Security
  - `@supabase/ssr` - Manejo de sesiones con cookies seguras
  - `@supabase/supabase-js` - Cliente y tipos de TypeScript
- **TypeScript** - Tipado estático completo con tipos unificados
- **Tailwind CSS** - Estilos modernos y responsive
- **React 19** - Server/Client Components pattern

## ✨ Funcionalidades

### 🔐 Autenticación
- Login/registro de usuarios con gestión de sesiones
- Perfiles de usuario con avatares personalizados
- Protección de rutas y políticas RLS
- Recuperación de contraseñas

### 🎬 Gestión de Películas
- CRUD completo de películas con metadatos
- Subida de carátulas con vista previa
- Búsqueda y filtrado
- Información detallada (director, duración, descripción, etc.)

### ❤️ Sistema de Favoritos
- Marcar/desmarcar películas como favoritas
- Vista de películas favoritas del usuario
- Integración en todas las vistas

### 🎵 Playlists Avanzadas
- Creación de playlists públicas y privadas
- Gestión de películas en playlists (añadir/eliminar)
- Vista detallada con información del creador

### 🎨 Interfaz de Usuario
- Diseño responsive para móviles y escritorio
- Componentes reutilizables optimizados
- Estados de carga y manejo de errores
- Navegación intuitiva

## 🏗️ Arquitectura

### Patrón Híbrido Server/Client Components

Esta aplicación implementa el **patrón recomendado de Next.js 15**:

- **Server Components** (por defecto):
  - Obtienen datos del servidor usando `createServerClient()` 
  - Acceden a cookies mediante `next/headers`
  - Manejan páginas que dependen de sesión (`/playlists`, `/favorites`, `/movies/[id]`)
  - Mejoran el rendimiento (menos JavaScript enviado al cliente)
  
- **Client Components** (`"use client"`):
  - Manejan interactividad (botones, formularios, estados locales)
  - Usan el `AuthContext` para acceder a sesión/perfil globalmente
  - Implementan mutaciones y actualizaciones optimistas
  - Ejemplos: `MovieCard`, `PlaylistDetailClient`, `Navbar`

### Gestión de Clientes Supabase

- **`lib/supabase/server.ts`**: Factory `createServerSupabaseClient()` para Server Components
- **`lib/supabase/client.ts`**: Singleton `supabase` para Client Components
- **CRUD Libraries**: Funciones que aceptan `SupabaseClient` como parámetro (reutilizables en cualquier contexto)

### Estructura de Directorios
```
├── app/                     # Páginas (Next.js App Router)
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout raíz con AuthProvider
│   ├── page.tsx             # Página de inicio
│   ├── add-movie/           # Crear nueva película (Client)
│   │   └── page.tsx
│   ├── create-playlist/     # Crear nueva playlist (Client)
│   │   └── page.tsx
│   ├── favorites/           # Películas favoritas (Server Component)
│   │   └── page.tsx
│   ├── login/               # Autenticación (Client)
│   │   └── page.tsx
│   ├── movies/              # Gestión de películas
│   │   ├── page.tsx         # Lista de películas
│   │   └── [id]/            # Detalle de película (Server Component)
│   │       ├── page.tsx
│   │       └── edit/        # Editar película (Client)
│   │           └── page.tsx
│   ├── playlists/           # Sistema de playlists
│   │   ├── page.tsx         # Lista de playlists (Server Component)
│   │   └── [id]/            # Detalle de playlist (Server Component)
│   │       ├── page.tsx
│   │       └── edit/        # Editar playlist (Client)
│   │           └── page.tsx
│   ├── profile/             # Perfil de usuario (Client)
│   │   └── page.tsx
│   ├── register/            # Registro de usuarios (Client)
│   │   └── page.tsx
│   └── reset-password/      # Recuperación de contraseña (Client)
│       └── page.tsx
├── components/
│   ├── favorites/           # Componentes de favoritos
│   │   └── FavoritesClient.tsx  # Wrapper client para página de favoritos
│   ├── global/              # Componentes globales compartidos
│   │   ├── Icons.tsx        # Iconos SVG
│   │   └── Navbar.tsx       # Barra de navegación
│   ├── movies/              # Componentes de películas
│   │   ├── AddMovieForm.tsx # Formulario de creación de película
│   │   ├── EditMovieForm.tsx# Formulario de edición de película
│   │   ├── MovieCard.tsx    # Tarjeta de película
│   │   ├── MoviesDetailClient.tsx # Wrapper client para detalle de película
│   │   ├── MovieSearchBar.tsx # Barra de búsqueda de películas
│   │   └── MoviesList.tsx   # Lista de películas con grid
│   └── playlists/           # Componentes de playlists
│       ├── CreatePlaylistClient.tsx # Wrapper client para crear playlist
│       ├── EditPlaylistForm.tsx # Formulario de edición de playlist
│       ├── PlaylistCard.tsx # Muestra contador de películas
│       ├── PlaylistDetailClient.tsx # Wrapper client para detalle de playlist
│       └── PlaylistForm.tsx # Formulario de playlists
├── db/                      # Scripts SQL (ejecutar en orden)
│   ├── 01_schema.sql        # Esquema completo (con playlist_movies)
│   ├── 02_policies.sql      # Políticas RLS completas
│   └── 03_seed.sql          # Datos de prueba (opcional)
├── email-templates/         # Templates HTML para emails
│   ├── confirm-email.html   # Confirmación de email
│   └── reset-password.html  # Recuperación de contraseña
├── lib/                     # Lógica centralizada
│   ├── auth/              
│   │   └── AuthContext.tsx  # Contexto global con manejo robusto de cookies
│   ├── favorites/         
│   │   └── index.ts         # CRUD
│   ├── movies/            
│   │   └── index.ts         # CRUD
│   ├── playlists/         
│   │   └── index.ts         
│   ├── supabase/          
│   │   ├── client.ts        # Singleton browser client
│   │   └── server.ts        # Factory para server client
│   ├── types/             
│   │   └── index.ts         # Movie, Playlist, User
│   ├── users/             
│   │   └── index.ts         # Helpers de usuarios
│   └── utils/             
│       └── index.ts         # Utilidades de storage
├── public/                  # Archivos estáticos
└── proxy.ts                 # Middleware de protección de rutas
```

### Principios de Arquitectura
- **Server Components First** - Renderizado del servidor para mejor rendimiento
- **CRUD Environment-Agnostic** - Librerías que aceptan `SupabaseClient` como parámetro
- **Separación por dominios** en `lib/` (SRP - Single Responsibility Principle)
- **Componentes reutilizables** con props opcionales para diferentes contextos
- **Sistema de tipos unificado** - `Movie` con `is_favorited: boolean` siempre presente
- **Manejo robusto de sesiones** - AuthContext con recuperación automática ante problemas de sincronización
- **Optimistic updates** en favoritos y eliminaciones

## 🗄️ Base de Datos

### Estructura Normalizada
- **`movies`** - Información de películas con metadatos completos
- **`playlists`** - Playlists con información del creador
- **`playlist_movies`** - Tabla de unión normalizada (many-to-many)
- **`user_favorites`** - Favoritos de usuarios
- **`profiles`** - Perfiles extendidos de usuarios

### Características
- **Foreign Keys con CASCADE DELETE** - Eliminación automática de referencias
- **Row Level Security (RLS)** - Seguridad a nivel de fila con políticas granulares
- **Índices optimizados** - Consultas eficientes con joins
- **Agregaciones** - Conteo de películas en playlists mediante `playlist_movies(count)`
- **Storage buckets** - Gestión de archivos multimedia (portraits, avatars)

## 🚀 Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configurar base de datos
Ejecutar en orden en Supabase SQL Editor:
```sql
-- 1. Esquema completo (incluye playlist_movies)
\i db/01_schema.sql

-- 2. Políticas de seguridad (incluye RLS para playlist_movies)
\i db/02_policies.sql

-- 3. Datos de prueba (opcional) - Reemplaza 'YOUR_USER_ID' con tu UUID
\i db/03_seed.sql
```

**Nota**: El esquema ya incluye la estructura normalizada con la tabla `playlist_movies`. No es necesario ejecutar migraciones.

### 4. Configurar Storage
En Supabase Dashboard:
- Crear bucket `portraits` (public)
- Crear bucket `avatars` (public)
- Configurar políticas de subida

### 5. Ejecutar aplicación
```bash
npm run dev
```

## 📱 Funcionalidades Principales

### Para Usuarios No Autenticados
- Ver catálogo de películas públicas
- Ver detalles de películas
- Ver playlists públicas
- Registro e inicio de sesión

### Para Usuarios Autenticados
- **Películas**: Crear, editar, eliminar películas propias
- **Favoritos**: Gestión completa de favoritos con actualizaciones optimistas
- **Playlists**: 
  - Crear playlists públicas/privadas
  - Añadir películas desde la vista de detalle
  - Eliminar películas con botón "Quitar de esta playlist" en tarjetas
  - Ver contador de películas en cada playlist
- **Perfil**: Gestión de avatar y información personal

## 📋 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
```