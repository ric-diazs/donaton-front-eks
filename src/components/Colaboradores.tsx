/**
 * @module components/Colaboradores
 * @author Ricardo Díaz
 * @description Componente de carrusel animado de organizaciones colaboradoras de Donaton.
 *
 * Muestra las instituciones públicas, privadas y organismos internacionales
 * que colaboran con la plataforma Donaton. Se usa en la Landing page como
 * sección de validación institucional del proyecto.
 *
 * El carrusel se construye duplicando la lista original de colaboradores
 * para crear un efecto de desplazamiento continuo e infinito mediante
 * la animación CSS scroll-logos definida en tailwind.config.js.
 * Al pausar el mouse sobre el carrusel, la animación se detiene.
 *
 * Colaboradores incluidos:
 * SENAPRED, Cruz Roja, BID Lab, PNUD Chile, Gobierno de Chile,
 * Municipalidad de Valparaíso, Duoc UC, Desafío Levantemos Chile.
 */

/** Lista de organizaciones colaboradoras con nombre y ruta del logo. */
const colaboradores = [
  { nombre: 'SENAPRED',                    logo: '/image/senapred.png' },
  { nombre: 'Cruz Roja',                   logo: '/image/cruzroja.png' },
  { nombre: 'BID Lab',                     logo: '/image/bid.png' },
  { nombre: 'PNUD Chile',                  logo: '/image/pnud.png' },
  { nombre: 'Gobierno de Chile',           logo: '/image/gob.png' },
  { nombre: 'Municipalidad de Valparaiso', logo: '/image/valparaiso.png' },
  { nombre: 'Duoc UC',                     logo: '/image/duoc.png' },
  { nombre: 'Desafio Levantemos Chile',    logo: '/image/dlc.png' },
]

/**
 * Lista duplicada de colaboradores para crear el efecto de carrusel infinito.
 * Al terminar de desplazarse la primera copia, la segunda ya está en posición
 * para continuar sin cortes visibles.
 */
const all = [...colaboradores, ...colaboradores]

/**
 * Carrusel animado de organizaciones colaboradoras.
 * La animación scroll-logos está definida en tailwind.config.js y se pausa
 * automáticamente cuando el usuario posa el mouse sobre el carrusel.
 *
 * @returns Sección con encabezado y carrusel horizontal de logos institucionales.
 */
export default function ColaboradoresCarrusel() {
  return (
    <section id="colaboradores" className="bg-gray-50 py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">

        {/* Encabezado de la sección */}
        <div className="text-center flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 bg-teal px-4 py-2 rounded-full mx-auto w-fit">
            <span className="w-2 h-2 rounded-full bg-navy" />
            <span className="text-sm font-medium text-navy">
              Red de colaboradores
            </span>
          </div>
          <h2 className="text-4xl font-bold text-navy">
            Organizaciones que confían en Donaton
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
            Trabajamos junto a instituciones públicas, privadas y organismos
            internacionales para garantizar que cada donación llegue a quien
            más la necesita.
          </p>
        </div>

        {/* Carrusel con animación de desplazamiento continuo */}
        <div className="w-full overflow-hidden">
          <div className="flex gap-6 items-center w-max animate-scroll-logos hover:[animation-play-state:paused]">
            {all.map((org, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2
                           w-48 h-32 flex-shrink-0 px-6 py-4
                           bg-white border border-gray-200 rounded-xl
                           hover:border-teal hover:shadow-md
                           transition-all duration-200"
              >
                {/* Logo de la organización */}
                <img
                  src={org.logo}
                  alt={org.nombre}
                  className="max-h-16 max-w-full object-contain"
                />
                {/* Nombre de la organización */}
                <span className="text-sm font-semibold text-navy text-center">
                  {org.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
