// Wallets & Star Virtual Ledger View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderWalletsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Wallets & Star Virtual Economy Ledger</h2>
          <p class="text-xs text-slate-400">Strict double-entry ledger. Balance mutations are recorded immutably with before/after state.</p>
        </div>
        <div>
          <button id="open-adjust-modal-btn" class="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20">
            <span>+ Manual Star Adjustment</span>
          </button>
        </div>
      </div>

      <!-- Tabs: Wallets Directory vs Full Transaction Ledger -->
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button id="tab-wallets-btn" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-colors">
          Player Wallets
        </button>
        <button id="tab-transactions-btn" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          All Star Transactions (Ledger)
        </button>
      </div>

      <!-- Tab Content: Wallets -->
      <div id="wallets-tab-content" class="space-y-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th class="px-4 py-3">Wallet ID</th>
                  <th class="px-4 py-3">Player Account</th>
                  <th class="px-4 py-3 text-right">Current Balance</th>
                  <th class="px-4 py-3 text-right">Purchased</th>
                  <th class="px-4 py-3 text-right">Won</th>
                  <th class="px-4 py-3 text-right">Bonus</th>
                  <th class="px-4 py-3 text-right">Ledger Version</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="wallets-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading wallets...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab Content: Transactions -->
      <div id="transactions-tab-content" class="space-y-4 hidden">
        <!-- Filters -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div class="flex items-center gap-2 flex-1 min-w-[240px]">
            <span class="text-slate-500 text-xs font-mono">🔍</span>
            <input 
              type="text" 
              id="tx-search-input" 
              placeholder="Search by Transaction ID or Note..." 
              class="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>Transaction Type:</span>
            <select id="tx-type-filter" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none">
              <option value="ALL">All Types</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="GAME_ENTRY">GAME_ENTRY</option>
              <option value="GAME_WIN">GAME_WIN</option>
              <option value="GAME_REFUND">GAME_REFUND</option>
              <option value="BONUS">BONUS</option>
              <option value="REFERRAL">REFERRAL</option>
              <option value="ADMIN_ADJUSTMENT">ADMIN_ADJUSTMENT</option>
              <option value="COMMISSION">COMMISSION</option>
            </select>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th class="px-4 py-3">Tx ID</th>
                  <th class="px-4 py-3">Player</th>
                  <th class="px-4 py-3">Type</th>
                  <th class="px-4 py-3 text-right">Amount</th>
                  <th class="px-4 py-3 text-right">Balance (Before → After)</th>
                  <th class="px-4 py-3">Reference</th>
                  <th class="px-4 py-3">Notes</th>
                  <th class="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody id="tx-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading ledger records...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const tabWalletsBtn = container.querySelector('#tab-wallets-btn') as HTMLButtonElement;
  const tabTransactionsBtn = container.querySelector('#tab-transactions-btn') as HTMLButtonElement;
  const walletsTabContent = container.querySelector('#wallets-tab-content') as HTMLElement;
  const transactionsTabContent = container.querySelector('#transactions-tab-content') as HTMLElement;

  const walletsTbody = container.querySelector('#wallets-table-body') as HTMLElement;
  const txTbody = container.querySelector('#tx-table-body') as HTMLElement;
  const txSearchInput = container.querySelector('#tx-search-input') as HTMLInputElement;
  const txTypeFilter = container.querySelector('#tx-type-filter') as HTMLSelectElement;

  tabWalletsBtn.addEventListener('click', () => {
    tabWalletsBtn.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-colors';
    tabTransactionsBtn.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors';
    walletsTabContent.classList.remove('hidden');
    transactionsTabContent.classList.add('hidden');
    loadWallets();
  });

  tabTransactionsBtn.addEventListener('click', () => {
    tabTransactionsBtn.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-colors';
    tabWalletsBtn.className = 'px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors';
    transactionsTabContent.classList.remove('hidden');
    walletsTabContent.classList.add('hidden');
    loadTransactions();
  });

  async function loadWallets() {
    const res = await api.getWallets();
    if (!res.success || !res.data) {
      walletsTbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Error loading wallets: ${res.error || 'Server error'}</td></tr>`;
      return;
    }
    const wallets = res.data;
    walletsTbody.innerHTML = wallets.map((w: any) => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 font-mono text-slate-400">#W-${w.wallet_id}</td>
        <td class="px-4 py-3">
          <span class="font-semibold text-white">${w.username}</span>
          <div class="text-[10px] text-slate-500 font-mono">UID #${w.user_id}</div>
        </td>
        <td class="px-4 py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
          ${w.balance.toLocaleString()} ★
        </td>
        <td class="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">${w.purchased_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-emerald-400 tabular-nums">${w.won_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-sky-400 tabular-nums">${w.bonus_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-slate-500">v${w.version}</td>
        <td class="px-4 py-3 text-right">
          <button data-adjust-user="${w.user_id}" data-adjust-username="${w.username}" data-adjust-balance="${w.balance}" class="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-medium transition-colors">
            Adjust
          </button>
        </td>
      </tr>
    `).join('');

    walletsTbody.querySelectorAll('[data-adjust-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = parseInt(btn.getAttribute('data-adjust-user')!);
        const username = btn.getAttribute('data-adjust-username')!;
        const balance = parseInt(btn.getAttribute('data-adjust-balance')!);
        openAdjustmentModal(uid, username, balance);
      });
    });
  }

  async function loadTransactions() {
    txTbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Loading ledger records...</td></tr>`;
    const res = await api.getTransactions({
      type: txTypeFilter.value,
      search: txSearchInput.value.trim()
    });
    if (!res.success || !res.data) {
      txTbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load transactions: ${res.error || 'Server error'}</td></tr>`;
      return;
    }
    const txs = res.data;
    if (txs.length === 0) {
      txTbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No transactions recorded under current filter.</td></tr>`;
      return;
    }

    txTbody.innerHTML = txs.map((t: any) => {
      const typeColor = 
        t.type === 'PURCHASE' ? 'text-emerald-400' :
        t.type === 'GAME_WIN' ? 'text-amber-400' :
        t.type === 'GAME_ENTRY' ? 'text-slate-400' :
        t.type === 'ADMIN_ADJUSTMENT' ? 'text-purple-400 font-bold' :
        t.type === 'GAME_REFUND' ? 'text-sky-400 font-bold' :
        'text-slate-300';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors font-mono">
          <td class="px-4 py-3 text-slate-400 font-semibold text-[11px]">${t.transaction_id}</td>
          <td class="px-4 py-3 font-sans">
            <span class="font-semibold text-white">${t.username}</span>
            <span class="text-[10px] text-slate-500 font-mono ml-1">#${t.user_id}</span>
          </td>
          <td class="px-4 py-3 text-[11px] ${typeColor}">${t.type}</td>
          <td class="px-4 py-3 text-right font-bold tabular-nums ${t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}">
            ${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()} ★
          </td>
          <td class="px-4 py-3 text-right text-slate-400 tabular-nums text-[11px]">
            ${t.balance_before.toLocaleString()} → <span class="text-white font-semibold">${t.balance_after.toLocaleString()}</span>
          </td>
          <td class="px-4 py-3 text-slate-400 text-[10px]">${t.reference_type}: ${t.reference_id}</td>
          <td class="px-4 py-3 font-sans text-slate-300 text-[11px] truncate max-w-xs">${t.notes || '—'}</td>
          <td class="px-4 py-3 text-slate-500 text-[10px] whitespace-nowrap">${new Date(t.created_at).toLocaleTimeString()}</td>
        </tr>
      `;
    }).join('');
  }

  txSearchInput.addEventListener('input', () => loadTransactions());
  txTypeFilter.addEventListener('change', () => loadTransactions());

  container.querySelector('#open-adjust-modal-btn')?.addEventListener('click', () => {
    openAdjustmentModal();
  });

  await loadWallets();

  function openAdjustmentModal(targetUserId?: number, targetUsername?: string, currentBal?: number) {
    const modalHtml = `
      <div class="space-y-4">
        <p class="text-xs text-slate-300">
          Manual balance modifications are executed as ACID transactions and strictly logged to the audit ledger. Negative adjustments cannot lower balances below zero.
        </p>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Target User ID:</label>
          <input 
            type="number" 
            id="adj-target-uid" 
            class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" 
            placeholder="e.g. 101" 
            value="${targetUserId || ''}" 
            ${targetUserId ? 'readonly' : ''}
          />
          ${targetUsername ? `<span class="text-[10px] text-amber-400 font-mono mt-0.5 block">Player: ${targetUsername} (Current Balance: ${currentBal?.toLocaleString()} ★)</span>` : ''}
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Amount to Adjust (+ for credit, - for debit):</label>
          <input type="number" id="adj-amount-val" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" placeholder="+500 or -250" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Mandatory Justification Reason (min 8 chars):</label>
          <textarea id="adj-reason-val" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Compensation for match cancellation due to network partition"></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Confirm Admin Security Password:</label>
          <input type="password" id="adj-admin-pwd" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" placeholder="••••••••••••" value="AdminSecret2026!" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-cancel-adj" class="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg">Cancel</button>
          <button id="modal-submit-adj" class="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-lg shadow-amber-500/20">
            Submit Star Adjustment
          </button>
        </div>
      </div>
    `;

    modal.showContentModal('Execute Star Balance Adjustment', modalHtml, (overlay) => {
      overlay.querySelector('#modal-cancel-adj')?.addEventListener('click', () => modal.close());
      overlay.querySelector('#modal-submit-adj')?.addEventListener('click', async () => {
        const uid = parseInt((overlay.querySelector('#adj-target-uid') as HTMLInputElement).value);
        const amount = parseInt((overlay.querySelector('#adj-amount-val') as HTMLInputElement).value);
        const reason = (overlay.querySelector('#adj-reason-val') as HTMLTextAreaElement).value.trim();

        if (!uid || isNaN(amount) || amount === 0) {
          toast.show('Please provide a valid User ID and non-zero amount.', 'warning');
          return;
        }
        if (reason.length < 8) {
          toast.show('A justification reason of at least 8 characters is required.', 'warning');
          return;
        }

        const res = await api.adjustStars({ user_id: uid, amount, reason });
        if (res.success) {
          toast.show(res.message || 'Balance adjusted successfully.', 'success');
          modal.close();
          await loadWallets();
        } else {
          toast.show(res.error || 'Adjustment failed.', 'error');
        }
      });
    });
  }
}
