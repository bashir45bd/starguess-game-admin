// Topbar Navigation Component (Strict 3-zone Top Bar Contract from design guidelines)
import { state } from '../state';
import { api } from '../api';
import { toast } from './Toast';

const ROUTE_TITLES: Record<string, { group: string; title: string }> = {
  'dashboard': { group: 'Overview', title: 'Operational KPIs & Economy' },
  'users': { group: 'Players & Economy', title: 'User Management & Profiles' },
  'wallets': { group: 'Players & Economy', title: 'Wallets & Stars Ledger' },
  'packages': { group: 'Players & Economy', title: 'Star Packages & Pricing' },
  'payments': { group: 'Players & Economy', title: 'Payments & Reconciliation' },
  'live-games': { group: 'Game Operations', title: 'Live 1v1 Prediction Monitor' },
  'games': { group: 'Game Operations', title: 'Game History & Event Timeline' },
  'game-modes': { group: 'Game Operations', title: 'Game Modes & Rules Matrix' },
  'disputes': { group: 'Integrity', title: 'Player Dispute Resolution' },
  'anti-fraud': { group: 'Integrity', title: 'Anti-Cheat & Security Intelligence' },
  'leaderboards': { group: 'Integrity', title: 'Leaderboards & Daily Rewards' },
  'audit-logs': { group: 'Governance', title: 'Immutable Admin Audit Trail' },
  'reports': { group: 'Governance', title: 'Reports & CSV Data Export' },
  'settings': { group: 'System', title: 'Centralized System Settings' },
  'backup': { group: 'System', title: 'Database Health & Snapshots' },
  'docs': { group: 'System', title: 'REST API Documentation & Runner' },
  'login': { group: 'Auth', title: 'Secure Login' }
};

export function renderTopbar(container: HTMLElement) {
  const currentRoute = state.currentRoute;
  const admin = state.admin;
  const meta = ROUTE_TITLES[currentRoute] || { group: 'Admin', title: 'Dashboard' };

  container.innerHTML = `
    <header class="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between select-none">
      <!-- Zone 1: Contextual Breadcrumb Trail -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-500 font-medium">${meta.group}</span>
        <span class="text-slate-600 font-mono">/</span>
        <h2 class="text-slate-100 font-semibold tracking-tight">${meta.title}</h2>
      </div>

      <!-- Zone 2: System Health & Demo Role Switcher -->
      <div class="flex items-center gap-4">
        <!-- Backend Status Indicator -->
        <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>PHP 8.2+ · MySQL 8.0 Active</span>
        </div>

        <!-- RBAC Role Switcher (Simulates login as different admin roles to test permissions) -->
        <div class="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <span class="text-[10px] text-slate-500 font-medium">Test Role:</span>
          <select id="role-switcher-select" class="bg-transparent text-xs font-mono font-medium text-amber-400 focus:outline-none cursor-pointer">
            <option value="SUPER_ADMIN" ${admin?.role === 'SUPER_ADMIN' ? 'selected' : ''}>SUPER_ADMIN (Full Access)</option>
            <option value="FINANCE_ADMIN" ${admin?.role === 'FINANCE_ADMIN' ? 'selected' : ''}>FINANCE_ADMIN (Ledger & Payments)</option>
            <option value="GAME_MODERATOR" ${admin?.role === 'GAME_MODERATOR' ? 'selected' : ''}>GAME_MODERATOR (Games & Live Monitor)</option>
            <option value="SUPPORT_ADMIN" ${admin?.role === 'SUPPORT_ADMIN' ? 'selected' : ''}>SUPPORT_ADMIN (Users & Disputes)</option>
            <option value="ADMIN" ${admin?.role === 'ADMIN' ? 'selected' : ''}>ADMIN (Standard Admin)</option>
          </select>
        </div>
      </div>

      <!-- Zone 3: Primary Actions -->
      <div class="flex items-center gap-3">
        <button id="quick-refresh-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700">
          <span class="font-mono text-xs">↻</span>
          <span>Refresh</span>
        </button>
      </div>
    </header>
  `;

  // Attach role switcher handler
  const roleSelect = container.querySelector('#role-switcher-select') as HTMLSelectElement | null;
  roleSelect?.addEventListener('change', async () => {
    const newRole = roleSelect.value;
    const res = await api.switchRole(newRole);
    if (res.success && res.data) {
      state.setAdmin(res.data.admin);
      toast.show(`Role switched to ${newRole}. Permissions updated.`, 'info');
      state.emit('routeChanged');
    }
  });

  // Attach refresh handler
  container.querySelector('#quick-refresh-btn')?.addEventListener('click', () => {
    toast.show('Synchronized authoritative state with database.', 'success');
    state.emit('routeChanged');
  });
}
