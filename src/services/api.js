import axios from 'axios'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // URL de ejemplo
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api