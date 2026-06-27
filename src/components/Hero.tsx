/**
 * @module components/Hero
 * @author Remi García
 * @description Componente de sección principal (hero) de la Landing page de Donaton.
 *
 * Es la primera sección visible al ingresar al sistema, diseñada para comunicar
 * el propósito central de Donaton y dirigir al visitante hacia las dos acciones
 * principales: registrar una donación o ingresar al sistema como usuario interno.
 *
 * Elementos visuales:
 * - Badge de categoría: identifica la plataforma como coordinación humanitaria en Chile.
 * - Título principal: mensaje central de la propuesta de valor de Donaton.
 * - Subtítulo: descripción breve de cómo funciona el sistema.
 * - Dos botones de acción: "Quiero donar" → /donar y "Ingresar al sistema" → /login.
 * - Indicador de scroll: animación de rebote que invita a seguir explorando la página.
 *
 * Usa fondo navy con texto blanco y acentos en teal, siguiendo la paleta
 * de colores definida en tailwind.config.js del proyecto.
 */

import { useNavigate } from 'react-router-dom'

/**
 * Sección hero de la Landing page.
 * Ocupa al menos el 90% de la altura de la ventana para impacto visual inmediato.
 *
 * @returns Sección con badge, título, subtítulo, botones de acción e indicador de scroll.
 */
export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="bg-navy min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 gap-8">

      {/* Badge de categoría */}
      <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 px-4 py-2 rounded-full">
        <span className="w-2 h-2 rounded-full bg-teal" />
        <span className="text-teal text-sm font-medium">
          Coordinación humanitaria · Chile
        </span>
      </div>

      {/* Título principal con acento en teal */}
      <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight max-w-3xl">
        Donaciones que llegan
        <br />
        <span className="text-teal">a donde más importan</span>
      </h1>

      {/* Subtítulo con propuesta de valor */}
      <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
        Donaton conecta donaciones con necesidades reales en tiempo real.
        Reducimos el desperdicio mediante trazabilidad digital,
        asegurando que cada aporte llegue a quien más lo necesita.
      </p>

      {/* Botones de acción principal */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Botón primario: dirige al portal del donante */}
        <button
          onClick={() => navigate('/donar')}
          className="bg-teal text-navy font-semibold px-8 py-3.5 rounded-xl
                     hover:bg-teal/90 transition-all duration-200 text-base"
        >
          Quiero donar
        </button>
        {/* Botón secundario: dirige al login del sistema interno */}
        <button
          onClick={() => navigate('/login')}
          className="border border-white text-white font-semibold px-8 py-3.5 rounded-xl
                     hover:bg-white/10 transition-all duration-200 text-base"
        >
          Ingresar al sistema
        </button>
      </div>

      {/* Indicador de scroll con animación de rebote */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-gray-500 text-xs">Descubre más</span>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

    </section>
  )
}
