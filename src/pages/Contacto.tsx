/**
 * @module pages/Contacto
 * @author Remi García
 * @description Página de contacto de la plataforma Donaton.
 *
 * Página accesible desde la zona pública sin necesidad de autenticación.
 * Presenta un formulario de contacto con efecto visual de vidrio (glassmorphism)
 * sobre un video de fondo, lo que le da un aspecto visual distintivo respecto
 * al resto de las páginas del sistema.
 *
 * Funcionalidades:
 * - Formulario con campos nombre, correo, asunto y mensaje.
 * - Validación de campos obligatorios (nombre, correo y mensaje).
 * - Mensaje de confirmación al enviar correctamente.
 *
 * Nota de implementación: el formulario actualmente simula el envío cambiando
 * el estado local a 'enviado'. En una fase posterior se conectará a un endpoint
 * del backend o a un servicio de correo para enviar los mensajes realmente.
 */

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * Página de contacto con video de fondo y formulario con efecto vidrio.
 * Permite a cualquier visitante del sitio enviar un mensaje al equipo de Donaton.
 *
 * @returns Página completa con Navbar, sección de video con formulario y Footer.
 */
export default function Contacto() {
  /**
   * Estado del formulario de contacto.
   * nombre: nombre de quien escribe.
   * correo: correo electrónico para responder.
   * asunto: tema del mensaje (opcional).
   * mensaje: contenido del mensaje (obligatorio).
   */
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: '',
  })

  /**
   * Controla si el formulario fue enviado exitosamente.
   * Cuando es true, muestra el mensaje de confirmación en pantalla.
   */
  const [enviado, setEnviado] = useState(false)

  /**
   * Actualiza el estado del formulario cuando el usuario escribe en un campo.
   * Funciona tanto para inputs de texto como para el textarea del mensaje.
   *
   * @param e - Evento de cambio del input o textarea HTML.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /**
   * Maneja el envío del formulario de contacto.
   * Valida que nombre, correo y mensaje estén completos.
   * Si la validación pasa, marca el formulario como enviado y lo limpia.
   * El asunto es opcional y no bloquea el envío si está vacío.
   */
  const handleSubmit = () => {
    if (!form.nombre || !form.correo || !form.mensaje) {
      alert('Por favor completa nombre, correo y mensaje.')
      return
    }
    setEnviado(true)
    setForm({ nombre: '', correo: '', asunto: '', mensaje: '' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Sección principal con video de fondo */}
      <main className="relative flex-1 overflow-hidden flex items-center justify-center px-6 py-20">

        {/* Video de fondo reproducido en bucle sin sonido */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/fondo.mp4" type="video/mp4" />
        </video>

        {/* Capa oscura sobre el video para mejorar legibilidad del formulario */}
        <div className="absolute inset-0 bg-navy/70 z-10" />

        {/* Formulario con efecto de vidrio (glassmorphism) */}
        <div className="relative z-20 w-full max-w-lg
                        bg-white/10 backdrop-blur-md
                        border border-white/20 rounded-2xl
                        p-8 md:p-10 flex flex-col gap-5
                        shadow-2xl">

          {/* Encabezado del formulario */}
          <div className="text-center flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">Contáctanos</h1>
            <p className="text-gray-200 text-sm">
              ¿Tienes dudas o quieres colaborar? Escríbenos.
            </p>
          </div>

          {/* Confirmación de envío exitoso — solo visible tras enviar */}
          {enviado && (
            <div className="bg-teal/20 border border-teal text-white rounded-xl p-4 text-sm">
              ✅ ¡Mensaje enviado! Te responderemos pronto.
            </div>
          )}

          {/* Campo nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-sm
                         text-white placeholder-gray-300
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>

          {/* Campo correo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-sm
                         text-white placeholder-gray-300
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>

          {/* Campo asunto (opcional) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Asunto</label>
            <input
              type="text"
              name="asunto"
              value={form.asunto}
              onChange={handleChange}
              placeholder="¿Sobre qué nos escribes?"
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-sm
                         text-white placeholder-gray-300
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>

          {/* Campo mensaje (obligatorio) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Mensaje</label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-sm resize-none
                         text-white placeholder-gray-300
                         focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>

          {/* Botón de envío */}
          <button
            onClick={handleSubmit}
            className="bg-teal text-navy font-semibold px-6 py-3 rounded-lg
                       hover:bg-teal/90 transition-all duration-200 mt-2"
          >
            Enviar mensaje
          </button>

        </div>
      </main>

      <Footer />
    </div>
  )
}