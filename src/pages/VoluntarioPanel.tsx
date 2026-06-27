/**
 * @module pages/VoluntarioPanel
 * @author Remi García
 * @author Ricardo Diaz
 * @description Panel de operaciones en terreno para el actor Voluntario.
 *
 * Esta página corresponde a los casos de uso UC7 (Registrar donación interna)
 * y UC8 (Consultar estado donación) del diagrama de casos de uso.
 *
 * A diferencia del DonadorPortal (zona pública), este panel requiere autenticación
 * y está diseñado para el voluntario que opera físicamente en el centro de acopio.
 * La diferencia de negocio es importante: el voluntario registra donaciones que ya
 * están físicamente presentes en el centro, mientras que el donante registra una
 * promesa de donación que aún no llegó.
 *
 * Funcionalidades disponibles:
 * - Formulario para registrar donaciones físicas recibidas en el centro de acopio.
 * - Tabla con todas las donaciones registradas en el sistema y su estado actual.
 *
 * Comunicación con el backend:
 * - GET /api/donaciones → carga la lista de donaciones al iniciar.
 * - POST /api/donaciones → registra una nueva donación desde el formulario.
 *   Al registrar exitosamente, agrega la nueva donación al inicio de la lista
 *   local sin necesidad de recargar toda la página.
 */

import { useState, useEffect, type SubmitEvent } from 'react'
import { type DonacionRequest, type DonacionResponse } from '../types/donacionTypes'
//import type { Donacion } from '../types'

/** URL base del backend tomada de la variable de entorno VITE_API_URL del archivo .env */
const API = import.meta.env.VITE_API_URL

/**
 * Mapa de colores de fondo y texto para cada estado de donación.
 * Permite mostrar un indicador visual con color diferenciado
 * según la etapa del ciclo de vida en que se encuentra la donación.
 */
/*const coloresEstado: Record<Donacion['estado'], string> = {
  PENDIENTE:   'bg-gray-100 text-gray-600',
  RECIBIDA:    'bg-blue-100 text-blue-700',
  DISPONIBLE:  'bg-teal/20 text-teal',
  ASIGNADA:    'bg-amber-100 text-amber-700',
  EN_TRANSITO: 'bg-purple-100 text-purple-700',
  ENTREGADA:   'bg-green-100 text-green-700',
}*/

/**
 * Panel del voluntario para registro y consulta de donaciones en terreno.
 * Carga la lista de donaciones al montar el componente y permite registrar
 * nuevas donaciones físicas desde el formulario superior.
 *
 * @returns Página con formulario de registro y tabla de donaciones.
 */
export default function VoluntarioPanel() {
  /** Lista de donaciones cargadas desde el backend. */
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([])
  //const [donaciones, setDonaciones] = useState<Donacion[]>([])

  /** true mientras se están cargando las donaciones iniciales del backend. */
  const [cargando, setCargando] = useState(true)

  /**
   * Estado del formulario de registro de donación.
   * tipo: descripción del bien recibido físicamente en el centro.
   * cantidad: número de unidades o peso del bien.
   * unidad: unidad de medida. Si se omite, se usa 'unidades' como valor por defecto.
   * donanteNombre: nombre del donante que entregó el bien. Es opcional.
   */
   const [formData, setFormData] = useState<DonacionRequest>({
       tipo: '',
       cantidad: 0,
       donanteNombre: '',
   });
  /*
  const [form, setForm] = useState({
    tipo: '',
    cantidad: '',
    unidad: '',
    donanteNombre: '',
  })
  */

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Carga todas las donaciones del sistema para que el voluntario
   * pueda consultar el estado de cualquier donación registrada.
   */
  useEffect(() => {
    fetch(`${API}/api/donaciones`)
      .then((r) => r.json())
      .then((data) => setDonaciones(data))
      .catch((e) => console.error('Error cargando donaciones:', e))
      .finally(() => setCargando(false))
  }, [])

  /**
   * Actualiza el estado del formulario cuando el voluntario escribe en un input.
   * Usa el atributo name del input para identificar qué campo actualizar.
   *
   * @param e - Evento de cambio del input HTML.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
        ...prev,
        [name]: name === 'cantidad' ? (value  === '' ? 0 : Number(value)) : value
    }));

    //setFormData({...formData, [e.target.name]: e.target.value});
  }

  /**
   * Registra una nueva donación física en el sistema.
   * Valida que tipo y cantidad estén completos, luego envía una petición
   * POST al backend con los datos del formulario.
   *
   * Si el nombre del donante no se ingresa, se registra como 'Anónimo'.
   * Si la unidad no se ingresa, se usa 'unidades' como valor por defecto.
   * El correo del donante se registra como 'sin-correo@donaton.cl' cuando
   * el voluntario registra la donación (no se tiene el correo del donante en terreno).
   *
   * Al registrar exitosamente, agrega la nueva donación al inicio de la lista
   * para que sea visible de inmediato sin recargar la página.
   */
    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await fetch(`${API}/api/donaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'  },
                body: JSON.stringify(formData),
            });
            
            console.log(res);

            if(!res.ok) {
                const data = await res.json();

                throw new Error(data.error || "Error al registrar");
            }

            // Se agrega nueva donacion para que sea mostrada en la tabla
            const donacionNueva: DonacionResponse = await res.json();

            setDonaciones([donacionNueva, ...donaciones]);

            setFormData({ tipo: '', cantidad: 0, donanteNombre: '' });

            event.target?.reset(); 
        } catch (e) {
            console.error(e);
            alert('No se pudo registrar la donación.');
        }
    };

  /*
  const handleSubmit = async () => {
    // Validación: tipo y cantidad son obligatorios para registrar
    if (!form.tipo || !form.cantidad) {
      alert('Tipo y cantidad son obligatorios.')
      return
    }

    try {
      const res = await fetch(`${API}/api/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo:          form.tipo,
          cantidad:      Number(form.cantidad),
          unidad:        form.unidad || 'unidades',
          origen:        form.donanteNombre
                           ? `Recibido de ${form.donanteNombre}`
                           : 'Centro de acopio',
          donanteNombre: form.donanteNombre || 'Anónimo',
          donanteCorreo: 'sin-correo@donaton.cl',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al registrar')
      }

      // Agrega la donación recién creada al inicio de la lista local
      const nueva: Donacion = await res.json()
      setDonaciones([nueva, ...donaciones])

      // Limpia el formulario para el siguiente registro
      setForm({ tipo: '', cantidad: '', unidad: '', donanteNombre: '' })

    } catch (e) {
      console.error(e)
      alert('No se pudo registrar la donación.')
    }
  }
  */

  return (
    <div className="min-h-screen bg-gray-200 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Encabezado del panel */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-navy">Panel del Voluntario</h1>
          <p className="text-gray-500 text-sm">
            Registra las donaciones recibidas en el centro de acopio.
          </p>
        </div>

        {/* Formulario de registro de donación física */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-navy mb-4">Registrar nueva donación</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              placeholder="Tipo (ej. Ropa)"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            <input
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="Cantidad"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
            {/*<input
              name="unidad"
              value={form.unidad}
              onChange={handleChange}
              placeholder="Unidad (kg, cajas)"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />*/}
            <input
              name="donanteNombre"
              value={formData.donanteNombre}
              onChange={handleChange}
              placeholder="Nombre donante (opcional)"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <button
            //onClick={handleSubmit}
            className="bg-teal text-navy font-semibold px-6 py-2.5 rounded-lg
                       hover:bg-teal/90 transition-all duration-200 mt-4"
          >
            Registrar donación
          </button>
        </form>

        {/* Tabla de donaciones registradas con columnas: ID, Tipo, Cantidad, OT, Fecha, Estado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-navy">
              Donaciones registradas ({donaciones.length})
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
                    {/*<th className="px-6 py-3 font-semibold">OT</th>*/}
                    <th className="px-6 py-3 font-semibold">Fecha</th>
                    {/*<th className="px-6 py-3 font-semibold">Estado</th>*/}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donaciones.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700">#{d.id}</td>
                      <td className="px-6 py-4 font-medium text-navy">{d.tipo}</td>
                      <td className="px-6 py-4 text-gray-700">{d.cantidad}</td>
                      {/* El OT puede ser null si la donación aún está en PENDIENTE */}
                      {/*<td className="px-6 py-4 text-gray-500">{d.ot ?? '—'}</td>*/}
                      <td className="px-6 py-4 text-gray-500">{d.fecha}</td>
                      <td className="px-6 py-4">
                        {/*<span className={`text-xs font-semibold px-3 py-1 rounded-full ${coloresEstado[d.estado]}`}>
                          {d.estado}
                        </span>*/}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
