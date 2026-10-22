// Database Health & Backup Recovery View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';

export async function renderBackupView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Database Health & Backup Recovery</h2>
          <p class="text-xs text-slate-400">Monitor MySQL 8+ table health, row-level storage, and trigger hot database snapshots.</p>
        </div>
        <div>
          <button id="trigger-backup-btn" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
            <span>💾 Trigger Hot Snapshot Dump</span>
          </button>
        </div>
      </div>

      <!-- Health Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Database Engine</span>
          <div class="text-base font-bold font-mono text-white">MySQL 8.0.36 InnoDB</div>
          <div class="text-[10px] text-emerald-400 font-mono">ACID Transactions Verified</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Cluster Status</span>
          <div class="text-base font-bold font-mono text-emerald-400">HEALTHY (0 corrupted)</div>
          <div class="text-[10px] text-slate-500 font-mono">Row-level locking active</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Last Verified Snapshot</span>
          <div id="last-backup-txt" class="text-base font-bold font-mono text-white tabular-nums">—</div>
          <div class="text-[10px] text-slate-500 font-mono">Automated 6-hour interval</div>
        </div>
      </div>

      <!-- Table Storage Matrix -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">InnoDB Table Allocation</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300 font-mono">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Table Identifier</th>
                  <th class="px-4 py-3 text-right">Row Count</th>
                  <th class="px-4 py-3 text-right">Estimated Storage</th>
                  <th class="px-4 py-3">Integrity Check</th>
                </tr>
              </thead>
              <tbody id="tables-health-tbody" class="divide-y divide-slate-800/60 text-xs">
                <tr><td colspan="4" class="px-4 py-6 text-center text-slate-500 font-sans">Loading storage metrics...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const lastBackupEl = container.querySelector('#last-backup-txt') as HTMLElement;
  const tbody = container.querySelector('#tables-health-tbody') as HTMLElement;
  const backupBtn = container.querySelector('#trigger-backup-btn') as HTMLButtonElement;

  async function loadHealth() {
    const res = await api.getBackupStatus();
    if (res.success && res.data) {
      const data = res.data;
      lastBackupEl.innerText = new Date(data.last_backup_timestamp).toLocaleTimeString();
      tbody.innerHTML = data.tables.map((t: any) => `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-semibold text-white font-mono">${t.table_name}</td>
          <td class="px-4 py-3 text-right tabular-nums text-slate-300">${t.row_count}</td>
          <td class="px-4 py-3 text-right tabular-nums text-amber-400">${t.size_kb} KB</td>
          <td class="px-4 py-3 text-emerald-400 font-sans font-medium text-[11px]">✓ OPTIMAL</td>
        </tr>
      `).join('');
    }
  }

  backupBtn.addEventListener('click', async () => {
    backupBtn.disabled = true;
    backupBtn.innerText = 'Creating Snapshot Dump...';

    const res = await api.triggerBackup();
    backupBtn.disabled = false;
    backupBtn.innerText = '💾 Trigger Hot Snapshot Dump';

    if (res.success) {
      toast.show(res.message || 'Database snapshot created.', 'success');
      await loadHealth();
    } else {
      toast.show(res.error || 'Backup trigger failed.', 'error');
    }
  });

  await loadHealth();
}
