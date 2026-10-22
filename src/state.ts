// Global state and event dispatcher for StarGuess Admin Panel (Pure Vanilla JS)

export interface AdminSession {
  admin_id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN' | 'FINANCE_ADMIN' | 'GAME_MODERATOR';
  permissions: string[];
}

export type ViewRoute = 
  | 'dashboard'
  | 'users'
  | 'live-games'
  | 'games'
  | 'game-modes'
  | 'wallets'
  | 'packages'
  | 'payments'
  | 'disputes'
  | 'anti-fraud'
  | 'leaderboards'
  | 'audit-logs'
  | 'reports'
  | 'settings'
  | 'backup'
  | 'docs'
  | 'admins'
  | 'login';

class AppState {
  currentRoute: ViewRoute = 'dashboard';
  admin: AdminSession | null = null;
  isAuthenticated: boolean = false;
  sidebarOpen: boolean = true;
  activeModal: string | null = null;
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.admin = null;
    this.isAuthenticated = false;
  }

  setRoute(route: ViewRoute) {
    if (this.currentRoute !== route) {
      this.currentRoute = route;
      this.emit('routeChanged');
    }
  }

  setAdmin(admin: AdminSession | null) {
    this.admin = admin;
    this.isAuthenticated = !!admin;
    this.emit('authChanged');
  }

  hasPerm(perm: string): boolean {
    if (!this.admin) return false;
    if (this.admin.permissions.includes('*')) return true;
    if (this.admin.permissions.includes(perm)) return true;
    const prefix = perm.split(':')[0] + ':*';
    if (this.admin.permissions.includes(prefix)) return true;
    return false;
  }

  on(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: () => void) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error(`Error in event listener for [${event}]:`, err);
      }
    });
  }
}

export const state = new AppState();
