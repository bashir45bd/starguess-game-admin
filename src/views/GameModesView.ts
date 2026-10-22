// Game Configuration, Modes & Commission Matrix View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderGameModesView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Game Modes & Commission Matrix</h2>
          <p class="text-xs text-slate-400">Configure number ranges, turn durations, entry stakes, and tiered platform rake percentages.</p>
        </div>
      </div>

      <!-- Game Modes Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Active Prediction Game Modes</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th class="px-4 py-3">Mode Name</th>
                  <th class="px-4 py-3">Number Range</th>
                  <th class="px-4 py-3 text-right">Entry Stakes</th>
                  <th class="px-4 py-3 text-right">Commission Rate</th>
                  <th class="px-4 py-3 text-right">Max Attempts</th>
                  <th class="px-4 py-3 text-right">Turn Timer</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="modes-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading modes...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Commission Rules Section (Requirement 12) -->
      <div class="space-y-3 pt-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-white">Entry-Fee-Specific Commission Brackets</h3>
            <p class="text-xs text-slate-400">The authoritative backend computes rake dynamically based on match stakes.</p>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300 font-mono">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Tier Name</th>
                  <th class="px-4 py-3">Entry Fee Bracket</th>
                  <th class="px-4 py-3 text-right">Platform Rake %</th>
                  <th class="px-4 py-3">Promotional Tag</th>
                  <th class="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody id="commissions-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="5" class="px-4 py-6 text-center text-slate-500">Loading commission brackets...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const modesTbody = container.querySelector('#modes-table-body') as HTMLElement;
  const commTbody = container.querySelector('#commissions-table-body') as HTMLElement;

  async function loadData() {
    const [modesRes, commRes] = await Promise.all([
      api.getGameModes(),
      api.getCommissions()
    ]);

    if (modesRes.success && modesRes.data) {
      modesTbody.innerHTML = modesRes.data.map((m: any) => `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-semibold text-white">
            ${m.name}
            <div class="text-[10px] text-slate-500 font-mono">${m.slug}</div>
          </td>
          <td class="px-4 py-3 font-mono text-slate-300 text-xs">
            ${m.number_min} — ${m.number_max}
          </td>
          <td class="px-4 py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
            ${m.entry_fee} ★
          </td>
          <td class="px-4 py-3 text-right font-mono text-purple-400 tabular-nums font-semibold">
            ${m.commission_percentage}%
          </td>
          <td class="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
            ${m.max_attempts}
          </td>
          <td class="px-4 py-3 text-right font-mono text-emerald-400 tabular-nums">
            ${m.turn_duration_seconds}s
          </td>
          <td class="px-4 py-3 text-xs">
            <span class="font-mono ${m.is_active ? 'text-emerald-400' : 'text-slate-500'} font-semibold">
              ${m.is_active ? 'ACTIVE' : 'DISABLED'}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button data-edit-mode="${m.mode_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Configure
            </button>
          </td>
        </tr>
      `).join('');

      modesTbody.querySelectorAll('[data-edit-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          const modeId = parseInt(btn.getAttribute('data-edit-mode')!);
          const modeObj = modesRes.data.find((x: any) => x.mode_id === modeId);
          if (modeObj) openEditModeModal(modeObj);
        });
      });
    }

    if (commRes.success && commRes.data) {
      commTbody.innerHTML = commRes.data.map((c: any) => `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-sans font-semibold text-white">${c.name}</td>
          <td class="px-4 py-3 text-amber-400 tabular-nums">${c.min_entry} ★ — ${c.max_entry} ★</td>
          <td class="px-4 py-3 text-right font-bold text-purple-400 tabular-nums">${c.commission_percentage}%</td>
          <td class="px-4 py-3 text-slate-400 text-xs">${c.tag}</td>
          <td class="px-4 py-3 text-emerald-400 text-xs font-semibold">ACTIVE</td>
        </tr>
      `).join('');
    }
  }

  await loadData();

  function openEditModeModal(mode: any) {
    const html = `
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Entry Stakes (Stars):</label>
          <input type="number" id="mode-entry-input" value="${mode.entry_fee}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Commission Percentage (%):</label>
          <input type="number" step="0.5" id="mode-comm-input" value="${mode.commission_percentage}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Max Turn Duration (seconds):</label>
          <input type="number" id="mode-duration-input" value="${mode.turn_duration_seconds}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Max Attempts Limit:</label>
          <input type="number" id="mode-attempts-input" value="${mode.max_attempts}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-save-mode-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Save Mode Parameters
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(`Configure Rules: ${mode.name}`, html, (overlay) => {
      overlay.querySelector('#modal-save-mode-btn')?.addEventListener('click', async () => {
        const entry_fee = parseInt((overlay.querySelector('#mode-entry-input') as HTMLInputElement).value);
        const commission_percentage = parseFloat((overlay.querySelector('#mode-comm-input') as HTMLInputElement).value);
        const turn_duration_seconds = parseInt((overlay.querySelector('#mode-duration-input') as HTMLInputElement).value);
        const max_attempts = parseInt((overlay.querySelector('#mode-attempts-input') as HTMLInputElement).value);

        const res = await api.updateGameMode(mode.mode_id, {
          entry_fee,
          commission_percentage,
          turn_duration_seconds,
          max_attempts
        });

        if (res.success) {
          toast.show('Game mode rules updated.', 'success');
          modal.close();
          await loadData();
        } else {
          toast.show(res.error || 'Failed to update rules.', 'error');
        }
      });
    });
  }
}
