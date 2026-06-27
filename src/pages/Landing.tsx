/**
 * @module pages/Landing
 * @author Remi García, Ricardo Díaz
 * @description Página de inicio pública de la plataforma Donaton.
 *
 * Es la primera página que ve cualquier visitante al ingresar al sistema.
 * No requiere autenticación y actúa como punto de entrada tanto para donantes
 * como para usuarios internos que aún no han iniciado sesión.
 *
 * La página está compuesta por seis secciones en orden vertical:
 * - Navbar: barra de navegación con acceso al login y al portal del donante.
 * - Hero: sección principal con el mensaje central y llamada a la acción.
 * - ComoFunciona: explica el proceso de donación en tres pasos.
 * - MisionVision: presenta la misión y visión de la fundación Donaton.
 * - ColaboradoresCarrusel: muestra los organismos colaboradores del sistema.
 * - Footer: pie de página con información de contacto y enlaces.
 *
 * Cada sección es un componente independiente importado desde la carpeta
 * components/, lo que permite mantener y actualizar cada parte por separado.
 */

import Navbar               from '../components/Navbar'
import Hero                 from '../components/Hero'
import ComoFunciona         from '../components/ComoFunsiona'
import MisionVision         from '../components/MisionVision'
import ColaboradoresCarrusel from '../components/Colaboradores'
import Footer               from '../components/Footer'

/**
 * Página de inicio pública de Donaton.
 * Ensambla todos los componentes de la landing en orden vertical.
 *
 * @returns Página completa con todas las secciones de la landing.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Sección hero con mensaje principal y llamada a la acción */}
        <Hero />
        {/* Explicación del proceso de donación en tres pasos */}
        <ComoFunciona />
        {/* Misión y visión de la fundación Donaton */}
        <MisionVision />
        {/* Carrusel de organismos colaboradores */}
        <ColaboradoresCarrusel />
        {/* Pie de página */}
        <Footer />
      </main>
    </div>
  )
}