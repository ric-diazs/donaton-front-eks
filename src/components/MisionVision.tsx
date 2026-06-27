/**
 * @module components/MisionVision
 * @author Ricardo Díaz
 * @description Componente de sección misión y visión de la fundación Donaton.
 *
 * Presenta el propósito institucional de Donaton mediante dos tarjetas con
 * fondo navy, ícono SVG, título, descripción e imagen ilustrativa.
 * Se usa en la Landing page como sección de propósito organizacional.
 *
 * Misión: conectar donaciones con necesidades reales mediante trazabilidad digital.
 * Visión: ser la red de coordinación humanitaria de referencia en Chile,
 * integrando instituciones públicas, privadas y organismos internacionales.
 */

/**
 * Sección de misión y visión de la fundación Donaton.
 * Presenta dos tarjetas en paralelo con fondo navy y acentos en teal.
 *
 * @returns Sección con encabezado y dos tarjetas de misión y visión.
 */
export default function MisionVision() {
  return (
    <section id="mision" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">

        {/* Encabezado de la sección */}
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-4xl font-bold text-navy">
            Nuestro propósito
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Lo que nos mueve y hacia dónde vamos como plataforma de
            coordinación humanitaria.
          </p>
        </div>

        {/* Grilla de dos tarjetas: misión y visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tarjeta de Misión */}
          <div className="bg-navy rounded-2xl p-10 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* Ícono de rayo — representa acción e impacto inmediato */}
              <div className="w-12 h-12 rounded-xl bg-teal/15 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Misión</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Conectar donaciones con necesidades reales mediante una plataforma
              digital trazable, reduciendo el desperdicio y asegurando que cada
              aporte llegue de forma transparente a quienes más lo necesitan.
            </p>
            <img
              src="/image/mision.png"
              alt="Misión"
              className="w-full h-30 object-cover rounded-xl"
            />
          </div>

          {/* Tarjeta de Visión */}
          <div className="bg-navy rounded-2xl p-10 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* Ícono de ojo — representa alcance y visión de largo plazo */}
              <div className="w-12 h-12 rounded-xl bg-teal/15 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Visión</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Ser la red de coordinación humanitaria de referencia en Chile,
              integrando instituciones públicas, privadas y organismos
              internacionales en un ecosistema único de ayuda eficiente y
              transparente.
            </p>
            <img
              src="/image/vision.png"
              alt="Visión"
              className="w-full h-30 object-cover rounded-xl"
            />
          </div>

        </div>

      </div>
    </section>
  )
}
