// Dispute Resolution Center (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderDisputesView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Player Dispute Resolution Center</h2>
          <p class="text-xs text-slate-400">Review game controversies, missing Stars claims, and network interruptions. Execute refunds via ledger.</p>
        </div>
      </div>

      <!-- Disputes Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
              <tr>
                <th class="px-4 py-3">Dispute ID</th>
                <th class="px-4 py-3">Player</th>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Related Match / Payment</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Date Filed</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="disputes-table-body" class="divide-y divide-slate-800/60">
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-slate-500">Loading disputes...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#disputes-table-body') as HTMLElement;

  async function loadDisputes() {
    const res = await api.getDisputes();
    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-6 text-center text-rose-400">Failed to load disputes: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const disputes = res.data;
    tbody.innerHTML = disputes.map((d: any) => {
      const statusBadge = 
        d.status === 'UNDER_REVIEW' ? '<span class="text-amber-400 font-mono font-semibold">UNDER_REVIEW</span>' :
        d.status === 'RESOLVED_REFUNDED' ? '<span class="text-emerald-400 font-mono font-semibold">REFUNDED</span>' :
        d.status === 'RESOLVED_REJECTED' ? '<span class="text-rose-400 font-mono font-semibold">REJECTED</span>' :
        '<span class="text-slate-400 font-mono font-semibold">CLOSED</span>';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono font-bold text-white text-[11px]">${d.dispute_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${d.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${d.user_id}</div>
          </td>
          <td class="px-4 py-3 text-slate-300 font-mono text-[11px]">${d.dispute_type}</td>
          <td class="px-4 py-3 font-mono text-slate-400 text-[11px]">
            ${d.game_id || d.payment_id || 'General Account'}
          </td>
          <td class="px-4 py-3 text-xs">${statusBadge}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">${new Date(d.created_at).toLocaleDateString()}</td>
          <td class="px-4 py-3 text-right">
            <button data-resolve-dispute="${d.dispute_id}" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Review & Decide
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-resolve-dispute]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-resolve-dispute')!;
        const disp = disputes.find((x: any) => x.dispute_id === id);
        if (disp) openDisputeModal(disp);
      });
    });
  }

  await loadDisputes();

  function openDisputeModal(disp: any) {
    const html = `
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white">${disp.dispute_id} · ${disp.dispute_type}</span>
            <span class="text-xs font-mono text-amber-400">${disp.status}</span>
          </div>
          <p class="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
            "${disp.reason}"
          </p>
          <div class="text-[10px] text-slate-500 font-mono">
            Filed by ${disp.username} (UID #${disp.user_id}) on ${new Date(disp.created_at).toLocaleString()}
          </div>
        </div>

        ${disp.admin_notes ? `
          <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-400 font-semibold block mb-1">Previous Admin Verdict:</span>
            <p class="text-slate-300 font-mono">${disp.admin_notes}</p>
          </div>
        ` : ''}

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Adjudication Verdict:</label>
          <select id="disp-decision-select" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="RESOLVED_REFUNDED">Approve & Issue Star Refund via Ledger</option>
            <option value="RESOLVED_REJECTED">Reject Dispute (No Rule Violation Found)</option>
            <option value="UNDER_REVIEW">Keep Under Technical Investigation</option>
            <option value="CLOSED">Close Ticket</option>
          </select>
        </div>

        <div id="refund-amt-box">
          <label class="block text-xs font-medium text-slate-400 mb-1">Refund Stars Amount:</label>
          <input type="number" id="disp-refund-amount" value="${disp.refund_amount || 25}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Admin Resolution Justification Notes:</label>
          <textarea id="disp-notes-input" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="State reason and telemetry evidence verified...">${disp.admin_notes || ''}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-submit-disp-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Record Official Decision
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(`Adjudicate Dispute: ${disp.dispute_id}`, html, (overlay) => {
      overlay.querySelector('#modal-submit-disp-btn')?.addEventListener('click', async () => {
        const decision = (overlay.querySelector('#disp-decision-select') as HTMLSelectElement).value;
        const refund_amount = parseInt((overlay.querySelector('#disp-refund-amount') as HTMLInputElement).value) || 0;
        const admin_notes = (overlay.querySelector('#disp-notes-input') as HTMLTextAreaElement).value.trim();

        if (admin_notes.length < 5) {
          toast.show('Please provide detailed admin notes (min 5 chars).', 'warning');
          return;
        }

        const res = await api.resolveDispute(disp.dispute_id, decision, refund_amount, admin_notes);
        if (res.success) {
          toast.show(`Dispute recorded as ${decision}.`, 'success');
          modal.close();
          await loadDisputes();
        } else {
          toast.show(res.error || 'Failed to resolve dispute.', 'error');
        }
      });
    });
  }
}
