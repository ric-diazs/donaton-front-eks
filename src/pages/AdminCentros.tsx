/**
 * @module pages/AdminCentros
 * @author Remi García
 * @description Página de gestión de centros de acopio para el actor Admin.
 *
 * Esta página corresponde al caso de uso UC18 del diagrama de casos de uso
 * y es accesible exclusivamente para el actor Admin.
 *
 * Funcionalidades disponibles:
 * - Formulario para crear nuevos centros de acopio con nombre, dirección,
 *   región, comuna y capacidad máxima.
 * - Selectores encadenados de región y comuna: la lista de comunas disponibles
 *   se filtra automáticamente según la región seleccionada. No es posible
 *   seleccionar una comuna sin haber elegido primero una región.
 * - Tarjetas de visualización de cada centro con barra de capacidad que
 *   cambia de color según el nivel de ocupación:
 *   verde (teal) hasta 70%, ámbar entre 70% y 95%, rojo sobre 95%.
 *
 * Nota de implementación: los datos de regiones, comunas y centros
 * están en memoria como datos de ejemplo para el PMV. En la siguiente fase
 * se conectará a los endpoints GET /api/centros y POST /api/centros del backend,
 * y las regiones y comunas vendrán de las tablas Region y Comuna de la base de datos.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Tipo que representa los estados posibles de un centro de acopio.
 * ACTIVO: recibiendo donaciones con capacidad disponible.
 * SATURADO: sin capacidad para recibir más donaciones.
 * CERRADO: no operativo temporalmente.
 */
type EstadoCentro = 'ACTIVO' | 'SATURADO' | 'CERRADO'

/**
 * @interface Centro
 * @description Estructura de datos de un centro de acopio para esta página.
 * id: identificador único del centro.
 * nombre: nombre descriptivo del centro de acopio.
 * direccion: dirección física del centro.
 * region: región de Chile donde está ubicado.
 * comuna: comuna específica dentro de la región.
 * capacidad: capacidad máxima del centro en kilogramos.
 * ocupado: cantidad actual almacenada en kilogramos.
 * estado: situación operativa actual del centro.
 */
interface Centro {
  id: number
  nombre: string
  direccion: string
  region: string
  comuna: string
  capacidad: number
  ocupado: number
  estado: EstadoCentro
}

/**
 * Catálogo reducido de regiones y comunas para demostración del PMV.
 * En producción estos datos vendrán de las tablas Region y Comuna del backend.
 * La clave es el nombre de la región y el valor es el arreglo de comunas disponibles.
 */
const regionesComunas: Record<string, string[]> = {
  'Metropolitana': ['Santiago', 'Maipú', 'Las Condes', 'La Florida', 'Puente Alto'],
  'Valparaíso':    ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'],
  'Biobío':        ['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz'],
  'Coquimbo':      ['La Serena', 'Coquimbo', 'Ovalle'],
  'Araucanía':     ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón'],
}

/** Lista de nombres de regiones disponibles extraída del catálogo. */
const regiones = Object.keys(regionesComunas)

/**
 * Datos de ejemplo en memoria para demostración del PMV.
 * Se reemplazan por datos reales del backend cuando esté disponible GET /api/centros.
 */
const centrosIniciales: Centro[] = [
  { id: 1, nombre: 'Centro Norte', direccion: 'Av. Principal 123', region: 'Metropolitana', comuna: 'Santiago',     capacidad: 1000, ocupado: 650, estado: 'ACTIVO' },
  { id: 2, nombre: 'Centro Costa', direccion: 'Calle Mar 456',     region: 'Valparaíso',    comuna: 'Viña del Mar', capacidad: 800,  ocupado: 780, estado: 'SATURADO' },
  { id: 3, nombre: 'Centro Sur',   direccion: 'Los Aromos 789',    region: 'Biobío',        comuna: 'Concepción',   capacidad: 600,  ocupado: 0,   estado: 'CERRADO' },
]

/**
 * Mapa de colores para los indicadores visuales del estado de cada centro.
 * Permite identificar rápidamente la disponibilidad operativa de cada centro.
 */
const coloresEstado: Record<EstadoCentro, string> = {
  ACTIVO:   'bg-green-100 text-green-700',
  SATURADO: 'bg-amber-100 text-amber-700',
  CERRADO:  'bg-gray-200 text-gray-600',
}

/**
 * Página de gestión de centros de acopio del sistema Donaton.
 * Permite al Admin registrar nuevos centros y visualizar el estado de los existentes.
 *
 * @returns Página con formulario de creación con selectores encadenados y tarjetas de centros.
 */
export default function AdminCentros() {
  /** Lista de centros de acopio. Inicia con datos de ejemplo en memoria. */
  const [centros, setCentros] = useState<Centro[]>(centrosIniciales)

  /**
   * Estado del formulario de creación de centro.
   * nombre: nombre del centro de acopio.
   * direccion: dirección física del centro.
   * region: región seleccionada. Al cambiar, se resetea la comuna automáticamente.
   * comuna: comuna seleccionada. Solo se habilita después de elegir una región.
   * capacidad: capacidad máxima del centro en kilogramos.
   */
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    region: '',
    comuna: '',
    capacidad: '',
  })

  /**
   * Comunas disponibles según la región actualmente seleccionada en el formulario.
   * Arreglo vacío cuando no hay región seleccionada, lo que mantiene el selector de
   * comunas deshabilitado hasta que el Admin elija una región primero.
   */
  const comunasDisponibles = form.region ? regionesComunas[form.region] : []

  /**
   * Actualiza el estado del formulario cuando el Admin escribe o selecciona un valor.
   * Caso especial: si el campo que cambia es la región, se resetea la comuna a vacío
   * para evitar que quede una comuna de otra región seleccionada previamente.
   *
   * @param e - Evento de cambio del input o select HTML.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Al cambiar la región, resetea la comuna para forzar una nueva selección
    if (name === 'region') {
      setForm({ ...form, region: value, comuna: '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  /**
   * Crea un nuevo centro de acopio y lo agrega al inicio de la lista.
   * Valida que todos los campos estén completos, incluyendo región y comuna.
   * El nuevo centro se crea con ocupado en 0 y estado ACTIVO por defecto.
   * Al completar, limpia el formulario para el siguiente registro.
   */
  const handleSubmit = () => {
    if (!form.nombre || !form.direccion || !form.region || !form.comuna || !form.capacidad) {
      alert('Por favor completa todos los campos, incluyendo región y comuna.')
      return
    }

    const nuevo: Centro = {
      id:        centros.length + 1,
      nombre:    form.nombre,
      direccion: form.direccion,
      region:    form.region,
      comuna:    form.comuna,
      capacidad: Number(form.capacidad),
      ocupado:   0,          // Todo centro nuevo empieza sin ocupación
      estado:    'ACTIVO',   // Todo centro nuevo empieza operativo
    }

    setCentros([nuevo, ...centros])
    setForm({ nombre: '', direccion: '', region: '', comuna: '', capacidad: '' })
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
          <h1 className="text-3xl font-bold text-navy">Centros de acopio</h1>
          <p className="text-gray-500 text-sm">
            Crea y administra los centros, sus capacidades y ubicación.
          </p>
        </div>

        {/* Formulario de creación de centro con selectores encadenados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-navy mb-4">Crear nuevo centro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del centro"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Dirección"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <input
              name="capacidad"
              type="number"
              value={form.capacidad}
              onChange={handleChange}
              placeholder="Capacidad (kg)"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />

            {/* Selector de región — primer paso del encadenamiento */}
            <select
              name="region"
              value={form.region}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            >
              <option value="">Selecciona región...</option>
              {regiones.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Selector de comuna — deshabilitado hasta que se elija una región */}
            <select
              name="comuna"
              value={form.comuna}
              onChange={handleChange}
              disabled={!form.region}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal
                         disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {form.region ? 'Selecciona comuna...' : 'Primero elige región'}
              </option>
              {comunasDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-teal text-navy font-semibold px-6 py-2.5 rounded-lg
                       hover:bg-teal/90 transition-all duration-200 mt-4"
          >
            Crear centro
          </button>
        </div>

        {/* Tarjetas de centros registrados con barra de capacidad */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-navy">
            Centros registrados ({centros.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.map((c) => {
              // Porcentaje de ocupación limitado a 100%
              const porcentaje = Math.min(100, Math.round((c.ocupado / c.capacidad) * 100))
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-navy">{c.nombre}</h3>
                      <p className="text-sm text-gray-500">{c.comuna}, {c.region}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresEstado[c.estado]}`}>
                      {c.estado}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">{c.direccion}</p>

                  {/* Barra de capacidad con color según nivel de ocupación */}
                  <div className="flex flex-col gap-1">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300
                          ${porcentaje >= 95 ? 'bg-red-500'   :   // Crítico: sobre 95%
                            porcentaje >= 70 ? 'bg-amber-500' :   // Advertencia: entre 70% y 95%
                                              'bg-teal'}`}         // Normal: bajo 70%
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.ocupado} / {c.capacidad} kg ({porcentaje}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
