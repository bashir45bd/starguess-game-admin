// System Settings & Maintenance Engine View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderSettingsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">System Settings & Maintenance Mode</h2>
          <p class="text-xs text-slate-400">Control global engine availability, matchmaking queues, payment gateways, and system broadcasts.</p>
        </div>
      </div>

      <!-- Maintenance Mode Warning Box -->
      <div id="maintenance-banner" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>Maintenance Mode (Safe Drain Engine)</span>
              <span id="maint-status-pill" class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">IDLE</span>
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              When enabled, incoming match matchmaking is paused while all active in-progress games conclude safely without interruption.
            </p>
          </div>
          <div>
            <button id="toggle-maint-btn" class="px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30">
              Toggle Maintenance Mode
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Feature Toggles -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-white">Engine Feature Availability</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">User Registrations</span>
                <span class="text-[11px] text-slate-500">Allow new mobile players to create accounts</span>
              </div>
              <input type="checkbox" id="set-reg-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">Matchmaking & Games</span>
                <span class="text-[11px] text-slate-500">Enable 1v1 prediction lobbies and matchmaking queues</span>
              </div>
              <input type="checkbox" id="set-games-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">In-App Store Payments</span>
                <span class="text-[11px] text-slate-500">Enable real fiat purchase of Star currency packages</span>
              </div>
              <input type="checkbox" id="set-payments-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">Player P2P Transfers</span>
                <span class="text-[11px] text-slate-500">Allow player-to-player Star transfers</span>
              </div>
              <input type="checkbox" id="set-transfers-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>
          </div>
          <div class="flex justify-end">
            <button id="save-toggles-btn" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium">
              Save Toggles
            </button>
          </div>
        </div>

        <!-- Push Notifications & Broadcasts -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-white">Broadcast Global Announcement</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Notice Title:</label>
              <input type="text" id="notif-title" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Scheduled Tournament Tonight" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Message Content:</label>
              <textarea id="notif-message" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="Details dispatched to active mobile app players..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Audience:</label>
              <select id="notif-audience" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
                <option value="ALL">All Registered Players</option>
                <option value="ACTIVE_USERS">Currently Active Players</option>
                <option value="HIGH_ROLLER">High Rollers & VIPs</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button id="send-broadcast-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
              Dispatch Push Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const maintPill = container.querySelector('#maint-status-pill') as HTMLElement;
  const toggleMaintBtn = container.querySelector('#toggle-maint-btn') as HTMLButtonElement;
  const regToggle = container.querySelector('#set-reg-toggle') as HTMLInputElement;
  const gamesToggle = container.querySelector('#set-games-toggle') as HTMLInputElement;
  const paymentsToggle = container.querySelector('#set-payments-toggle') as HTMLInputElement;
  const transfersToggle = container.querySelector('#set-transfers-toggle') as HTMLInputElement;
  const saveTogglesBtn = container.querySelector('#save-toggles-btn') as HTMLButtonElement;

  let currentSettings: Record<string, string> = {};

  async function loadSettings() {
    const res = await api.getSettings();
    if (res.success && res.data) {
      currentSettings = res.data;
      const isMaint = currentSettings.maintenance_mode === 'true';

      maintPill.innerText = isMaint ? 'ACTIVE MAINTENANCE' : 'SYSTEM ONLINE';
      maintPill.className = `text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isMaint ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`;
      toggleMaintBtn.innerText = isMaint ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode';
      toggleMaintBtn.className = `px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${isMaint ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`;

      regToggle.checked = currentSettings.registration_enabled === 'true';
      gamesToggle.checked = currentSettings.games_enabled === 'true';
      paymentsToggle.checked = currentSettings.payments_enabled === 'true';
      transfersToggle.checked = currentSettings.transfer_enabled === 'true';
    }
  }

  toggleMaintBtn.addEventListener('click', () => {
    const isCurrentlyMaint = currentSettings.maintenance_mode === 'true';
    const nextState = !isCurrentlyMaint;

    modal.showDangerousConfirm({
      title: nextState ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode',
      message: nextState 
        ? 'Activating maintenance will prevent new matchmaking queues. Active games will finish gracefully.'
        : 'Restoring regular operational state. Matchmaking queues will reopen to players.',
      actionButtonText: nextState ? 'Enable Maintenance' : 'Restore Operations',
      requireTypingWord: nextState ? 'MAINTENANCE' : 'RESTORE',
      requirePassword: true,
      onConfirm: async (adminPassword) => {
        const res = await api.updateSettings({
          maintenance_mode: nextState ? 'true' : 'false',
          admin_password: adminPassword || ''
        });
        if (res.success) {
          toast.show(`Maintenance mode set to ${nextState}.`, 'success');
          await loadSettings();
        }
      }
    });
  });

  saveTogglesBtn.addEventListener('click', async () => {
    const res = await api.updateSettings({
      registration_enabled: regToggle.checked ? 'true' : 'false',
      games_enabled: gamesToggle.checked ? 'true' : 'false',
      payments_enabled: paymentsToggle.checked ? 'true' : 'false',
      transfer_enabled: transfersToggle.checked ? 'true' : 'false'
    });
    if (res.success) {
      toast.show('Engine feature availability updated.', 'success');
      await loadSettings();
    }
  });

  // Broadcast notification handler
  container.querySelector('#send-broadcast-btn')?.addEventListener('click', async () => {
    const title = (container.querySelector('#notif-title') as HTMLInputElement).value.trim();
    const message = (container.querySelector('#notif-message') as HTMLTextAreaElement).value.trim();
    const audience = (container.querySelector('#notif-audience') as HTMLSelectElement).value;

    if (!title || !message) {
      toast.show('Please enter both title and broadcast message.', 'warning');
      return;
    }

    const res = await api.broadcastNotification({ title, message, type: 'ANNOUNCEMENT', audience });
    if (res.success) {
      toast.show(res.message || 'Broadcast dispatched.', 'success');
      (container.querySelector('#notif-title') as HTMLInputElement).value = '';
      (container.querySelector('#notif-message') as HTMLTextAreaElement).value = '';
    }
  });

  await loadSettings();
}
