/**
 * @module services/api
 * @author Ricardo Díaz
 * @description Configuración central de Axios para las peticiones HTTP al backend.
 *
 * Crea una instancia de Axios preconfigurada con una URL que se toma de la variable de entorno VITE_API_URL.
 * - Interceptor de request que adjunta el token JWT en cada petición.
 * - Interceptor de response que maneja errores 401 redirigiendo al login.
 *
 */
 import axios from 'axios'
/**
 * Instancia de Axios configurada para el backend de Donaton.
 * La baseURL se toma de VITE_API_URL definida en el archivo .env.
 * se recibe un valor por defecto a localhost:3000 si la variable no está definida.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})
/**
 * Interceptor de REQUEST.
 * Antes de enviar cada petición, adjunta el token JWT almacenado en
 * localStorage al header Authorization en formato Bearer.
 * Si no hay token activo, la petición se envía sin el header.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('donaton_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
/**
 * Interceptor de RESPONSE.
 * Maneja dos casos:
 * - Respuesta exitosa: la pasa directamente al componente sin modificarla.
 * - Error 401 (Unauthorized): elimina el token y los datos del usuario del
 *   localStorage y redirige automáticamente a /login.
 *   Esto protege las rutas privadas ante tokens expirados o inválidos.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('donaton_token')
      localStorage.removeItem('donaton_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api