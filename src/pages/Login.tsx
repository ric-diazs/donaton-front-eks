/**
 * @module pages/Login
 * @author Remi García
 * @author Ricardo Diaz
 * @description Página de inicio de sesión para el sistema de gestión de Donaton.
 *
 * Esta página corresponde al caso de uso UC4 del diagrama de casos de uso.
 * Es accesible por los tres actores internos del sistema: Admin, Coordinador y Voluntario.
 *
 * Flujo de autenticación:
 * 1. El usuario ingresa su correo y contraseña.
 * 2. Selecciona su rol mediante el selector temporal.
 * 3. Al hacer clic en "Ingresar", se valida que los campos no estén vacíos.
 * 4. Se genera un token de sesión simulado y un objeto de usuario de prueba.
 * 5. Se llama a login() del AuthContext para guardar la sesión.
 * 6. Se redirige al panel correspondiente según el rol seleccionado.
 *
 * Nota de implementación: el selector de rol y el token simulado son temporales.
 * Cuando el backend implemente el endpoint POST /api/auth/login con validación
 * de contraseña y generación de token JWT real, esta lógica se reemplazará
 * por una petición real al backend que retorne el token y el rol del usuario.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Tipo que representa los roles disponibles en el sistema.
 * Coincide con el enum Rol definido en el schema de Prisma del backend.
 */
type Rol = 'ADMIN' | 'COORDINADOR' | 'VOLUNTARIO'

/**
 * Lista de roles disponibles para el selector temporal.
 * Cada elemento tiene el valor interno del rol y la etiqueta en español
 * que se muestra al usuario en los botones de selección.
 */
const roles: { valor: Rol; etiqueta: string }[] = [
  { valor: 'ADMIN',       etiqueta: 'Administrador' },
  { valor: 'COORDINADOR', etiqueta: 'Coordinador' },
  { valor: 'VOLUNTARIO',  etiqueta: 'Voluntario' },
]

/**
 * Página de inicio de sesión del sistema Donaton.
 * Permite a los usuarios internos autenticarse y acceder a su panel correspondiente.
 *
 * @returns Formulario de login centrado en pantalla con fondo navy.
 */
export default function Login() {
  /** Correo electrónico ingresado por el usuario en el formulario. */
  const [correo, setCorreo] = useState('')

  /** Contraseña ingresada por el usuario en el formulario. */
  const [password, setPassword] = useState('')

  /** Rol seleccionado mediante el selector temporal. Por defecto ADMIN. */
  const [rol, setRol] = useState<Rol>('ADMIN')

  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Maneja el intento de inicio de sesión.
   * Valida que los campos no estén vacíos, genera una sesión simulada
   * y redirige al panel correspondiente según el rol seleccionado.
   *
   * Redirección según rol:
   * - ADMIN → /admin
   * - COORDINADOR → /coordinador
   * - VOLUNTARIO → /voluntario
   */
  const handleSubmit = () => {
    // Validación: ambos campos son obligatorios
    if (!correo || !password) {
      alert('Por favor ingresa correo y contraseña.')
      return
    }

    // Simulación temporal de autenticación
    // Se reemplaza cuando el backend implemente POST /api/auth/login
    const tokenFalso = 'token-demo-' + rol.toLowerCase()
    const usuarioFalso = {
      id: 1,
      nombre: 'Usuario',
      apellido: 'Demo',
      correo,
      rol,
      fecha: new Date().toISOString(),
    }

    // Guarda la sesión en el AuthContext y en localStorage
    login(tokenFalso, usuarioFalso)

    // Redirige al panel correspondiente según el rol elegido
    if (rol === 'ADMIN')       navigate('/admin')
    if (rol === 'COORDINADOR') navigate('/coordinador')
    if (rol === 'VOLUNTARIO')  navigate('/voluntario')
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col gap-6">

        {/* Encabezado del formulario */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-navy">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm">
            Ingresa al sistema de gestión de Donaton
          </p>
        </div>

        {/* Campo de correo electrónico */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-navy">Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tucorreo@donaton.cl"
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm
                       focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>

        {/* Campo de contraseña */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-navy">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm
                       focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>

        {/* Selector de rol temporal — se elimina cuando el backend devuelva el rol */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-navy">
            Entrar como <span className="text-gray-400 font-normal">(temporal)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.valor}
                type="button"
                onClick={() => setRol(r.valor)}
                className={`text-xs font-semibold px-2 py-2.5 rounded-lg border transition-all duration-200
                  ${rol === r.valor
                    ? 'bg-teal text-navy border-teal'       // Botón del rol seleccionado
                    : 'bg-white text-gray-500 border-gray-300 hover:border-teal'  // Botones no seleccionados
                  }`}
              >
                {r.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* Botón de ingreso al sistema */}
        <button
          onClick={handleSubmit}
          className="bg-teal text-navy font-semibold px-6 py-3 rounded-lg
                     hover:bg-teal/90 transition-all duration-200 mt-2"
        >
          Ingresar
        </button>

        {/* Botón para volver a la landing page */}
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 text-sm hover:text-navy transition-colors"
        >
          ← Volver al inicio
        </button>

      </div>
    </div>
  )
}
