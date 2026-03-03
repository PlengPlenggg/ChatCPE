export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL
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
    return request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirm_password })
    });
  },
  getProfile() {
    return request<{ name: string; email: string; role: string }>('/auth/profile', {
      method: 'GET'
    }).then(res => {
      console.log('getProfile response:', res.data);
      return res;
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
  },
  forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  resetPassword(token: string, new_password: string) {
    return request<{ message: string; success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password })
    });
  },
  deleteUser(user_id: number) {
    return request<{ message: string }>(`/auth/users/${user_id}`, {
      method: 'DELETE'
    });
  },
  notifyUserBeforeDelete(user_id: number) {
    return request<{ message: string }>(`/auth/users/${user_id}/notify-delete`, {
      method: 'POST'
    });
  },
  getUsers() {
    return request<any[]>('/auth/users', {
      method: 'GET'
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
  deleteThread(threadId: string) {
    return request<{ message: string }>(`/chat/threads/${threadId}`, {
      method: 'DELETE'
    });
  },
  deleteHistory() {
    return request<{ message: string }>("/chat/history", {
      method: 'DELETE'
    });
  },
  getAdminAnalytics(days?: number) {
    const query = typeof days === 'number' ? `?days=${days}` : '';
    return request<{
      total_questions: number;
      unique_users: number;
      top_questions: Array<{ question: string; count: number }>;
      hourly_usage: Array<{ hour: number; count: number }>;
      daily_usage: Array<{ date: string; count: number }>;
      weekday_usage: Array<{ day: string; count: number }>;
      peak_hour: { hour: number; count: number; label: string };
      peak_day: { date: string | null; count: number };
      generated_at: string;
      applied_range_days?: number | null;
    }>(`/chat/analytics${query}`, {
      method: 'GET'
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

export const filesAPI = {
  getCategories() {
    return request<{ categories: Array<{ key: string; label: string }> }>("/files/categories", {
      method: 'GET'
    });
  },
  async uploadTrainingFiles(category: string, files: File[]) {
    const formData = new FormData();
    formData.append('category', category);
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/files/upload/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
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

    return {
      data: payload as { category: string; category_label: string; filenames: string[] }
    };
  }
};
