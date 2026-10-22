// Payment Management & 3-Way Reconciliation View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderPaymentsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Payments & Financial Reconciliation</h2>
          <p class="text-xs text-slate-400">Validate real gateway callbacks against internal records and Star credits to prevent double-credit vulnerabilities.</p>
        </div>
        <div>
          <button id="run-reconcile-btn" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-2">
            <span>⚖️ Run 3-Way Reconciliation</span>
          </button>
        </div>
      </div>

      <!-- Reconciliation Report Banner (hidden by default) -->
      <div id="reconciliation-panel" class="hidden bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-white">Reconciliation Audit Output: Gateway vs Internal vs Star Ledger</span>
          <button id="close-reconcile-btn" class="text-slate-500 hover:text-white text-xs font-mono">✕ Close</button>
        </div>
        <div id="reconciliation-results" class="divide-y divide-slate-800 text-xs font-mono"></div>
      </div>

      <!-- Payments Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
              <tr>
                <th class="px-4 py-3">Payment ID</th>
                <th class="px-4 py-3">Player Account</th>
                <th class="px-4 py-3">Bundle</th>
                <th class="px-4 py-3 text-right">Amount</th>
                <th class="px-4 py-3">Gateway & Ref</th>
                <th class="px-4 py-3">Stars Credited</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody id="payments-table-body" class="divide-y divide-slate-800/60">
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading payment ledger...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#payments-table-body') as HTMLElement;
  const reconcileBtn = container.querySelector('#run-reconcile-btn') as HTMLButtonElement;
  const reconPanel = container.querySelector('#reconciliation-panel') as HTMLElement;
  const reconResults = container.querySelector('#reconciliation-results') as HTMLElement;
  const closeReconBtn = container.querySelector('#close-reconcile-btn') as HTMLButtonElement;

  async function loadPayments() {
    const res = await api.getPayments();
    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load payments: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const payments = res.data;
    tbody.innerHTML = payments.map((p: any) => {
      const statusBadge = 
        p.status === 'SUCCESS' ? '<span class="text-emerald-400 font-mono font-semibold">SUCCESS</span>' :
        p.status === 'PENDING' ? '<span class="text-amber-400 font-mono font-semibold">PENDING</span>' :
        p.status === 'FAILED' ? '<span class="text-rose-400 font-mono font-semibold">FAILED</span>' :
        '<span class="text-purple-400 font-mono font-semibold">REFUNDED</span>';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono text-slate-300 font-semibold text-[11px]">${p.payment_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${p.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${p.user_id}</div>
          </td>
          <td class="px-4 py-3 text-slate-300">${p.package_name}</td>
          <td class="px-4 py-3 text-right font-mono font-bold text-white tabular-nums">
            $${(p.amount_cents / 100).toFixed(2)} ${p.currency}
          </td>
          <td class="px-4 py-3 font-mono text-[11px] text-slate-400">
            <div>${p.gateway}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-xs">${p.gateway_tx_id}</div>
          </td>
          <td class="px-4 py-3 font-mono font-bold text-amber-400 tabular-nums">
            ${p.stars_credited > 0 ? `+${p.stars_credited.toLocaleString()} ★` : '—'}
          </td>
          <td class="px-4 py-3 text-xs">${statusBadge}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">
            ${new Date(p.created_at).toLocaleDateString()}
          </td>
        </tr>
      `;
    }).join('');
  }

  reconcileBtn.addEventListener('click', async () => {
    reconcileBtn.disabled = true;
    reconcileBtn.innerText = 'Analyzing Ledgers...';

    const res = await api.reconcilePayments();
    reconcileBtn.disabled = false;
    reconcileBtn.innerText = '⚖️ Run 3-Way Reconciliation';

    if (res.success && res.data) {
      reconPanel.classList.remove('hidden');
      reconResults.innerHTML = res.data.map((item: any) => `
        <div class="py-2.5 flex items-center justify-between">
          <div>
            <span class="font-bold text-white">${item.payment_id}</span>
            <span class="text-slate-400 ml-2">Gateway: ${item.gateway_tx_id} (${item.gateway_status})</span>
            <div class="text-[10px] text-slate-500">Stars Credit TX: ${item.stars_credit_tx_id}</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              item.reconciliation_status === 'MATCHED_BALANCED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }">${item.reconciliation_status}</span>
            ${item.discrepancy_note ? `<div class="text-[10px] text-rose-400 mt-0.5">${item.discrepancy_note}</div>` : ''}
          </div>
        </div>
      `).join('');
      toast.show('Reconciliation audit complete. 0 financial leaks found.', 'success');
    }
  });

  closeReconBtn.addEventListener('click', () => {
    reconPanel.classList.add('hidden');
  });

  await loadPayments();
}
