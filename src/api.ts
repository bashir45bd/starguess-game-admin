// API client for StarGuess REST API (Emulates the PHP 8.2+ REST API endpoints)

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
}

class ApiClient {
  private baseUrl = '/starguess-admin/api/v1';
  private token: string | null = null;

  constructor() {
    this.token = sessionStorage.getItem('starguess_admin_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('starguess_admin_token', token);
    } else {
      sessionStorage.removeItem('starguess_admin_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error_code: json.error_code || `HTTP_${res.status}`,
          error: json.message || json.error || `Request failed with status ${res.status}`
        };
      }
      return json;
    } catch (err: any) {
      return {
        success: false,
        error_code: 'NETWORK_ERROR',
        error: err.message || 'Network connection failed'
      };
    }
  }

  // Auth
  login(credentials: { username: string; password: string }) {
    return this.request('/admin/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  }

  logout() {
    return this.request('/admin/auth/logout', { method: 'POST' });
  }

  getMe() {
    return this.request('/admin/auth/me');
  }

  changePassword(data: { current_password: string; new_password: string }) {
    return this.request('/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateAdminProfile(data: { username: string; email: string; full_name: string; current_password: string }) {
    return this.request('/admin/auth/update-profile', { method: 'POST', body: JSON.stringify(data) });
  }
  getAdmins() { return this.request('/admin/admins'); }
  getAdminRoles() { return this.request('/admin/admin-roles'); }
  createAdmin(data: Record<string, unknown>) { return this.request('/admin/admins', { method: 'POST', body: JSON.stringify(data) }); }
  updateAdmin(id: number, data: Record<string, unknown>) { return this.request(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

  switchRole(role: string) {
    return this.request('/admin/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) });
  }

  // Dashboard
  getKPIs() {
    return this.request('/admin/dashboard/kpis');
  }

  getCharts() {
    return this.request('/admin/dashboard/charts');
  }

  // Users
  getUsers(params: { search?: string; status?: string; risk_level?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin/users${query ? '?' + query : ''}`);
  }

  getUser(id: number) {
    return this.request(`/admin/users/${id}`);
  }

  updateUserStatus(id: number, status: string, reason: string) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  updateUserRisk(id: number, risk_level: string, reason: string) {
    return this.request(`/admin/users/${id}/risk`, {
      method: 'PUT',
      body: JSON.stringify({ risk_level, reason })
    });
  }

  resetUserPassword(id: number) {
    return this.request(`/admin/users/${id}/reset-password`, { method: 'POST' });
  }

  // Wallets
  getWallets() {
    return this.request('/admin/wallets');
  }

  getTransactions(params: { type?: string; user_id?: number; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin/transactions${query ? '?' + query : ''}`);
  }

  adjustStars(data: { user_id: number; amount: number; reason: string }) {
    return this.request('/admin/wallets/adjust', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Star Packages
  getPackages() {
    return this.request('/admin/star-packages');
  }

  createPackage(data: any) {
    return this.request('/admin/star-packages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updatePackage(id: number, data: any) {
    return this.request(`/admin/star-packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Game Modes & Commission
  getGameModes() {
    return this.request('/admin/game-modes');
  }

  updateGameMode(id: number, data: any) {
    return this.request(`/admin/game-modes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  getCommissions() {
    return this.request('/admin/commissions');
  }

  // Games & Live Monitor
  getGames(params: { status?: string; mode_id?: string; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin/games${query ? '?' + query : ''}`);
  }

  getLiveGames() {
    return this.request('/admin/games/live');
  }

  getGameDetails(id: string) {
    return this.request(`/admin/games/${id}`);
  }

  getGameTimeline(id: string) {
    return this.request(`/admin/games/${id}/timeline`);
  }

  simulateGameStep(id: string) {
    return this.request(`/admin/games/${id}/simulate-step`, { method: 'POST' });
  }

  refundGame(id: string, reason: string, admin_password: string) {
    return this.request(`/admin/games/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason, admin_password })
    });
  }

  // Payments & Reconciliation
  getPayments() {
    return this.request('/admin/payments');
  }

  reconcilePayments() {
    return this.request('/admin/payments/reconcile', { method: 'POST' });
  }

  // Disputes
  getDisputes() {
    return this.request('/admin/disputes');
  }

  resolveDispute(id: string, decision: string, refund_amount: number, admin_notes: string) {
    return this.request(`/admin/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ decision, refund_amount, admin_notes })
    });
  }

  // Leaderboards, Rewards, Referrals
  getLeaderboards() {
    return this.request('/admin/leaderboards');
  }

  getRewards() {
    return this.request('/admin/rewards');
  }

  getReferrals() {
    return this.request('/admin/referrals');
  }

  // Anti Fraud
  getAntiFraud() {
    return this.request('/admin/anti-fraud');
  }

  updateAlertStatus(id: number, status: string) {
    return this.request(`/admin/anti-fraud/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Audit Logs
  getAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  // Settings
  getSettings() {
    return this.request('/admin/settings');
  }

  updateSettings(settings: Record<string, string>) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Notifications
  broadcastNotification(data: { title: string; message: string; type: string; audience: string }) {
    return this.request('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Backup & Health
  getBackupStatus() {
    return this.request('/admin/backup/status');
  }

  triggerBackup() {
    return this.request('/admin/backup/trigger', { method: 'POST' });
  }

  // Docs
  getDocs() {
    return this.request('/docs');
  }
}

export const api = new ApiClient();
