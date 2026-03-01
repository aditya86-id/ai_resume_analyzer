import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = {
  async request(endpoint, options = {}) {
    const { token } = useAuthStore.getState();
    const url = `${API_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: import.meta.env.VITE_API_TIMEOUT,
      });

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().logout();
        }
        
        // Try to parse error details from response
        let errorMessage = `API Error: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (typeof errorData === 'object') {
            // Handle field-specific errors
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && Array.isArray(errorData[firstKey])) {
              errorMessage = errorData[firstKey][0];
            } else if (firstKey && typeof errorData[firstKey] === 'string') {
              errorMessage = errorData[firstKey];
            }
          }
        } catch (e) {
          // If response is not JSON, use statusText
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },

  async upload(endpoint, formData, options) {
    const { token } = useAuthStore.getState();
    const url = `${API_URL}${endpoint}`;

    const headers = { ...options?.headers };

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error details from response
        let errorMessage = `Upload failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (typeof errorData === 'object') {
            // Handle field-specific errors
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && Array.isArray(errorData[firstKey])) {
              errorMessage = errorData[firstKey][0];
            } else if (firstKey && typeof errorData[firstKey] === 'string') {
              errorMessage = errorData[firstKey];
            }
          }
        } catch (e) {
          // If response is not JSON, use statusText
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },
};
