// Anti-Fraud, Bot Detection & Integrity Dashboard (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderAntiFraudView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Anti-Cheat & Fraud Detection Engine</h2>
          <p class="text-xs text-slate-400">Heuristic and statistical surveillance detecting binary-search bots, abnormal win spikes, and device fingerprint collisions.</p>
        </div>
      </div>

      <!-- Heuristic Alerts Table -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Active Heuristic Security Incidents</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Alert ID</th>
                  <th class="px-4 py-3">Suspect Account</th>
                  <th class="px-4 py-3">Anomaly Rule Triggered</th>
                  <th class="px-4 py-3">Severity</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Timestamp</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="alerts-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-slate-500">Scanning telemetry alerts...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#alerts-table-body') as HTMLElement;

  async function loadAlerts() {
    const res = await api.getAntiFraud();
    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-6 text-center text-rose-400">Failed to load alerts: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const alerts = res.data;
    tbody.innerHTML = alerts.map((a: any) => {
      const severityColor = 
        a.severity === 'CRITICAL' ? 'text-red-500 font-black' :
        a.severity === 'HIGH' ? 'text-rose-400 font-bold' :
        a.severity === 'MEDIUM' ? 'text-amber-400 font-bold' :
        'text-slate-400';

      const statusColor = 
        a.status === 'UNRESOLVED' ? 'text-rose-400' :
        a.status === 'MONITORING' ? 'text-amber-400' :
        'text-emerald-400';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono font-bold text-slate-400 text-[11px]">#ALT-${a.alert_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${a.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${a.user_id} · Current: ${a.risk_level}</div>
          </td>
          <td class="px-4 py-3">
            <div class="font-mono text-slate-200 font-semibold text-[11px]">${a.alert_type}</div>
            <div class="text-[10px] text-slate-400">${a.description}</div>
          </td>
          <td class="px-4 py-3 font-mono text-[11px] ${severityColor}">${a.severity}</td>
          <td class="px-4 py-3 font-mono text-xs font-semibold ${statusColor}">${a.status}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">${new Date(a.created_at).toLocaleDateString()}</td>
          <td class="px-4 py-3 text-right">
            <button data-review-alert="${a.alert_id}" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Manage Suspect
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-review-alert]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-review-alert')!);
        const alertObj = alerts.find((x: any) => x.alert_id === id);
        if (alertObj) openAlertManageModal(alertObj);
      });
    });
  }

  await loadAlerts();

  function openAlertManageModal(alertObj: any) {
    const html = `
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm">${alertObj.alert_type}</span>
            <span class="text-xs font-mono font-bold text-rose-400">${alertObj.severity}</span>
          </div>
          <p class="text-xs text-slate-300">
            ${alertObj.description}
          </p>
          <div class="text-[11px] font-mono text-slate-400">
            Subject: <strong class="text-white">${alertObj.username}</strong> (#${alertObj.user_id})
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Set Player Risk Classification:</label>
          <select id="set-risk-select" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="NORMAL" ${alertObj.risk_level === 'NORMAL' ? 'selected' : ''}>NORMAL (Standard player)</option>
            <option value="MONITOR" ${alertObj.risk_level === 'MONITOR' ? 'selected' : ''}>MONITOR (Watchlist)</option>
            <option value="SUSPICIOUS" ${alertObj.risk_level === 'SUSPICIOUS' ? 'selected' : ''}>SUSPICIOUS (Restricted stakes)</option>
            <option value="BLOCKED" ${alertObj.risk_level === 'BLOCKED' ? 'selected' : ''}>BLOCKED (Quarantined)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Set Alert Investigation Status:</label>
          <select id="set-alert-status-select" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="UNRESOLVED" ${alertObj.status === 'UNRESOLVED' ? 'selected' : ''}>UNRESOLVED</option>
            <option value="MONITORING" ${alertObj.status === 'MONITORING' ? 'selected' : ''}>MONITORING</option>
            <option value="RESOLVED" ${alertObj.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
            <option value="DISMISSED" ${alertObj.status === 'DISMISSED' ? 'selected' : ''}>DISMISSED</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="save-alert-risk-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Update Security Risk Assessment
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(`Security Assessment: #${alertObj.alert_id}`, html, (overlay) => {
      overlay.querySelector('#save-alert-risk-btn')?.addEventListener('click', async () => {
        const newRisk = (overlay.querySelector('#set-risk-select') as HTMLSelectElement).value;
        const newStatus = (overlay.querySelector('#set-alert-status-select') as HTMLSelectElement).value;

        await Promise.all([
          api.updateUserRisk(alertObj.user_id, newRisk, `Anti-fraud alert #${alertObj.alert_id} resolution`),
          api.updateAlertStatus(alertObj.alert_id, newStatus)
        ]);

        toast.show('Risk status and security alert updated.', 'success');
        modal.close();
        await loadAlerts();
      });
    });
  }
}
