// Central Application Coordinator (Pure Vanilla JS & HTML5 - No React/Vue/Angular)
import './index.css';
import { api } from './api';
import { state } from './state';
import { renderSidebar } from './components/Sidebar';
import { renderTopbar } from './components/Topbar';
import { renderDashboardView } from './views/DashboardView';
import { renderUsersView } from './views/UsersView';
import { renderWalletsView } from './views/WalletsView';
import { renderPackagesView } from './views/PackagesView';
import { renderPaymentsView } from './views/PaymentsView';
import { renderLiveGamesView } from './views/LiveGamesView';
import { renderGamesView } from './views/GamesView';
import { renderGameModesView } from './views/GameModesView';
import { renderDisputesView } from './views/DisputesView';
import { renderAntiFraudView } from './views/AntiFraudView';
import { renderLeaderboardsView } from './views/LeaderboardsView';
import { renderAuditLogsView } from './views/AuditLogsView';
import { renderReportsView } from './views/ReportsView';
import { renderSettingsView } from './views/SettingsView';
import { renderBackupView } from './views/BackupView';
import { renderDocsView } from './views/DocsView';
import { renderLoginView } from './views/LoginView';
import { renderAdminsView } from './views/AdminsView';

function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  // If not authenticated or on login route, render isolated login screen
  if (!state.isAuthenticated || state.currentRoute === 'login') {
    renderLoginView(root);
    return;
  }

  // Render Admin Shell
  root.innerHTML = `
    <div class="h-full flex overflow-hidden bg-slate-950 text-slate-100">
      <!-- Left Sidebar Container -->
      <aside id="sidebar-container" class="shrink-0"></aside>

      <!-- Main Workspace Frame -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Top Navigation Bar -->
        <div id="topbar-container" class="shrink-0"></div>

        <!-- Viewport Workspace Content -->
        <main id="main-content" class="flex-1 overflow-y-auto bg-slate-950"></main>
      </div>
    </div>
  `;

  const sidebarContainer = root.querySelector('#sidebar-container') as HTMLElement;
  const topbarContainer = root.querySelector('#topbar-container') as HTMLElement;
  const mainContent = root.querySelector('#main-content') as HTMLElement;

  renderSidebar(sidebarContainer);
  renderTopbar(topbarContainer);

  // Route View Dispatcher
  switch (state.currentRoute) {
    case 'dashboard':
      renderDashboardView(mainContent);
      break;
    case 'users':
      renderUsersView(mainContent);
      break;
    case 'wallets':
      renderWalletsView(mainContent);
      break;
    case 'packages':
      renderPackagesView(mainContent);
      break;
    case 'payments':
      renderPaymentsView(mainContent);
      break;
    case 'live-games':
      renderLiveGamesView(mainContent);
      break;
    case 'games':
      renderGamesView(mainContent);
      break;
    case 'game-modes':
      renderGameModesView(mainContent);
      break;
    case 'disputes':
      renderDisputesView(mainContent);
      break;
    case 'anti-fraud':
      renderAntiFraudView(mainContent);
      break;
    case 'leaderboards':
      renderLeaderboardsView(mainContent);
      break;
    case 'audit-logs':
      renderAuditLogsView(mainContent);
      break;
    case 'reports':
      renderReportsView(mainContent);
      break;
    case 'settings':
      renderSettingsView(mainContent);
      break;
    case 'backup':
      renderBackupView(mainContent);
      break;
    case 'docs':
      renderDocsView(mainContent);
      break;
    case 'admins':
      renderAdminsView(mainContent);
      break;
    default:
      renderDashboardView(mainContent);
      break;
  }
}

// Reactive subscriptions
state.on('routeChanged', () => {
  renderApp();
});

state.on('authChanged', () => {
  renderApp();
});

// Initial boot
function boot() {
  renderApp();
  if (api.getToken()) {
    void api.getMe().then((res) => {
      if (res.success && res.data?.admin) state.setAdmin(res.data.admin);
      else api.setToken(null);
    });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
