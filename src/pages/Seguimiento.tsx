/**
 * @module pages/Seguimiento
 * @author Remi García
 * @description Página pública de seguimiento de donaciones por código OT.
 *
 * Esta página corresponde al caso de uso UC2 del diagrama de casos de uso:
 * "Seguimiento de donaciones por OT". Es accesible sin autenticación desde
 * la zona pública del sistema.
 *
 * Permite al donante consultar en qué etapa del ciclo de vida se encuentra
 * su donación ingresando el código OT (Orden de Trabajo) que recibió al
 * confirmar el registro de su donación.
 *
 * El resultado se presenta como una línea de tiempo vertical que muestra
 * los cinco estados del flujo operativo, resaltando el estado actual con
 * color teal y marcando con un visto los estados ya completados.
 *
 * Estados del flujo mostrados en la línea de tiempo:
 * RECIBIDA → DISPONIBLE → ASIGNADA → EN_TRANSITO → ENTREGADA
 *
 * Nota: el estado PENDIENTE no se muestra en el seguimiento público porque
 * representa la promesa de donación antes de ser recibida físicamente.
 * El OT solo se genera cuando la donación pasa a RECIBIDA.
 *
 * Nota de implementación: la consulta actualmente simula el resultado
 * mostrando el estado ASIGNADA como ejemplo. En la siguiente fase del backend
 * se conectará al endpoint GET /api/donaciones?ot= para consultar el estado real.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * Los cinco estados del flujo operativo de una donación en orden cronológico.
 * Se usan para construir la línea de tiempo visual de seguimiento.
 */
const flujoEstados = ['RECIBIDA', 'DISPONIBLE', 'ASIGNADA', 'EN_TRANSITO', 'ENTREGADA']

/**
 * Etiquetas en español para mostrar cada estado en la línea de tiempo.
 * Reemplaza los valores internos del backend por textos comprensibles para el donante.
 */
const etiquetas: Record<string, string> = {
  RECIBIDA:    'Recibida',
  DISPONIBLE:  'Disponible',
  ASIGNADA:    'Asignada',
  EN_TRANSITO: 'En tránsito',
  ENTREGADA:   'Entregada',
}

/**
 * Página de seguimiento de donaciones por código OT.
 * Permite al donante consultar el estado actual de su donación
 * ingresando el código OT recibido al confirmar el registro.
 *
 * @returns Página con buscador de OT y línea de tiempo visual del estado.
 */
export default function Seguimiento() {
  const navigate = useNavigate()

  /** Código OT ingresado por el donante en el campo de búsqueda. */
  const [ot, setOt] = useState('')

  /**
   * Estado actual de la donación consultada.
   * null mientras no se ha realizado ninguna consulta.
   * Cuando tiene valor, se muestra la línea de tiempo con el estado resaltado.
   */
  const [resultado, setResultado] = useState<string | null>(null)

  /**
   * Maneja la consulta del estado de la donación por código OT.
   * Valida que el campo no esté vacío antes de consultar.
   *
   * Nota: actualmente simula el resultado con estado ASIGNADA.
   * Se reemplaza por una petición real a GET /api/donaciones?ot= cuando
   * el backend implemente ese endpoint.
   */
  const handleConsultar = () => {
    if (!ot.trim()) {
      alert('Por favor ingresa tu código OT.')
      return
    }
    // Simulación temporal — muestra ASIGNADA como estado de ejemplo
    setResultado('ASIGNADA')
  }

  /**
   * Índice del estado actual dentro del arreglo flujoEstados.
   * Se usa para determinar qué estados marcar como completados en la línea de tiempo.
   * -1 cuando no hay resultado todavía.
   */
  const indiceActual = resultado ? flujoEstados.indexOf(resultado) : -1

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 px-6 py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Encabezado de la página */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-navy">Estado de mi donación</h1>
            <p className="text-gray-500">
              Ingresa tu código de seguimiento (OT) para ver en qué etapa se
              encuentra tu donación.
            </p>
          </div>

          {/* Campo de búsqueda por código OT */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-4">
            <label className="text-sm font-semibold text-navy">Código de seguimiento</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={ot}
                onChange={(e) => setOt(e.target.value)}
                placeholder="Ej. OT-2026-0042"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <button
                onClick={handleConsultar}
                className="bg-teal text-navy font-semibold px-6 py-2.5 rounded-lg
                           hover:bg-teal/90 transition-all duration-200"
              >
                Consultar
              </button>
            </div>
          </div>

          {/* Línea de tiempo — solo visible cuando hay un resultado */}
          {resultado && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">Donación {ot}</span>
                <span className="text-lg font-bold text-navy">
                  Estado actual: {etiquetas[resultado]}
                </span>
              </div>

              {/* Línea de tiempo vertical con indicadores de progreso */}
              <div className="flex flex-col gap-0">
                {flujoEstados.map((estado, i) => {
                  const completado = i <= indiceActual  // Estados anteriores al actual inclusive
                  const esActual   = i === indiceActual // Solo el estado actual
                  return (
                    <div key={estado} className="flex gap-4">

                      {/* Columna del indicador visual (círculo + línea conectora) */}
                      <div className="flex flex-col items-center">
                        {/* Círculo: teal con visto si completado, gris vacío si pendiente */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${completado ? 'bg-teal border-teal' : 'bg-white border-gray-300'}`}>
                          {completado && (
                            <svg className="w-3 h-3 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {/* Línea conectora vertical entre estados (no se muestra en el último) */}
                        {i < flujoEstados.length - 1 && (
                          <div className={`w-0.5 h-10 ${i < indiceActual ? 'bg-teal' : 'bg-gray-200'}`} />
                        )}
                      </div>

                      {/* Texto del estado con resaltado especial para el estado actual */}
                      <div className="pb-8">
                        <span className={`text-sm font-semibold
                          ${esActual   ? 'text-teal'   :
                            completado ? 'text-navy'   : 'text-gray-400'}`}>
                          {etiquetas[estado]}
                        </span>
                        {/* Descripción adicional solo para el estado actual */}
                        {esActual && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Tu donación está en esta etapa actualmente.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enlace para volver al portal del donante */}
          <div className="text-center">
            <button
              onClick={() => navigate('/donar')}
              className="text-navy font-semibold text-sm hover:text-teal transition-colors"
            >
              ← Volver a donar
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
