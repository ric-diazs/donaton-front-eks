import axios from 'axios'

const api = axios.create({
  baseURL: (window as any).API_URL || 'http://localhost:3001',
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
