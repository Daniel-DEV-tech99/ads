import axios from 'axios'

// Create a request cache for GET requests
const requestCache = new Map();

// Create axios instance with optimized settings
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACK_END_URL}`,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Add authentication token
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Implement request caching for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      
      // Check if we have a cached response and it's not expired (30 seconds cache)
      const cachedResponse = requestCache.get(cacheKey)
      if (cachedResponse && Date.now() - cachedResponse.timestamp < 30000) {
        // Return cached response as a resolved promise
        config.adapter = () => {
          return Promise.resolve({
            data: cachedResponse.data,
            status: 200,
            statusText: 'OK',
            headers: cachedResponse.headers,
            config: config,
            request: null
          })
        }
      }
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  response => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`
      
      requestCache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      })
    }
    
    return response
  },
  error => {
    // Handle common errors
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('Response error:', error.response.status, error.response.data)
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if needed
        localStorage.removeItem('accessToken')
        // You might want to redirect to login page here
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Function to clear cache
export const clearRequestCache = () => {
  requestCache.clear()
}

export default axiosInstance
