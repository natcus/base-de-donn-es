const API_BASE_URL = 'http://localhost:8081/api';

const handleResponse = async (res: Response) => {
  const text = await res.text();
  
  if (!res.ok) {
    // Si le serveur a envoyé un message d'erreur, on l'utilise
    let errorMessage = `API Error: ${res.status}`;
    try {
        const errorData = text ? JSON.parse(text) : null;
        if (errorData && (errorData.message || errorData.error)) {
            errorMessage = errorData.message || errorData.error;
        }
    } catch (e) {
        if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
  
  return text ? JSON.parse(text) : null;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleResponse(res);
  },
  post: async (endpoint: string, data?: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },
  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API Error: ${res.status}`);
    }
    return res;
  }
};
