/**
 * @module pages/AdminUsuarios
 * @author Ricardo Díaz
 * @description Página de gestión de usuarios internos del sistema Donaton.
 *
 * Esta página corresponde al caso de uso UC16 del diagrama de casos de uso
 * y es accesible exclusivamente para el actor Admin.
 *
 * Funcionalidades disponibles:
 * - Formulario para crear nuevos usuarios internos con nombre, apellido, correo y rol.
 * - Tabla con todos los usuarios registrados en el sistema y sus roles.
 *
 * Los roles disponibles son: ADMIN, COORDINADOR y VOLUNTARIO.
 * Cada rol determina a qué paneles puede acceder el usuario creado.
 *
 * Nota de implementación: actualmente los usuarios se almacenan en memoria local
 * como datos de ejemplo. Cuando el backend implemente el endpoint POST /api/usuarios,
 * el formulario enviará los datos al servidor y la tabla cargará desde GET /api/usuarios.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Tipo que representa los roles disponibles en el sistema.
 * Coincide con el enum Rol definido en el schema de Prisma del backend.
 */
type Rol = 'ADMIN' | 'COORDINADOR' | 'VOLUNTARIO'

/**
 * @interface UsuarioAdmin
 * @description Estructura de datos de un usuario interno para esta página.
 * id: identificador único del usuario.
 * nombre: nombre de pila del usuario.
 * apellido: apellido del usuario.
 * correo: correo electrónico usado como identificador de login.
 * rol: nivel de acceso del usuario en el sistema.
 */
interface UsuarioAdmin {
  id: number
  nombre: string
  apellido: string
  correo: string
  rol: Rol
}

/**
 * Datos de ejemplo en memoria para demostración del MVP.
 * Se reemplazan por datos reales del backend cuando esté disponible GET /api/usuarios.
 */
const usuariosIniciales: UsuarioAdmin[] = [
  { id: 1, nombre: 'Admin',  apellido: 'Demo',       correo: 'admin@donaton.cl',  rol: 'ADMIN' },
  { id: 2, nombre: 'Carla',  apellido: 'Coordina',   correo: 'carla@donaton.cl',  rol: 'COORDINADOR' },
  { id: 3, nombre: 'Pedro',  apellido: 'Voluntario', correo: 'pedro@donaton.cl',  rol: 'VOLUNTARIO' },
]

/**
 * Lista de roles disponibles para el selector del formulario.
 * Cada elemento tiene el valor interno del rol y la etiqueta en español.
 */
const roles: { valor: Rol; etiqueta: string }[] = [
  { valor: 'ADMIN',       etiqueta: 'Administrador' },
  { valor: 'COORDINADOR', etiqueta: 'Coordinador' },
  { valor: 'VOLUNTARIO',  etiqueta: 'Voluntario' },
]

/**
 * Mapa de colores para los indicadores visuales de cada rol en la tabla.
 * Permite identificar visualmente el nivel de acceso de cada usuario.
 */
const coloresRol: Record<Rol, string> = {
  ADMIN:       'bg-teal/20 text-teal',
  COORDINADOR: 'bg-blue-100 text-blue-700',
  VOLUNTARIO:  'bg-amber-100 text-amber-700',
}

/**
 * Página de gestión de usuarios internos del sistema.
 * Permite al Admin crear nuevos usuarios y visualizar los existentes.
 *
 * @returns Página con formulario de creación y tabla de usuarios registrados.
 */
export default function AdminUsuarios() {
  /** Lista de usuarios del sistema. Inicia con datos de ejemplo en memoria. */
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(usuariosIniciales)

  /**
   * Estado del formulario de creación de usuario.
   * nombre: nombre de pila del nuevo usuario.
   * apellido: apellido del nuevo usuario.
   * correo: correo electrónico del nuevo usuario.
   * rol: rol asignado. Por defecto VOLUNTARIO.
   */
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    rol: 'VOLUNTARIO' as Rol,
  })

  /**
   * Actualiza el estado del formulario cuando el Admin escribe o selecciona un valor.
   * Funciona tanto para inputs de texto como para el selector de rol.
   *
   * @param e - Evento de cambio del input o select HTML.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /**
   * Crea un nuevo usuario y lo agrega al inicio de la lista.
   * Valida que nombre, apellido y correo estén completos antes de crear.
   * El ID se genera localmente como el siguiente número de la lista.
   * Al completar, limpia el formulario dejando el rol en VOLUNTARIO por defecto.
   */
  const handleSubmit = () => {
    if (!form.nombre || !form.apellido || !form.correo) {
      alert('Por favor completa nombre, apellido y correo.')
      return
    }

    const nuevo: UsuarioAdmin = {
      id: usuarios.length + 1,
      nombre:   form.nombre,
      apellido: form.apellido,
      correo:   form.correo,
      rol:      form.rol,
    }

    // Agrega el nuevo usuario al inicio de la lista
    setUsuarios([nuevo, ...usuarios])
    setForm({ nombre: '', apellido: '', correo: '', rol: 'VOLUNTARIO' })
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Enlace para volver al dashboard de administración */}
        <Link to="/admin" className="text-gray-400 text-sm hover:text-navy transition-colors w-fit">
          ← Volver al dashboard
        </Link>

        {/* Encabezado de la página */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-navy">Gestión de usuarios</h1>
          <p className="text-gray-500 text-sm">
            Crea y administra los usuarios del sistema y sus roles.
          </p>
        </div>

        {/* Formulario de creación de usuario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-navy mb-4">Crear nuevo usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@donaton.cl"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            {/* Selector de rol para el nuevo usuario */}
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            >
              {roles.map((r) => (
                <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-teal text-navy font-semibold px-6 py-2.5 rounded-lg
                       hover:bg-teal/90 transition-all duration-200 mt-4"
          >
            Crear usuario
          </button>
        </div>

        {/* Tabla de usuarios registrados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-navy">
              Usuarios registrados ({usuarios.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Correo</th>
                  <th className="px-6 py-3 font-semibold">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-navy">{u.nombre} {u.apellido}</td>
                    <td className="px-6 py-4 text-gray-700">{u.correo}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresRol[u.rol]}`}>
                        {u.rol}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
