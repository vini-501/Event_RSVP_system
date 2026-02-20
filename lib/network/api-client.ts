import { ApiResponse } from '../api/utils/formatters';

class ApiClient {
  private baseUrl = '/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    const json: ApiResponse<T> = await response.json();

    if (!json.success) {
      throw new Error(json.error?.message || 'API request failed');
    }

    return json.data as T;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', 'POST', {
      email,
      password,
    });
    this.token = response.token;
    return response;
  }

  async signup(data: any) {
    const response = await this.request<{ token: string; user: any }>(
      '/auth/signup',
      'POST',
      data
    );
    this.token = response.token;
    return response;
  }

  async logout() {
    await this.request('/auth/logout', 'POST');
    this.token = null;
  }

  async refreshToken() {
    const response = await this.request<{ token: string }>('/auth/refresh', 'POST');
    this.token = response.token;
    return response;
  }

  // Events endpoints
  async getEvents(filters?: { category?: string; location?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return this.request<any>(`/events${queryString ? '?' + queryString : ''}`, 'GET');
  }

  async getEvent(eventId: string) {
    return this.request<any>(`/events/${eventId}`, 'GET');
  }

  async createEvent(data: any) {
    return this.request<any>('/events', 'POST', data);
  }

  async updateEvent(eventId: string, data: any) {
    return this.request<any>(`/events/${eventId}`, 'PUT', data);
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, 'DELETE');
  }

  async getEventAttendees(eventId: string) {
    return this.request<any>(`/events/${eventId}/attendees`, 'GET');
  }

  // RSVPs endpoints
  async getUserRsvps() {
    return this.request<any>('/rsvps', 'GET');
  }

  async getRsvp(rsvpId: string) {
    return this.request<any>(`/rsvps/${rsvpId}`, 'GET');
  }

  async createRsvp(data: any) {
    return this.request<any>('/rsvps', 'POST', data);
  }

  async updateRsvp(rsvpId: string, data: any) {
    return this.request<any>(`/rsvps/${rsvpId}`, 'PUT', data);
  }

  async deleteRsvp(rsvpId: string) {
    return this.request(`/rsvps/${rsvpId}`, 'DELETE');
  }

  // Tickets endpoints
  async getUserTickets() {
    return this.request<any>('/tickets', 'GET');
  }

  async getQrCode(ticketId: string) {
    return this.request<any>(`/tickets/${ticketId}/qr-code`, 'GET');
  }

  async checkInTicket(ticketId: string, checkInTimestamp: string) {
    return this.request<any>(`/tickets/${ticketId}/check-in`, 'PUT', {
      checkInTimestamp,
    });
  }

  // Organizer endpoints
  async getEventAnalytics(eventId: string) {
    return this.request<any>(`/organizer/analytics/${eventId}`, 'GET');
  }

  async exportAttendees(eventId: string) {
    const url = `${this.baseUrl}/organizer/export/${eventId}`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export attendees');
    }

    return response.blob();
  }

  // Notifications endpoints
  async getNotifications(filters?: { unread?: boolean; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.unread) params.append('unread', 'true');
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return this.request<any>(
      `/notifications${queryString ? '?' + queryString : ''}`,
      'GET'
    );
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}`, 'PUT');
  }
}

export const apiClient = new ApiClient();
