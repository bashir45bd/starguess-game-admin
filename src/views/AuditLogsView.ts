// Immutable Admin Activity & Audit Trail View (Vanilla JS)
import { api } from '../api';

export async function renderAuditLogsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Immutable Admin Audit Trail</h2>
          <p class="text-xs text-slate-400">Strict regulatory log of administrative actions, balance adjustments, rule updates, and security bans.</p>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
              <tr>
                <th class="px-4 py-3">Log ID</th>
                <th class="px-4 py-3">Administrator</th>
                <th class="px-4 py-3">Action Executed</th>
                <th class="px-4 py-3">Target Entity</th>
                <th class="px-4 py-3">Audit Reason & Justification</th>
                <th class="px-4 py-3">State Diff (Before / After)</th>
                <th class="px-4 py-3">IP Address</th>
                <th class="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody id="audit-table-body" class="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr><td colspan="8" class="px-4 py-8 text-center text-slate-500 font-sans">Loading audit records...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#audit-table-body') as HTMLElement;

  async function loadLogs() {
    const res = await api.getAuditLogs();
    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400 font-sans">Failed to load audit logs: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const logs = res.data;
    tbody.innerHTML = logs.map((l: any) => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 text-slate-500 font-semibold">#LOG-${l.log_id}</td>
        <td class="px-4 py-3 font-sans">
          <span class="font-bold text-white">${l.admin_username}</span>
          <div class="text-[10px] text-slate-500 font-mono">ID #${l.admin_id}</div>
        </td>
        <td class="px-4 py-3 text-purple-400 font-bold">${l.action}</td>
        <td class="px-4 py-3 text-slate-300">${l.target_type}: #${l.target_id}</td>
        <td class="px-4 py-3 font-sans text-slate-200 max-w-xs truncate" title="${l.reason}">
          ${l.reason}
        </td>
        <td class="px-4 py-3 text-[10px] text-slate-400 max-w-xs">
          <div class="truncate text-rose-400/80">Prev: ${l.before_value ? JSON.stringify(l.before_value) : 'null'}</div>
          <div class="truncate text-emerald-400/90 font-semibold">Next: ${JSON.stringify(l.after_value)}</div>
        </td>
        <td class="px-4 py-3 text-slate-400 text-[10px]">${l.ip_address}</td>
        <td class="px-4 py-3 text-slate-500 text-[10px] whitespace-nowrap">${new Date(l.created_at).toLocaleTimeString()}</td>
      </tr>
    `).join('');
  }

  await loadLogs();
}
