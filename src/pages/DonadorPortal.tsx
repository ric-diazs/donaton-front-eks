/**
 * @module pages/DonadorPortal
 * @author Remi García
 * @author Ricardo Diaz
 * @description Portal público de registro de donaciones para el donante externo.
 
 Esta página es accesible sin autenticación y representa el punto de entrada del donante al sistema Donaton. Corresponde al caso de uso UC3 del diagrama
 de casos de uso: "Registrar donación y generar OT".
 
 Flujo de la página:
 1. El donante completa el formulario con los datos del bien y sus datos de contacto.
 2. Al enviar, se realiza una petición POST /api/donaciones al backend.
 3. El backend crea el registro con estado PENDIENTE y crea o reutiliza el donante.
 4. Si el registro es exitoso, se muestra la confirmación con el código OT
 *    (si ya fue generado) o un mensaje indicando que será enviado al confirmar recepción.
 5. Si ocurre un error, se muestra un mensaje descriptivo en rojo.
 
 Nota: El código OT se genera en el backend solo cuando el coordinador confirma
  la recepción física (transición PENDIENTE → RECIBIDA). Al registrar, la donación
 queda en estado PENDIENTE y el campo OT es null.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/** URL base del backend tomada de la variable de entorno VITE_API_URL del archivo .env */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Página portal del donante.
 * Permite registrar una donación desde la zona pública del sistema sin necesidad
 * de crear una cuenta ni iniciar sesión.
 *
 * @returns Página completa con Navbar, formulario de donación y Footer.
 */
export default function DonadorPortal() {
  const navigate = useNavigate()

  /**
   * Estado del formulario de donación.
   * Se inicializa con todos los campos vacíos y se actualiza con cada cambio del input.
   */
  const [form, setForm] = useState({
    tipo: '',       // Tipo de bien donado (ej: "Ropa", "Alimentos")
    cantidad: '',   // Cantidad numérica del bien
    unidad: '',     // Unidad de medida (ej: "cajas", "kg", "unidades")
    nombre: '',     // Nombre completo del donante
    correo: '',     // Correo del donante para notificaciones
  })

  /**
    Código OT generado tras el registro exitoso.
    null mientras no se haya registrado una donación en esta sesión.
    Se muestra en la confirmación para que el donante lo guarde.
   */
  const [otGenerada, setOtGenerada] = useState<string | null>(null)

  /** true mientras el backend está procesando la petición. Desactiva el botón de envío. */
  const [cargando, setCargando] = useState(false)

  /** Mensaje de error a mostrar si la petición falla. null si no hay error. */
  const [error, setError] = useState<string | null>(null)

  /**
    Actualiza el estado del formulario cuando el usuario escribe en cualquier input.
    Usa el atributo name del input para identificar qué campo actualizar,
    manteniendo los valores de los demás campos sin cambios.
   
    @param e - Evento de cambio del input HTML.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /**
    Maneja el envío del formulario al backend.
    Realiza las siguientes acciones en orden:
    1. Valida que todos los campos estén completos.
    2. Activa el estado de carga y limpia errores previos.
    3. Envía una petición POST /api/donaciones con los datos del formulario.
    4. Si la respuesta es exitosa, guarda el código OT y limpia el formulario.
    5. Si hay error, muestra el mensaje descriptivo al usuario.
    6. Siempre desactiva el estado de carga al terminar (éxito o error).
   */
  const handleSubmit = async () => {
    // Validación: todos los campos son obligatorios
    if (!form.tipo || !form.cantidad || !form.unidad || !form.nombre || !form.correo) {
      setError('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    setError(null)

    try {
      // Petición POST al endpoint de donaciones del backend
      const response = await fetch(`${API_URL}/api/donaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo:          form.tipo,
          cantidad:      Number(form.cantidad), // Convierte string a número
          unidad:        form.unidad,
          origen:        `Donación de ${form.nombre}`,
          donanteNombre: form.nombre,
          donanteCorreo: form.correo,
        }),
      })

      // Si el servidor devuelve un error HTTP, lo lanza como excepción
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al registrar la donación')
      }

      const donacion = await response.json()

      // El OT puede ser null si la donación quedó en PENDIENTE (lo normal al registrar).
      // En ese caso se muestra un texto informando que llegará cuando sea confirmada.
      setOtGenerada(donacion.ot ?? `OT pendiente - ID #${donacion.id}`)

      // Limpia el formulario para permitir registrar otra donación
      setForm({ tipo: '', cantidad: '', unidad: '', nombre: '', correo: '' })

    } catch (err) {
      // Muestra el mensaje de error al usuario
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor')
    } finally {
      // Siempre desactiva el estado de carga al terminar, sin importar el resultado
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 px-6 py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Encabezado de la página */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-navy">Quiero donar</h1>
            <p className="text-gray-500">
              Registra tu donación en un minuto. Cuando la recibamos en el
              centro de acopio, recibirás tu código de seguimiento (OT).
            </p>
          </div>

          {/* Mensaje de error — solo se muestra si hay un error activo */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Confirmación exitosa con código OT — solo se muestra tras registro exitoso */}
          {otGenerada && (
            <div className="bg-teal/10 border border-teal rounded-2xl p-6 flex flex-col gap-2 text-center">
              <span className="text-navy font-semibold">¡Gracias por tu donación! 🎉</span>
              <p className="text-sm text-gray-600">
                Tu donación fue registrada. Cuando llegue al centro de acopio
                y sea confirmada, recibirás tu código de seguimiento.
              </p>
              {/* El código OT solo se muestra si ya fue generado por el backend */}
              {otGenerada.startsWith('OT-') && (
                <>
                  <p className="text-sm text-gray-600">Tu código es:</p>
                  <span className="text-2xl font-bold text-teal tracking-wider">
                    {otGenerada}
                  </span>
                </>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Guarda este código para consultar el estado de tu donación.
              </p>
              <button
                onClick={() => navigate('/seguimiento')}
                className="text-navy text-sm font-semibold underline mt-2"
              >
                Ver estado de mi donación →
              </button>
            </div>
          )}

          {/* Formulario de registro de donación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-5">

            {/* Sección: datos del bien donado */}
            <h2 className="text-lg font-semibold text-navy">Datos de la donación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                placeholder="Tipo (ej. Ropa)"
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <input
                name="cantidad"
                type="number"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad"
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <input
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                placeholder="Unidad (kg, cajas)"
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            {/* Sección: datos del donante */}
            <h2 className="text-lg font-semibold text-navy mt-2">Tus datos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            {/* Botón de envío — desactivado mientras se procesa la petición */}
            <button
              onClick={handleSubmit}
              disabled={cargando}
              className="bg-teal text-navy font-semibold px-6 py-3 rounded-lg
                         hover:bg-teal/90 transition-all duration-200 mt-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Registrando...' : 'Registrar donación'}
            </button>
          </div>

          {/* Acceso directo al seguimiento para donantes que ya registraron */}
          <div className="text-center">
            <button
              onClick={() => navigate('/seguimiento')}
              className="text-navy font-semibold text-sm hover:text-teal transition-colors"
            >
              ¿Ya donaste? Ver estado de mi donación →
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
