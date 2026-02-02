import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Rutas protegidas que requieren autenticación
  const protectedPaths = ['/add-movie', '/profile'];
  const { pathname } = req.nextUrl;
  
  // Verificar si la ruta actual es protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Verificar si existe algún token de autenticación en las cookies
    // Supabase almacena el token con un patrón específico
    const cookies = req.cookies.getAll();
    
    // Buscar cookies que contengan tokens de Supabase
    const hasAuthToken = cookies.some(cookie => 
      cookie.name.includes('supabase-auth-token') || 
      cookie.name.includes('sb-') && cookie.name.includes('auth-token') ||
      (cookie.name.includes('access_token') || cookie.name.includes('refresh_token')) && cookie.value
    );
    
    if (!hasAuthToken) {
      // Redirigir al login si no hay token
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Middleware deshabilitado - usando verificación del lado cliente
    // '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};