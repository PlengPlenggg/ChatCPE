const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL
  || `${window.location.protocol}//${window.location.hostname}:8000`;

type ApiResponse<T> = { data: T };

type ApiError = {
  response?: {
    data?: any;
    status?: number;
  };
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const authHeaders = getAuthHeaders();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const err: ApiError = {
      response: {
        data: payload || { detail: response.statusText },
        status: response.status
      }
    };
    throw err;
  }

  return { data: payload as T };
}

export const authAPI = {
  login(email: string, password: string) {
    return request<{ access_token: string; token_type: string; user_id: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  register(name: string, email: string, password: string, confirm_password: string) {
    return request<{ access_token: string; token_type: string; user_id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirm_password })
    });
  },
  getProfile() {
    return request<{ name: string; email: string; role: string }>('/auth/profile', {
      method: 'GET'
    });
  },
  updateProfile(name: string) {
    return request<{ message: string; user: { name: string; email: string; role: string } }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  },
  logout() {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST'
    });
  }
};

export const faqAPI = {
  getAllFAQs(active?: boolean) {
    const query = typeof active === 'boolean' ? `?active=${active}` : '';
    return request<any[]>(`/faq/${query}`, {
      method: 'GET'
    });
  }
};

export const chatAPI = {
  sendMessage(message: string, thread_id: string) {
    return request<{ chat_id: number; message: string; answer: string; thread_id: string }>("/chat/send", {
      method: 'POST',
      body: JSON.stringify({ message, thread_id })
    });
  },
  getHistory() {
    return request<any[]>("/chat/history", {
      method: 'GET'
    });
  },
  deleteHistory() {
    return request<{ message: string }>("/chat/history", {
      method: 'DELETE'
    });
  }
};

export const documentsAPI = {
  getForms() {
    return request<Array<{ code: string; title: string; url: string }>>("/documents/forms", {
      method: 'GET'
    });
  }
};
