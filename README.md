# Movies CRUD

Una aplicación web completa para gestionar películas, playlists y favoritos con autenticación avanzada y arquitectura normalizada.

## 🚀 Tecnologías

- **Next.js 16** - Framework React con App Router y Turbopack
- **Supabase** - Base de datos PostgreSQL, autenticación y storage
- **TypeScript** - Tipado estático completo
- **Tailwind CSS** - Estilos modernos y responsive
- **Row Level Security** - Políticas de seguridad a nivel de base de datos

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
- Estructura normalizada con eliminación automática

### 🎨 Interfaz de Usuario
- Diseño responsive para móviles y escritorio
- Componentes reutilizables optimizados
- Estados de carga y manejo de errores
- Navegación intuitiva

## 🏗️ Arquitectura

### Estructura de Directorios
```
├── app/                     # Páginas (Next.js App Router)
│   ├── movies/             # Gestión de películas
│   ├── playlists/          # Sistema de playlists
│   ├── favorites/          # Películas favoritas
│   ├── add-movie/          # Formulario de creación
│   ├── login/              # Autenticación
│   └── profile/            # Perfil de usuario
├── components/             # Componentes reutilizables
│   ├── MovieCard.tsx       # Tarjeta de película
│   ├── PlaylistCard.tsx    # Tarjeta de playlist
│   ├── PlaylistForm.tsx    # Formulario unificado
│   └── Navbar.tsx          # Navegación
├── lib/                    # Lógica centralizada
│   ├── auth/              # Contexto de autenticación
│   ├── movies/            # Helpers de películas
│   ├── playlists/         # Helpers de playlists
│   ├── favorites/         # Helpers de favoritos
│   ├── users/             # Helpers de usuarios
│   ├── utils/             # Utilidades de storage
│   ├── supabase/          # Cliente y configuración
│   └── types/             # Definiciones de tipos
├── db/                     # Scripts SQL
│   ├── 01_schema.sql       # Esquema de base de datos
│   ├── 02_policies.sql     # Políticas RLS
│   ├── 03_seed.sql         # Datos de prueba
│   └── 04_playlist_movies_migration.sql # Migración a estructura normalizada
└── proxy.ts                # Protección de rutas (Next.js 16)
```

### Principios de Arquitectura
- **Separación por dominios** en `lib/` (SRP - Single Responsibility Principle)
- **Componentes reutilizables** con props tipadas
- **Hooks personalizados** para lógica compartida
- **Error boundaries** y manejo de estados
- **Optimistic updates** en favoritos

## 🗄️ Base de Datos

### Estructura Normalizada
- **`movies`** - Información de películas con metadatos completos
- **`playlists`** - Playlists con información del creador
- **`playlist_movies`** - Tabla de unión normalizada (many-to-many)
- **`user_favorites`** - Favoritos de usuarios
- **`profiles`** - Perfiles extendidos de usuarios

### Características
- **Foreign Keys con CASCADE DELETE** - Eliminación automática de referencias
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Índices optimizados** - Consultas eficientes
- **Storage buckets** - Gestión de archivos multimedia

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
-- 1. Esquema base
\i db/01_schema.sql

-- 2. Políticas de seguridad
\i db/02_policies.sql

-- 3. Datos de prueba (opcional)
\i db/03_seed.sql

-- 4. Migración a estructura normalizada
\i db/04_playlist_movies_migration.sql
```

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
- **Favoritos**: Gestión completa de favoritos
- **Playlists**: Crear playlists públicas/privadas, añadir/eliminar películas
- **Perfil**: Gestión de avatar y información personal

## 🔧 Funcionalidades Técnicas

### Autenticación Avanzada
- Contexto React optimizado con manejo de eventos
- Sesiones persistentes entre recargas
- Creación automática de perfiles
- Protección de rutas client y server-side

### Gestión de Estados
- Estados locales optimizados
- Actualizaciones optimistas
- Manejo de errores centralizado
- Loading states consistentes

### Optimizaciones
- Componentes memoizados
- Lazy loading de imágenes
- Debounced search
- Efficient re-renders prevention

## 📋 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 🚨 Migraciones

### Script de Migración de Playlists
El archivo `db/04_playlist_movies_migration.sql` migra la estructura de playlists de arrays JSON a una tabla normalizada:

- ✅ **De**: `playlists.movies` (array JSON)
- ✅ **A**: Tabla `playlist_movies` (relación many-to-many)
- ✅ **Beneficios**: Consultas eficientes, eliminación automática, escalabilidad

## 🎯 Próximas Mejoras

- [ ] Sistema de comentarios en películas
- [ ] Recomendaciones personalizadas
- [ ] Compartir playlists por URL
- [ ] Sistema de puntuaciones
- [ ] Filtros avanzados por género/director
- [ ] Modo offline con Service Workers

---

**Desarrollado con ❤️ usando Next.js 16 y Supabase**
