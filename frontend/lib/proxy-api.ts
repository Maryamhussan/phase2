// frontend/lib/proxy-api.ts
// API utility to use proxy routes for avoiding CORS issues

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Interface for creating/updating tasks where some fields are optional
export interface TaskInput {
  id?: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

class ProxyApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = this.getAuthToken();

    // Ensure all headers are strings
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge headers properly, ensuring they're all strings
    const mergedHeaders = { ...baseHeaders, ...options.headers };
    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(mergedHeaders)) {
      headers[key] = String(value);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getTasks(): Promise<Task[]> {
    const response = await this.makeRequest('/api/tasks');
    return response.json();
  }

  async createTask(task: Omit<TaskInput, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const response = await this.makeRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.json();
  }

  async updateTask(id: number, task: Partial<Omit<TaskInput, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    const response = await this.makeRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
    return response.json();
  }

  async updateTaskCompletion(id: number, completed: boolean): Promise<Task> {
    const response = await this.makeRequest(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
    return response.json();
  }

  async deleteTask(id: number): Promise<void> {
    await this.makeRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const proxyApiClient = new ProxyApiClient();