/**
 * Laravel API Client
 * Handles all API communication with the Laravel backend
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profession?: string;
  company?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_at?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Use environment variable or default to localhost:8000
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Check if body is FormData to handle headers appropriately
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge additional headers from options if they exist and it's not FormData
    if (options.headers && !isFormData) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        if (!response.ok) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        // For successful non-JSON responses, return empty data
        data = {};
      }

      if (!response.ok) {
        // Extract specific error message from Laravel response structure
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        console.log('=== API Error Debug ===');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));
        console.log('Data type:', typeof data);
        console.log('Has errors?', !!data?.errors);
        console.log('errors object:', JSON.stringify(data?.errors, null, 2));
        console.log('errors.error value:', data?.errors?.error);
        console.log('data.errors type:', typeof data?.errors);

        if (data && typeof data === 'object') {
          // Priority: errors.error (our specific auth errors)
          if (data.errors && typeof data.errors === 'object' && data.errors.error) {
            errorMessage = String(data.errors.error);
            console.log('Using errors.error:', errorMessage);
          }
          // Fallback: data.error (if it's a string)
          else if (data.error && typeof data.error === 'string') {
            errorMessage = data.error;
            console.log('Using data.error:', errorMessage);
          }
          // Fallback: data.message (Laravel standard)
          else if (data.message && typeof data.message === 'string') {
            errorMessage = data.message;
            console.log('Using data.message:', errorMessage);
          }
        }

        console.log('Final error message:', errorMessage);
        console.log('=== End Debug ===');

        return {
          success: false,
          error: errorMessage,
          errors: data?.errors || null,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection and ensure the server is running.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    profession?: string;
    company?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/user');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Member management
  async getMembers(params?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ data: User[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Public members directory (no auth required)
  async getPublicMembers(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ data: User[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/public/members${queryString ? `?${queryString}` : ''}`;

    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request(endpoint);

    // Restore the token
    this.token = currentToken;

    return response;
  }

  async getMember(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async createMember(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    profession?: string;
    company?: string;
    role: string;
    status: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateMember(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Committees
  async getCommittees(): Promise<ApiResponse<any[]>> {
    return this.request('/committees');
  }

  async createCommittee(committeeData: any): Promise<ApiResponse<any>> {
    return this.request('/committees', {
      method: 'POST',
      body: JSON.stringify(committeeData),
    });
  }

  // Projects
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/projects');
  }

  async createProject(projectData: any): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Dues
  async getDues(): Promise<ApiResponse<any[]>> {
    return this.request('/dues');
  }

  async createDue(dueData: any): Promise<ApiResponse<any>> {
    return this.request('/dues', {
      method: 'POST',
      body: JSON.stringify(dueData),
    });
  }

  // Documents
  async getDocuments(): Promise<ApiResponse<any[]>> {
    return this.request('/documents');
  }

  async uploadDocument(formData: FormData): Promise<ApiResponse<any>> {
    return this.request('/documents', {
      method: 'POST',
      body: formData,
      // No headers needed - browser will set multipart/form-data automatically
    });
  }

  // Quotations
  async getQuotations(): Promise<ApiResponse<any[]>> {
    return this.request('/quotations');
  }

  async createQuotation(quotationData: any): Promise<ApiResponse<any>> {
    return this.request('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
  }

  // Analytics/Statistics
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/statistics/users');
  }

  // Blog Posts
  async getBlogPosts(params?: {
    search?: string;
    category?: string;
    status?: string;
    author_id?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/blog-posts${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getBlogPost(slug: string): Promise<ApiResponse<any>> {
    return this.request(`/blog-posts/${slug}`);
  }

  async createBlogPost(postData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    featured_image?: string;
    is_featured?: boolean;
    is_published?: boolean;
    published_at?: string;
    tags?: string[];
    meta_description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/blog-posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateBlogPost(id: string, postData: any): Promise<ApiResponse<any>> {
    return this.request(`/blog-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<any>> {
    return this.request(`/blog-posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getBlogStatistics(): Promise<ApiResponse<any>> {
    return this.request('/statistics/blog-posts');
  }

  async getFeaturedBlogPost(): Promise<ApiResponse<any>> {
    return this.request('/blog-posts/featured/current');
  }

  // Public blog methods
  async getPublicBlogPosts(params?: {
    search?: string;
    category?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/public/blog-posts${queryString ? `?${queryString}` : ''}`;

    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request(endpoint);

    // Restore the token
    this.token = currentToken;

    return response;
  }

  async getPublicBlogPost(slug: string): Promise<ApiResponse<any>> {
    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request(`/public/blog-posts/${slug}`);

    // Restore the token
    this.token = currentToken;

    return response;
  }

  async getPublicFeaturedBlogPost(): Promise<ApiResponse<any>> {
    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request('/public/blog-posts/featured/current');

    // Restore the token
    this.token = currentToken;

    return response;
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Events
  async getEvents(params?: {
    search?: string;
    status?: string;
    type?: string;
    category?: string;
    visibility?: string;
    timeframe?: string;
    featured?: boolean;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getEvent(id: string): Promise<ApiResponse<any>> {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    excerpt?: string;
    type: string;
    category: string;
    start_date: string;
    end_date: string;
    all_day?: boolean;
    location?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    max_attendees?: number;
    registration_fee?: number;
    registration_deadline?: string;
    requires_registration?: boolean;
    status: string;
    visibility: string;
    is_featured?: boolean;
    tags?: string[];
    notes?: string;
    contact_info?: any;
  }): Promise<ApiResponse<any>> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any): Promise<ApiResponse<any>> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<any>> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventStatistics(): Promise<ApiResponse<any>> {
    return this.request('/statistics/events');
  }

  async getFeaturedEvents(): Promise<ApiResponse<any>> {
    return this.request('/events/featured/current');
  }

  // Public event methods
  async getPublicEvents(params?: {
    search?: string;
    type?: string;
    category?: string;
    timeframe?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/public/events${queryString ? `?${queryString}` : ''}`;

    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request(endpoint);

    // Restore the token
    this.token = currentToken;

    return response;
  }

  async getPublicEvent(slug: string): Promise<ApiResponse<any>> {
    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request(`/public/events/${slug}`);

    // Restore the token
    this.token = currentToken;

    return response;
  }

  async getPublicFeaturedEvents(): Promise<ApiResponse<any>> {
    // Save current token and temporarily remove it for public access
    const currentToken = this.token;
    this.token = null;

    const response = await this.request('/public/events/featured/current');

    // Restore the token
    this.token = currentToken;

    return response;
  }

  // Health check method to verify API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { User, AuthResponse, ApiResponse };
