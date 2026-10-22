// Sidebar Navigation Component (Vanilla JS)
import { state, ViewRoute } from '../state';
import { api } from '../api';
import { openChangePasswordModal } from './ChangePasswordModal';
import { openAdminProfileModal } from './AdminProfileModal';

interface NavItem {
  id: ViewRoute;
  label: string;
  badge?: string;
  icon: string;
  category: string;
}

const NAV_ITEMS: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: '📊', category: 'Overview' },

  // Players & Virtual Economy
  { id: 'users', label: 'User Directory', icon: '👥', category: 'Economy & Players' },
  { id: 'wallets', label: 'Wallets & Ledger', icon: '🪙', category: 'Economy & Players' },
  { id: 'packages', label: 'Star Packages', icon: '📦', category: 'Economy & Players' },
  { id: 'payments', label: 'Payments & Reconcile', icon: '💳', category: 'Economy & Players' },

  // Game Engine
  { id: 'live-games', label: 'Live Games Monitor', icon: '⚡', category: 'Game Engine', badge: 'LIVE' },
  { id: 'games', label: 'Game Audit & History', icon: '🎯', category: 'Game Engine' },
  { id: 'game-modes', label: 'Game Modes & Rules', icon: '⚙️', category: 'Game Engine' },

  // Risk & Disputes
  { id: 'disputes', label: 'Dispute Resolution', icon: '⚖️', category: 'Integrity & Security' },
  { id: 'anti-fraud', label: 'Anti-Cheat & Fraud', icon: '🛡️', category: 'Integrity & Security', badge: 'ALERT' },
  { id: 'leaderboards', label: 'Leaderboard & Rewards', icon: '🏆', category: 'Integrity & Security' },

  // System
  { id: 'audit-logs', label: 'Admin Audit Trail', icon: '📜', category: 'System Operations' },
  { id: 'reports', label: 'Reports & CSV Export', icon: '📈', category: 'System Operations' },
  { id: 'settings', label: 'System Settings', icon: '🔧', category: 'System Operations' },
  { id: 'backup', label: 'Database Health', icon: '💾', category: 'System Operations' },
  { id: 'docs', label: 'API Docs & Sandbox', icon: '📖', category: 'System Operations' }
  ,{ id: 'admins', label: 'Admin Accounts', icon: '🧑‍💼', category: 'System Operations' }
];

export function renderSidebar(container: HTMLElement) {
  const currentRoute = state.currentRoute;
  const admin = state.admin;

  const categories = ['Overview', 'Economy & Players', 'Game Engine', 'Integrity & Security', 'System Operations'];

  let navHtml = '';

  categories.forEach(cat => {
    const items = NAV_ITEMS.filter(item => item.category === cat && (item.id !== 'admins' || state.hasPerm('admins:view')));
    if (items.length === 0) return;

    navHtml += `
      <div class="px-3 pt-4 pb-1">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">${cat}</span>
      </div>
      <div class="space-y-0.5">
    `;

    items.forEach(item => {
      const isActive = currentRoute === item.id;
      navHtml += `
        <button 
          data-route="${item.id}"
          class="nav-link w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
            isActive 
              ? 'bg-amber-500/10 text-amber-300 font-semibold border-l-2 border-amber-500' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span class="text-sm shrink-0">${item.icon}</span>
            <span class="truncate">${item.label}</span>
          </div>
          ${item.badge ? `
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
              item.badge === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-rose-500/20 text-rose-400'
            }">${item.badge}</span>
          ` : ''}
        </button>
      `;
    });

    navHtml += `</div>`;
  });

  container.innerHTML = `
    <div class="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 w-64 shrink-0 select-none">
      <!-- Brand lockup -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
            ★
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-tight">StarGuess</h1>
            <p class="text-[10px] text-slate-400 font-mono">Game Administration</p>
          </div>
        </div>
      </div>

      <!-- Navigation links -->
      <div class="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        ${navHtml}
      </div>

      <!-- Active Admin Profile Footprint -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/40">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-amber-400 shrink-0">
              ${admin?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div class="truncate">
              <p class="text-xs font-semibold text-slate-200 truncate">${admin?.username || 'Admin'}</p>
              <p class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">${admin?.role || 'SUPER_ADMIN'}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button id="change-password-btn" title="Change password" aria-label="Change password" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors text-xs">🔑</button>
            <button id="edit-profile-btn" title="Edit profile" aria-label="Edit profile" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors text-xs">👤</button>
            <button id="logout-btn" title="Logout" aria-label="Logout" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-xs font-mono">⏻</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRoute = btn.getAttribute('data-route') as ViewRoute;
      if (targetRoute) {
        state.setRoute(targetRoute);
      }
    });
  });

  container.querySelector('#logout-btn')?.addEventListener('click', () => {
    void api.logout();
    api.setToken(null);
    state.setAdmin(null);
    state.setRoute('login');
  });
  container.querySelector('#change-password-btn')?.addEventListener('click', openChangePasswordModal);
  container.querySelector('#edit-profile-btn')?.addEventListener('click', openAdminProfileModal);
}
