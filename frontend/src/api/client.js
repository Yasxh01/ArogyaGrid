// Determine best backend endpoint
const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_ENDPOINTS = [
  ...(ENV_API_URL ? [ENV_API_URL] : []),
  'http://localhost:5000/api/v1',
  'http://127.0.0.1:5000/api/v1',
  '/api/v1'
];

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('arogya_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  let lastError = null;

  for (const baseUrl of API_ENDPOINTS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const text = await response.text();
      
      // If server returned an HTML error page (e.g. <!doctype or <html>)
      if (!text || text.trim().startsWith('<')) {
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        continue;
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        // If it was a deliberate backend validation error (e.g. "Email is already registered" or "Invalid password")
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(lastError?.message || 'Backend server is unreachable on port 5000. Please start the backend.');
}
