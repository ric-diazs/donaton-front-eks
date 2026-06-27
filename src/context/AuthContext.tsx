/**
 * @module context/AuthContext
 * @author Remi García
 * @description Contexto global de autenticación para el sistema Donaton.
 *
 * Implementa el patrón Context API de React para compartir el estado de sesión
 * del usuario a través de todos los componentes sin prop drilling.
 *
 * Provee:
 * - El objeto usuario autenticado con su rol (ADMIN, COORDINADOR, VOLUNTARIO).
 * - El token JWT de la sesión activa.
 * - Las funciones login() y logout() para gestionar el ciclo de sesión.
 * - El flag isAuthenticated para verificar si hay una sesión activa.
 *
 * La persistencia de sesión se logra guardando el token y el usuario en
 * localStorage, restaurando la sesión automáticamente al recargar la página.
 */

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '../types'

/**
  @interface AuthContextType
  @description Contrato del contexto de autenticación.
  Define los valores y funciones disponibles para los componentes
  que consuman este contexto mediante el hook useAuth().
 */
interface AuthContextType {
  /** Datos del usuario autenticado. null si no hay sesión activa. */
  usuario: Usuario | null
  /** Token JWT activo. null si no hay sesión. */
  token: string | null
  /**
    Inicia sesión persistiendo token y usuario en localStorage y estado React.
    @param token - Token JWT generado por el backend.
    @param usuario - Objeto usuario con id, nombre, apellido, correo y rol.
   */
  login: (token: string, usuario: Usuario) => void
  /** Cierra sesión eliminando token y usuario de localStorage y estado. */
  logout: () => void
  /** true si existe un token activo. false si no hay sesión. */
  isAuthenticated: boolean
}

/**
  Contexto de autenticación inicializado en null.
  Si un componente intenta usarlo fuera del AuthProvider,
  el hook useAuth() lanzará un error descriptivo.
 */
const AuthContext = createContext<AuthContextType | null>(null)

/**
  Proveedor del contexto de autenticación.
  Debe envolver toda la aplicación en App.tsx para que useAuth()
  funcione en cualquier componente hijo. 
 * @param children - Árbol de componentes con acceso al contexto.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  /** Token JWT restaurado desde localStorage al iniciar la aplicación. */
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('donaton_token')
  )

  /** Datos del usuario restaurados desde localStorage al iniciar la aplicación. */
  const [usuario, setUsuario] = useState<Usuario | null>(
    JSON.parse(localStorage.getItem('donaton_usuario') || 'null')
  )

  /**
    Inicia sesión con el token y usuario recibidos del backend.
    Persiste ambos en localStorage para sobrevivir recargas de página.
   
    @param newToken - Token JWT generado por el backend.
    @param newUsuario - Objeto usuario con id, nombre, apellido, correo y rol.
   */
  const login = (newToken: string, newUsuario: Usuario) => {
    localStorage.setItem('donaton_token', newToken)
    localStorage.setItem('donaton_usuario', JSON.stringify(newUsuario))
    setToken(newToken)
    setUsuario(newUsuario)
  }

  /**
    Cierra la sesión del usuario.
    Elimina el token y los datos del usuario de localStorage y del estado React,
    provocando que isAuthenticated sea false y ProtegeRutas redirija al login.
   */
  const logout = () => {
    localStorage.removeItem('donaton_token')
    localStorage.removeItem('donaton_usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      login,
      logout,
      isAuthenticated: !!token  // true si token no es null ni string vacío
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
  Hook personalizado para consumir el contexto de autenticación.
  Simplifica el acceso al contexto desde cualquier componente funcional.
 
  @throws {Error} Si se usa fuera del AuthProvider.
  @returns El contexto con usuario, token, login, logout e isAuthenticated.
 
  @example
  const { usuario, logout, isAuthenticated } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
