/**
 * @module components/ProtegeRutas
 * @author Remi García
 * @author Ricardo Diaz
 * @description Componente guardia de rutas para el sistema de autenticación de Donaton.
 *@
 * Implementa el patrón Route Guard con verificación en dos niveles:
 * 1. Autenticación: si el usuario no tiene sesión activa, redirige a /login.
 * 2. Autorización por rol (RBAC): si la ruta requiere un rol específico y el
 *    usuario no lo tiene, redirige a /login.
 *
 * Distribución de acceso por rol en el sistema:
 * - /admin = ADMIN
 * - /coordinador = ADMIN, COORDINADOR
 * - /voluntario = ADMIN, COORDINADOR, VOLUNTARIO
 *
 * Se usa en App.tsx envolviendo cada ruta privada, garantizando que ningún
 * usuario no autenticado pueda acceder aunque escriba la URL directamente.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Usuario } from '../types'

/**
 * @interface Props
 * @description Props del componente ProtegeRutas.
 */
interface Props {
  /** Componente o página a proteger. */
  children: React.ReactNode
  /**
   * Roles con acceso permitido a esta ruta.
   * Si se omite, cualquier usuario autenticado puede acceder.
   * Si se especifica, solo los usuarios con uno de esos roles pueden pasar.
   */
  roles?: Usuario['rol'][]
}

/**
 * Guardia de rutas con verificación de autenticación y autorización por rol.
 *
 * Flujo de verificación:
 * 1. Sin sesión activa y redirige a /login.
 * 2. Rol no permitido y redirige a /login.
 * 3. Acceso concedido y renderiza children.
 *
 * @param children - Página o componente a proteger.
 * @param roles - Roles con acceso permitido (opcional).
 * @returns El contenido protegido o una redirección a /login.
 *
 * @example
 * // Solo ADMIN puede acceder
 * <ProtegeRutas roles={['ADMIN']}>
 *   <AdminDash />
 * </ProtegeRutas>
 *
 * @example
 * // ADMIN y COORDINADOR pueden acceder
 * <ProtegeRutas roles={['ADMIN', 'COORDINADOR']}>
 *   <CoordinadorPanel />
 * </ProtegeRutas>
 *
 * @example
 * // Cualquier usuario autenticado puede acceder
 * <ProtegeRutas>
 *   <VoluntarioPanel />
 * </ProtegeRutas>
 */
export default function ProtegeRutas({ children, roles }: Props) {
  const { isAuthenticated, usuario } = useAuth()

  // Verificación 1: autenticación sin sesión activa, redirige al login
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Verificación 2: autorización por rol si el rol no está permitido, redirige al login
  if (roles && usuario && !roles.includes(usuario.rol)) {
    return <Navigate to="/login" replace />
  }

  // Acceso concedido y renderiza el contenido protegido
  return <>{children}</>
}
