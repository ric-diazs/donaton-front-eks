/**
 * @module pages/AdminDash
 * @description Página principal del panel de administración de Donaton.
 *
 * Esta página corresponde al caso de uso UC15 (Ver dashboard) y es accesible
 * exclusivamente para el actor Admin. Muestra una vista general del estado
 * del sistema con métricas en tiempo real y accesos directos a las secciones
 * de gestión administrativa.
 *
 * Métricas que se muestran:
 * - Total de donaciones registradas en el sistema.
 * - Necesidades activas pendientes de cobertura.
 * - Donaciones que completaron el ciclo (estado ENTREGADA).
 * - Total de usuarios internos registrados.
 *
 * Accesos directos disponibles:
 * - Gestionar usuarios (UC16) → /admin-usuarios
 * - Gestionar centros de acopio (UC18) → /admin-centros
 *
 * Comunicación con el backend:
 * - GET /api/donaciones → lista completa de donaciones para calcular métricas.
 * - GET /api/necesidades → lista de necesidades para calcular cuántas están activas.
 * - GET /api/usuarios → lista de usuarios para mostrar el total del sistema.
 * Las tres peticiones se lanzan en paralelo al cargar la página para reducir el tiempo de espera.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Donacion, Necesidad, Usuario } from '../types'

/** URL base del backend tomada de la variable de entorno VITE_API_URL del archivo .env */
const API = import.meta.env.VITE_API_URL

/**
 * Panel de administración del sistema Donaton.
 * Carga donaciones, necesidades y usuarios en paralelo al montar el componente,
 * calcula las métricas del sistema y las presenta en tarjetas visuales.
 * Mientras los datos cargan, muestra '...' en lugar de los números.
 *
 * @returns Página completa con tarjetas de métricas y accesos a gestión.
 */
export default function AdminDash() {
  /** Lista de donaciones cargadas desde el backend para calcular métricas. */
  const [donaciones, setDonaciones] = useState<Donacion[]>([])

  /** Lista de necesidades cargadas desde el backend para calcular cuántas están activas. */
  const [necesidades, setNecesidades] = useState<Necesidad[]>([])

  /** Lista de usuarios internos del sistema para mostrar el total. */
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  /** true mientras las tres peticiones al backend están en curso. */
  const [cargando, setCargando] = useState(true)

  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Lanza tres peticiones al backend en paralelo usando Promise.all,
   * lo que significa que las tres se ejecutan al mismo tiempo en vez de
   * esperar una para iniciar la siguiente. Cuando las tres terminan,
   * actualiza los estados correspondientes de una sola vez.
   */
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/donaciones`).then((r) => r.json()),
      fetch(`${API}/api/necesidades`).then((r) => r.json()),
      fetch(`${API}/api/usuarios`).then((r) => r.json()),
    ])
      .then(([d, n, u]) => {
        setDonaciones(d)
        setNecesidades(n)
        setUsuarios(u)
      })
      .catch((e) => console.error('Error cargando datos del dashboard:', e))
      .finally(() => setCargando(false))
  }, [])

  /** Número total de donaciones en el sistema. */
  const totalDonaciones = donaciones.length

  /** Número de necesidades en estado ACTIVA (pendientes de cobertura). */
  const necesidadesActivas = necesidades.filter((n) => n.estado === 'ACTIVA').length

  /** Número de donaciones que completaron el ciclo (estado ENTREGADA). */
  const entregadas = donaciones.filter((d) => d.estado === 'ENTREGADA').length

  /** Número total de usuarios internos registrados en el sistema. */
  const totalUsuarios = usuarios.length

  /**
   * Configuración de las tarjetas de métricas del dashboard.
   * Cada objeto define el texto, valor calculado, color y ícono SVG de una tarjeta.
   * El valor muestra '...' mientras los datos están cargando.
   */
  const metricas = [
    {
      label: 'Total de donaciones',
      valor: cargando ? '...' : totalDonaciones,
      color: 'bg-blue-50 text-blue-600',
      icono: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    },
    {
      label: 'Necesidades activas',
      valor: cargando ? '...' : necesidadesActivas,
      color: 'bg-amber-50 text-amber-600',
      icono: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Donaciones entregadas',
      valor: cargando ? '...' : entregadas,
      color: 'bg-green-50 text-green-600',
      icono: 'M5 13l4 4L19 7',
    },
    {
      label: 'Total de usuarios',
      valor: cargando ? '...' : totalUsuarios,
      color: 'bg-teal/10 text-teal',
      icono: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Encabezado del panel */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-navy">Panel de Administración</h1>
          <p className="text-gray-500 text-sm">Vista general del sistema y accesos a la gestión.</p>
        </div>

        {/* Tarjetas de métricas — cuatro indicadores clave del sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((m) => (
            <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.color}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icono} />
                </svg>
              </div>
              <span className="text-3xl font-bold text-navy">{m.valor}</span>
              <span className="text-sm text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Accesos directos a las secciones de gestión administrativa */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-navy">Gestión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Acceso a gestión de usuarios (UC16) */}
            <Link
              to="/admin-usuarios"
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                         flex items-center justify-between
                         hover:border-teal hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-navy">Gestionar usuarios</span>
                  <span className="text-sm text-gray-500">Crear y administrar roles del sistema</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Acceso a gestión de centros de acopio (UC18) */}
            <Link
              to="/admin-centros"
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                         flex items-center justify-between
                         hover:border-teal hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-navy">Centros de acopio</span>
                  <span className="text-sm text-gray-500">Ver capacidades y crear nuevos centros</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}
