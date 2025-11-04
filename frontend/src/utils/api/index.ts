import { APIResponse, UserProfile, OnlineGame, Tournament, Puzzle } from '../../types';

const API_BASE = '/api';

class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const token = localStorage.getItem('auth_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async register(username: string, email: string, password: string): Promise<APIResponse<{ user: UserProfile; token: string }>> {
    return this.post('/auth/register', { username, email, password });
  }

  async login(username: string, password: string): Promise<APIResponse<{ user: UserProfile; token: string }>> {
    return this.post('/auth/login', { username, password });
  }

  async logout(): Promise<APIResponse> {
    localStorage.removeItem('auth_token');
    return { success: true };
  }

  async getProfile(): Promise<APIResponse<UserProfile>> {
    return this.get('/user/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    return this.put('/user/profile', data);
  }

  async createGame(timeControl?: string): Promise<APIResponse<OnlineGame>> {
    return this.post('/games/create', { timeControl });
  }

  async joinGame(roomId: string): Promise<APIResponse<OnlineGame>> {
    return this.post(`/games/${roomId}/join`);
  }

  async getGame(roomId: string): Promise<APIResponse<OnlineGame>> {
    return this.get(`/games/${roomId}`);
  }

  async saveGame(gameData: Partial<OnlineGame>): Promise<APIResponse<OnlineGame>> {
    return this.post('/games/save', gameData);
  }

  async getGameHistory(userId: string, limit = 20): Promise<APIResponse<OnlineGame[]>> {
    return this.get(`/games/history/${userId}?limit=${limit}`);
  }

  async getTournaments(): Promise<APIResponse<Tournament[]>> {
    return this.get('/tournaments');
  }

  async joinTournament(tournamentId: string): Promise<APIResponse<Tournament>> {
    return this.post(`/tournaments/${tournamentId}/join`);
  }

  async getPuzzles(rating?: number, limit = 10): Promise<APIResponse<Puzzle[]>> {
    const query = rating ? `?rating=${rating}&limit=${limit}` : `?limit=${limit}`;
    return this.get(`/puzzles${query}`);
  }

  async submitPuzzleResult(puzzleId: string, correct: boolean, time: number): Promise<APIResponse> {
    return this.post(`/puzzles/${puzzleId}/result`, { correct, time });
  }

  async getLeaderboard(timeControl?: string): Promise<APIResponse<any[]>> {
    const query = timeControl ? `?timeControl=${timeControl}` : '';
    return this.get(`/leaderboard${query}`);
  }

  async searchUsers(query: string): Promise<APIResponse<UserProfile[]>> {
    return this.get(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async addFriend(userId: string): Promise<APIResponse> {
    return this.post(`/friends/${userId}/add`);
  }

  async removeFriend(userId: string): Promise<APIResponse> {
    return this.delete(`/friends/${userId}`);
  }

  async getFriends(): Promise<APIResponse<UserProfile[]>> {
    return this.get('/friends');
  }
}

export const api = new APIClient();

export default api;
