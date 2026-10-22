// Reports & Regulatory CSV Export View (Vanilla JS)
import { toast } from '../components/Toast';

export function renderReportsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Reports & Financial CSV Data Export</h2>
          <p class="text-xs text-slate-400">Generate compliance-grade raw datasets and accounting reports for audits and business intelligence.</p>
        </div>
      </div>

      <!-- Export Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- 1. Player Accounts Export -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">👥</span>
              <h3 class="text-sm font-semibold text-white">Player Directory</h3>
            </div>
            <p class="text-xs text-slate-400">Export registered users, current wallet balances, win counts, and risk status.</p>
          </div>
          <button data-export="users" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors">
            Download users.csv
          </button>
        </div>

        <!-- 2. Game Matches Export -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">🎯</span>
              <h3 class="text-sm font-semibold text-white">Game Match Ledger</h3>
            </div>
            <p class="text-xs text-slate-400">Export match history, stakes, platform commission, winners, and completion status.</p>
          </div>
          <button data-export="games" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors">
            Download games.csv
          </button>
        </div>

        <!-- 3. Stars Virtual Currency Transactions -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">🪙</span>
              <h3 class="text-sm font-semibold text-white">Stars Ledger Transactions</h3>
            </div>
            <p class="text-xs text-slate-400">Export immutable ledger journal entries including before/after balances and reference IDs.</p>
          </div>
          <button data-export="transactions" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors">
            Download transactions.csv
          </button>
        </div>

        <!-- 4. Fiat Payments -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">💳</span>
              <h3 class="text-sm font-semibold text-white">IAP Payment Audits</h3>
            </div>
            <p class="text-xs text-slate-400">Export gateway records, verification timestamps, and Stars credited to players.</p>
          </div>
          <button data-export="payments" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors">
            Download payments.csv
          </button>
        </div>

        <!-- 5. Admin Audit Trail -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">📜</span>
              <h3 class="text-sm font-semibold text-white">Admin Activity Logs</h3>
            </div>
            <p class="text-xs text-slate-400">Export complete administrative action trail with IP addresses, reasons, and state diffs.</p>
          </div>
          <button data-export="audit_logs" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors">
            Download audit_logs.csv
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => {
      const resource = btn.getAttribute('data-export');
      toast.show(`Preparing ${resource}.csv export...`, 'info');
      window.location.href = `/api/v1/admin/export/${resource}`;
    });
  });
}
