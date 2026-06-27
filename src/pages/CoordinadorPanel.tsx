/**
 * @module pages/CoordinadorPanel
 * @author Ricardo Díaz
 * @description Panel de gestión de donaciones para el actor Coordinador.
 *
 * Esta página corresponde a los casos de uso UC9, UC11, UC12, UC13 y UC14
 * del diagrama de casos de uso del sistema Donaton.
 *
 * Funcionalidades disponibles en este panel:
 * - Listar todas las donaciones registradas en el sistema con su estado actual.
 * - Listar todas las necesidades activas con su barra de cobertura.
 * - Cambiar el estado de una donación a lo largo de su ciclo de vida.
 * - Asignar una donación disponible a una necesidad activa mediante un modal.
 * - Actualizar automáticamente la cobertura de la necesidad al asignar.
 *
 * Ciclo de estados gestionado desde este panel:
 * PENDIENTE → RECIBIDA (verificar) → DISPONIBLE → ASIGNADA → EN_TRANSITO → ENTREGADA
 *
 * Comunicación con el backend:
 * - GET /api/donaciones → obtiene la lista de donaciones al cargar la página.
 * - GET /api/necesidades → obtiene la lista de necesidades al cargar la página.
 * - PATCH /api/donaciones/:id → cambia el estado de una donación específica.
 */

import { useState, useEffect } from 'react'
import type { Donacion, Necesidad } from '../types'

/** URL base del backend tomada de la variable de entorno VITE_API_URL del archivo .env */
const API = import.meta.env.VITE_API_URL

/**
 * Mapa de colores de fondo y texto para cada estado de donación.
 * Permite mostrar un indicador visual (badge) con color diferenciado
 * según la etapa del ciclo de vida en que se encuentra la donación.
 */
const coloresEstado: Record<Donacion['estado'], string> = {
  PENDIENTE:   'bg-gray-100 text-gray-600',
  RECIBIDA:    'bg-blue-100 text-blue-700',
  DISPONIBLE:  'bg-teal/20 text-teal',
  ASIGNADA:    'bg-amber-100 text-amber-700',
  EN_TRANSITO: 'bg-purple-100 text-purple-700',
  ENTREGADA:   'bg-green-100 text-green-700',
}

/**
 * Mapa de colores de fondo y texto para cada nivel de prioridad de necesidad.
 * Permite mostrar visualmente la urgencia de cada necesidad en las tarjetas.
 */
const coloresPrioridad: Record<Necesidad['prioridad'], string> = {
  CRITICA: 'bg-red-100 text-red-700',
  ALTA:    'bg-orange-100 text-orange-700',
  MEDIA:   'bg-amber-100 text-amber-700',
  BAJA:    'bg-gray-100 text-gray-600',
}

/**
 * Panel principal del coordinador.
 * Carga donaciones y necesidades desde el backend al montar el componente,
 * y permite gestionar el ciclo de vida de cada donación en tiempo real.
 *
 * @returns Página completa con sección de necesidades, tabla de donaciones y modal de asignación.
 */
export default function CoordinadorPanel() {
  /** Lista de donaciones cargadas desde el backend. */
  const [donaciones, setDonaciones] = useState<Donacion[]>([])

  /** Lista de necesidades cargadas desde el backend. */
  const [necesidades, setNecesidades] = useState<Necesidad[]>([])

  /** true mientras se están cargando los datos iniciales del backend. */
  const [cargando, setCargando] = useState(true)

  /**
   * Donación seleccionada para asignar a una necesidad.
   * Cuando tiene valor, el modal de asignación se muestra en pantalla.
   * null cuando no hay ningún proceso de asignación activo.
   */
  const [donacionAsignar, setDonacionAsignar] = useState<Donacion | null>(null)

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Lanza dos peticiones en paralelo al backend para cargar donaciones y necesidades.
   * Las peticiones son independientes: si una falla, la otra continúa normalmente.
   */
  useEffect(() => {
    fetch(`${API}/api/donaciones`)
      .then((r) => r.json())
      .then((data) => setDonaciones(data))
      .catch((e) => console.error('Error cargando donaciones:', e))
      .finally(() => setCargando(false))

    fetch(`${API}/api/necesidades`)
      .then((r) => r.json())
      .then((data) => setNecesidades(data))
      .catch((e) => console.error('Error cargando necesidades:', e))
  }, [])

  /**
   * Cambia el estado de una donación enviando una petición PATCH al backend.
   * Si la petición es exitosa, actualiza la donación en el estado local de React
   * sin recargar toda la lista (reemplaza solo el elemento modificado).
   * Si ocurre un error, muestra un mensaje al coordinador.
   *
   * @param id - Identificador único de la donación a modificar.
   * @param nuevoEstado - Estado al que se quiere transicionar la donación.
   * @param extra - Campos adicionales opcionales. Se usa para enviar necesidadId al asignar.
   */
  const cambiarEstado = async (
    id: number,
    nuevoEstado: Donacion['estado'],
    extra?: Record<string, unknown>
  ) => {
    try {
      const res = await fetch(`${API}/api/donaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado, ...extra }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al cambiar estado')
      }

      // Reemplaza solo la donación actualizada en la lista local
      const actualizada: Donacion = await res.json()
      setDonaciones((prev) =>
        prev.map((d) => (d.id === actualizada.id ? actualizada : d))
      )
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Error de conexión')
    }
  }

  /**
   * Transiciona una donación de RECIBIDA a DISPONIBLE.
   * Se activa cuando el coordinador verifica el tipo y cantidad recibida.
   * @param id - Identificador de la donación a verificar.
   */
  const verificar = (id: number) => cambiarEstado(id, 'DISPONIBLE')

  /**
   * Transiciona una donación de ASIGNADA a EN_TRANSITO.
   * Se activa cuando el coordinador confirma que la donación salió hacia su destino.
   * @param id - Identificador de la donación a marcar en tránsito.
   */
  const marcarEnTransito = (id: number) => cambiarEstado(id, 'EN_TRANSITO')

  /**
   * Transiciona una donación de EN_TRANSITO a ENTREGADA.
   * Completa el ciclo de vida de la donación.
   * @param id - Identificador de la donación a confirmar como entregada.
   */
  const confirmarEntrega = (id: number) => cambiarEstado(id, 'ENTREGADA')

  /**
   * Asigna una donación disponible a una necesidad activa.
   * Realiza dos operaciones en secuencia:
   * 1. Cambia el estado de la donación a ASIGNADA vinculándola a la necesidad.
   * 2. Actualiza localmente la cobertura de la necesidad sumando la cantidad donada.
   *    Si la nueva cobertura iguala o supera la cantidad requerida, cambia el estado
   *    de la necesidad a CUBIERTA en el estado local de React.
   *
   * @param donacion - Donación disponible seleccionada para asignar.
   * @param necesidad - Necesidad activa a la que se asigna la donación.
   */
  const asignar = async (donacion: Donacion, necesidad: Necesidad) => {
    await cambiarEstado(donacion.id, 'ASIGNADA', { necesidadId: necesidad.id })

    // Actualiza la cobertura de la necesidad en el estado local
    setNecesidades((prev) =>
      prev.map((n) => {
        if (n.id !== necesidad.id) return n
        const nuevaCobertura = n.cantCubierta + donacion.cantidad
        return {
          ...n,
          cantCubierta: nuevaCobertura,
          estado: nuevaCobertura >= n.cantRequerida ? 'CUBIERTA' : n.estado,
        }
      })
    )

    // Cierra el modal de asignación
    setDonacionAsignar(null)
  }

  /**
   * Determina qué botón de acción mostrar en la tabla según el estado actual de la donación.
   * Implementa una máquina de estados visual: cada estado habilita solo la acción
   * que corresponde al siguiente paso del ciclo de vida.
   *
   * @param d - Donación para la que se determina la acción disponible.
   * @returns Botón de acción correspondiente al estado, o texto "Completada" si ya terminó.
   */
  const accionPorEstado = (d: Donacion) => {
    switch (d.estado) {
      case 'RECIBIDA':
        return (
          <button
            onClick={() => verificar(d.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Verificar
          </button>
        )
      case 'DISPONIBLE':
        return (
          <button
            onClick={() => setDonacionAsignar(d)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal text-navy hover:bg-teal/90 transition-colors"
          >
            Asignar
          </button>
        )
      case 'ASIGNADA':
        return (
          <button
            onClick={() => marcarEnTransito(d.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            En tránsito
          </button>
        )
      case 'EN_TRANSITO':
        return (
          <button
            onClick={() => confirmarEntrega(d.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Confirmar entrega
          </button>
        )
      default:
        return <span className="text-xs text-gray-400">Completada</span>
    }
  }

  /** Necesidades filtradas que están en estado ACTIVA para mostrar en el modal de asignación. */
  const necesidadesActivas = necesidades.filter((n) => n.estado === 'ACTIVA')

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Encabezado del panel */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-navy">Panel del Coordinador</h1>
          <p className="text-gray-500 text-sm">
            Verifica, asigna y confirma la entrega de las donaciones.
          </p>
        </div>

        {/* Sección de necesidades: tarjetas con barra de cobertura */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-navy">Necesidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {necesidades.map((n) => {
              // Calcula el porcentaje de cobertura limitado a 100%
              const porcentaje = Math.min(100, Math.round((n.cantCubierta / n.cantRequerida) * 100))
              return (
                <div key={n.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresPrioridad[n.prioridad]}`}>
                      {n.prioridad}
                    </span>
                    <span className="text-xs text-gray-400">{n.estado}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">{n.categoria}</h3>
                    {/* Muestra el nombre de la comuna. Si no viene del backend, muestra el ID */}
                    <p className="text-sm text-gray-500">{n.comuna?.nombre ?? `Comuna #${n.comunaId}`}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {/* Barra de progreso de cobertura */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal rounded-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {n.comuna?.nombre ?? `Comuna #${n.comunaId}`} · {n.cantCubierta}/{n.cantRequerida}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabla de donaciones con columnas: ID, Tipo, Cantidad, OT, Fecha, Estado, Acción */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-navy">
              Donaciones ({donaciones.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {cargando ? (
              <p className="text-sm text-gray-400 px-6 py-8">Cargando donaciones...</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID</th>
                    <th className="px-6 py-3 font-semibold">Tipo</th>
                    <th className="px-6 py-3 font-semibold">Cantidad</th>
                    <th className="px-6 py-3 font-semibold">OT</th>
                    <th className="px-6 py-3 font-semibold">Fecha</th>
                    <th className="px-6 py-3 font-semibold">Estado</th>
                    <th className="px-6 py-3 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donaciones.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700">#{d.id}</td>
                      <td className="px-6 py-4 font-medium text-navy">{d.tipo}</td>
                      <td className="px-6 py-4 text-gray-700">{d.cantidad}</td>
                      {/* El OT puede ser null si la donación aún está en PENDIENTE */}
                      <td className="px-6 py-4 text-gray-500">{d.ot ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{d.fecha}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresEstado[d.estado]}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">{accionPorEstado(d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Modal de asignación — aparece cuando el coordinador hace clic en "Asignar" */}
      {donacionAsignar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-navy">Asignar donación</h3>
              <p className="text-sm text-gray-500">
                {donacionAsignar.tipo} · {donacionAsignar.cantidad}
              </p>
            </div>

            <p className="text-sm font-semibold text-navy">Selecciona una necesidad activa:</p>

            {/* Mensaje si no hay necesidades activas disponibles */}
            {necesidadesActivas.length === 0 ? (
              <p className="text-sm text-gray-400">No hay necesidades activas disponibles.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {necesidadesActivas.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => donacionAsignar && asignar(donacionAsignar, n)}
                    className="text-left border border-gray-200 rounded-lg p-3 hover:border-teal hover:bg-teal/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-navy text-sm">{n.categoria}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${coloresPrioridad[n.prioridad]}`}>
                        {n.prioridad}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {n.comuna?.nombre ?? `Comuna #${n.comunaId}`} · {n.cantCubierta}/{n.cantRequerida}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Botón para cerrar el modal sin asignar */}
            <button
              onClick={() => setDonacionAsignar(null)}
              className="text-gray-400 text-sm hover:text-navy transition-colors mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
