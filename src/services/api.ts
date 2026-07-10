/**
 * @module services/api
 * @author Ricardo Díaz
 * @description Configuración central de Axios para las peticiones HTTP al backend.
 */
import axios from 'axios'

const getBaseURL = () => {
  return 'http://aab9c27dc765f4cd0b21367122be0b07-604008f835f81e17.elb.us-east-1.amazonaws.com'
}

console.log('API URL:', getBaseURL())

const api = axios.create({
  baseURL: getBaseURL(),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('donaton_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
