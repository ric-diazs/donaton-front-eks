/**
 * @module components/Navbar
 * @author Remi García, Ricardo Díaz
 * @description Barra de navegación global del sistema Donaton.
 *
 * Componente que se renderiza en todas las páginas públicas del sistema.
 * Es fija en la parte superior de la pantalla (sticky) con sombra para
 * mantener visibilidad al hacer scroll.
 *
 * Comportamiento según estado de autenticación:
 * - Sin sesión activa: muestra el botón "Ingresar al sistema" que redirige al login.
 * - Con sesión activa: muestra el nombre del usuario y el botón "Cerrar sesión".
 *   Al hacer clic en el nombre, redirige al panel correspondiente según el rol:
 *   ADMIN → /admin, COORDINADOR → /coordinador, VOLUNTARIO → /voluntario.
 *
 * Versión móvil:
 * - Oculta los enlaces y el botón de escritorio.
 * - Muestra un botón de menú hamburguesa que despliega un menú vertical.
 * - El estado del menú (abierto/cerrado) se controla con menuAbierto.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Barra de navegación global con soporte para escritorio y móvil.
 * Consume el AuthContext para mostrar opciones según el estado de sesión.
 *
 * @returns Elemento nav con logo, enlaces de navegación y botón de acceso al sistema.
 */
export default function Navbar() {
  /**
   * Controla la visibilidad del menú móvil.
   * true cuando el menú hamburguesa está desplegado, false cuando está cerrado.
   */
  const [menuAbierto, setMenuAbierto] = useState(false)

  const { isAuthenticated, usuario, logout } = useAuth()
  const navigate = useNavigate()

  /**
   * Maneja el clic en el botón de acceso al sistema.
   * Si hay sesión activa, redirige al panel correspondiente según el rol del usuario.
   * Si no hay sesión, redirige al login para autenticarse.
   */
  const handleIngresar = () => {
    if (isAuthenticated && usuario) {
      if (usuario.rol === 'ADMIN')       navigate('/admin')
      if (usuario.rol === 'COORDINADOR') navigate('/coordinador')
      if (usuario.rol === 'VOLUNTARIO')  navigate('/voluntario')
    } else {
      navigate('/login')
    }
  }

  return (
    <nav className="bg-navy w-full sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo con enlace a la página de inicio */}
        <Link to="/" className="text-white text-xl font-bold tracking-widest">
          <img src="image/Donaton_Logo.png" alt="Donaton" className="w-45 h-20 inline-block mr-2 -mt-1"/>
        </Link>

        {/* Enlaces de navegación — solo visibles en escritorio */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#como-funciona"
            className="text-gray-300 hover:text-teal text-sm transition-colors duration-200"
          >
            Cómo funciona
          </a>
          <a
            href="#mision"
            className="text-gray-300 hover:text-teal text-sm transition-colors duration-200"
          >
            Impacto
          </a>
          <Link
            to="/contacto"
            className="text-gray-300 hover:text-teal text-sm transition-colors duration-200"
          >
            Contacto
          </Link>
        </div>

        {/* Botón de acceso al sistema — solo visible en escritorio */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Nombre del usuario autenticado */}
              <span className="text-gray-300 text-sm">
                {usuario?.nombre}
              </span>
              {/* Botón para cerrar sesión */}
              <button
                onClick={logout}
                className="text-sm text-gray-300 hover:text-coral transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            /* Botón de ingreso al sistema cuando no hay sesión */
            <button
              onClick={handleIngresar}
              className="bg-teal text-navy text-sm font-semibold px-5 py-2.5 rounded-lg
                         hover:bg-teal/90 transition-all duration-200"
            >
              Ingresar al sistema
            </button>
          )}
        </div>

        {/* Botón hamburguesa — solo visible en móvil */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuAbierto
              /* Ícono X cuando el menú está abierto */
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              /* Ícono hamburguesa cuando el menú está cerrado */
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>

      </div>

      {/* Menú desplegable móvil — solo visible cuando menuAbierto es true */}
      {menuAbierto && (
        <div className="md:hidden bg-navy border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <a href="#como-funciona" className="text-gray-300 text-sm hover:text-teal">
            Cómo funciona
          </a>
          <a href="#mision" className="text-gray-300 text-sm hover:text-teal">
            Impacto
          </a>
          <Link
            to="/contacto"
            className="text-gray-300 text-sm hover:text-teal"
            onClick={() => setMenuAbierto(false)}
          >
            Contacto
          </Link>
          {/* Botón de acceso en versión móvil */}
          <button
            onClick={handleIngresar}
            className="bg-teal text-navy text-sm font-semibold px-5 py-2.5 rounded-lg w-full"
          >
            Ingresar al sistema
          </button>
        </div>
      )}
    </nav>
  )
}
