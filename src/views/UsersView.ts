// User Management & Profile Inspector View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderUsersView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Player Directory & Profiles</h2>
          <p class="text-xs text-slate-400">Inspect user accounts, virtual wallet balances, win records, risk scores, and apply sanctions.</p>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
          <span class="text-slate-500 text-xs font-mono">🔍</span>
          <input 
            type="text" 
            id="user-search-input" 
            placeholder="Search by Username, Email, or User ID..." 
            class="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select id="user-status-filter" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Risk Score:</span>
            <select id="user-risk-filter" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none">
              <option value="ALL">All Risk Tiers</option>
              <option value="NORMAL">NORMAL</option>
              <option value="MONITOR">MONITOR</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
              <tr>
                <th class="px-4 py-3">Player</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Risk Assessment</th>
                <th class="px-4 py-3 text-right">Stars Balance</th>
                <th class="px-4 py-3 text-right">Matches (W / L)</th>
                <th class="px-4 py-3 text-right">Win Rate</th>
                <th class="px-4 py-3">Last Active</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="divide-y divide-slate-800/60">
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading user accounts...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#user-search-input') as HTMLInputElement;
  const statusFilter = container.querySelector('#user-status-filter') as HTMLSelectElement;
  const riskFilter = container.querySelector('#user-risk-filter') as HTMLSelectElement;
  const tbody = container.querySelector('#users-table-body') as HTMLElement;

  async function loadUsers() {
    tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Querying database...</td></tr>`;
    const res = await api.getUsers({
      search: searchInput.value.trim(),
      status: statusFilter.value,
      risk_level: riskFilter.value
    });

    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load users: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const users = res.data;
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No users matched search criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u: any) => {
      const winRate = u.games_played > 0 ? ((u.games_won / u.games_played) * 100).toFixed(1) : '0';
      const statusBadge = 
        u.status === 'ACTIVE' ? '<span class="text-emerald-400 font-semibold font-mono">ACTIVE</span>' :
        u.status === 'SUSPENDED' ? '<span class="text-amber-400 font-semibold font-mono">SUSPENDED</span>' :
        '<span class="text-rose-400 font-semibold font-mono">BANNED</span>';

      const riskBadge =
        u.risk_level === 'NORMAL' ? '<span class="text-slate-400 font-mono">NORMAL</span>' :
        u.risk_level === 'MONITOR' ? '<span class="text-amber-400 font-mono font-bold">MONITOR</span>' :
        u.risk_level === 'SUSPICIOUS' ? '<span class="text-rose-400 font-mono font-bold">SUSPICIOUS</span>' :
        '<span class="text-red-500 font-mono font-black">BLOCKED</span>';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img src="${u.avatar_url}" alt="${u.username}" class="w-7 h-7 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0" />
              <div>
                <span class="font-semibold text-white">${u.username}</span>
                <div class="text-[10px] text-slate-500 font-mono">ID #${u.user_id} · ${u.email}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-xs">${statusBadge}</td>
          <td class="px-4 py-3 text-xs">${riskBadge}</td>
          <td class="px-4 py-3 text-right font-mono font-semibold tabular-nums text-amber-400">
            ${u.current_balance.toLocaleString()} ★
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
            <span class="text-emerald-400">${u.games_won}W</span> / <span class="text-rose-400">${u.games_lost}L</span>
            <div class="text-[10px] text-slate-500">Total: ${u.games_played}</div>
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums ${parseFloat(winRate) > 80 ? 'text-amber-400 font-bold' : 'text-slate-300'}">
            ${winRate}%
          </td>
          <td class="px-4 py-3 text-[11px] font-mono text-slate-400">
            ${new Date(u.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-inspect-id="${u.user_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium transition-colors">
                Profile
              </button>
              <button data-sanction-id="${u.user_id}" data-current-status="${u.status}" class="px-2.5 py-1 ${u.status === 'ACTIVE' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded text-[11px] font-medium transition-colors">
                ${u.status === 'ACTIVE' ? 'Sanction' : 'Unban'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach inspect buttons
    tbody.querySelectorAll('[data-inspect-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-inspect-id')!);
        inspectUserProfile(id);
      });
    });

    // Attach sanction buttons
    tbody.querySelectorAll('[data-sanction-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-sanction-id')!);
        const currentStatus = btn.getAttribute('data-current-status')!;
        sanctionUserFlow(id, currentStatus);
      });
    });
  }

  searchInput.addEventListener('input', () => loadUsers());
  statusFilter.addEventListener('change', () => loadUsers());
  riskFilter.addEventListener('change', () => loadUsers());

  await loadUsers();

  // Profile detail modal
  async function inspectUserProfile(userId: number) {
    const res = await api.getUser(userId);
    if (!res.success || !res.data) {
      toast.show('Failed to fetch user profile details.', 'error');
      return;
    }
    const { user, wallet, transactions, games, alerts, referrals } = res.data;
    const winRate = user.games_played > 0 ? ((user.games_won / user.games_played) * 100).toFixed(1) : '0';

    const contentHtml = `
      <div class="space-y-4">
        <!-- Header summary -->
        <div class="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <img src="${user.avatar_url}" alt="${user.username}" class="w-14 h-14 rounded-full border border-slate-700 object-cover" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-base font-bold text-white">${user.username}</h4>
              <span class="text-xs font-mono text-slate-400">#${user.user_id}</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded ${user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">${user.status}</span>
            </div>
            <p class="text-xs text-slate-400 font-mono">${user.email} · Phone: ${user.phone || 'N/A'}</p>
            <p class="text-[10px] text-slate-500 font-mono mt-1">Joined: ${new Date(user.created_at).toLocaleDateString()} · Device: ${user.device_id}</p>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 uppercase font-medium">Stars Balance</span>
            <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${wallet.balance.toLocaleString()} ★</div>
          </div>
        </div>

        <!-- Economy breakdown -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Purchased Stars</span>
            <div class="text-sm font-bold font-mono text-white tabular-nums">${user.total_stars_purchased.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Won in Games</span>
            <div class="text-sm font-bold font-mono text-emerald-400 tabular-nums">${user.total_stars_won.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Spent on Entry Fees</span>
            <div class="text-sm font-bold font-mono text-rose-400 tabular-nums">${user.total_stars_spent.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Win Rate (${user.games_won}W / ${user.games_lost}L)</span>
            <div class="text-sm font-bold font-mono text-sky-400 tabular-nums">${winRate}%</div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Recent Wallet Transactions</h5>
          <div class="bg-slate-950 rounded-lg border border-slate-800 divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
            ${transactions.length === 0 ? '<div class="p-3 text-center text-slate-500">No transactions recorded.</div>' : transactions.map((t: any) => `
              <div class="p-2.5 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span class="font-semibold text-slate-200">${t.type}</span>
                  <span class="text-slate-500 text-[10px] ml-2">${t.transaction_id}</span>
                  <div class="text-[10px] text-slate-400">${t.notes || ''}</div>
                </div>
                <div class="text-right">
                  <span class="${t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold tabular-nums">${t.amount > 0 ? '+' : ''}${t.amount} ★</span>
                  <div class="text-[10px] text-slate-500">${t.balance_before} → ${t.balance_after}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sanction & Password Reset Action Bar -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-800">
          <button id="modal-reset-pwd-btn" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors">
            Dispatch Password Reset Link
          </button>
          <div class="flex items-center gap-2">
            <button id="modal-adjust-stars-btn" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-xs font-medium transition-colors">
              Adjust Stars (+/-)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.showContentModal(`User Profile: ${user.username}`, contentHtml, (overlay) => {
      overlay.querySelector('#modal-reset-pwd-btn')?.addEventListener('click', async () => {
        const pRes = await api.resetUserPassword(user.user_id);
        if (pRes.success) {
          toast.show(pRes.message || 'Password reset link sent.', 'success');
        } else {
          toast.show(pRes.error || 'Failed to dispatch reset link.', 'error');
        }
      });

      overlay.querySelector('#modal-adjust-stars-btn')?.addEventListener('click', () => {
        modal.close();
        triggerStarAdjustment(user.user_id, user.username, wallet.balance);
      });
    });
  }

  // Sanction / Ban flow
  function sanctionUserFlow(userId: number, currentStatus: string) {
    if (currentStatus === 'ACTIVE') {
      modal.showDangerousConfirm({
        title: `Sanction Player #${userId}`,
        message: `Are you sure you want to suspend/ban this player? All active matchmaking sessions will be terminated. A clear reason is required for administrative audit logs.`,
        actionButtonText: 'Apply Account Ban',
        requireTypingWord: 'BAN',
        requirePassword: true,
        onConfirm: async () => {
          const res = await api.updateUserStatus(userId, 'BANNED', 'Administrative ban enforced due to suspicious activity investigation');
          if (res.success) {
            toast.show(`Player #${userId} has been BANNED.`, 'success');
            await loadUsers();
          } else {
            toast.show(res.error || 'Sanction failed.', 'error');
          }
        }
      });
    } else {
      modal.showDangerousConfirm({
        title: `Reactivate Player #${userId}`,
        message: `Restore player account to ACTIVE status. The player will be permitted to enter 1v1 matchmaking again.`,
        actionButtonText: 'Lift Sanction',
        requireTypingWord: 'UNBAN',
        onConfirm: async () => {
          const res = await api.updateUserStatus(userId, 'ACTIVE', 'Administrative unsuspension / penalty lifted');
          if (res.success) {
            toast.show(`Player #${userId} is now ACTIVE.`, 'success');
            await loadUsers();
          } else {
            toast.show(res.error || 'Failed to lift sanction.', 'error');
          }
        }
      });
    }
  }

  // Quick Star adjustment prompt
  function triggerStarAdjustment(userId: number, username: string, currentBalance: number) {
    const adjustHtml = `
      <div class="space-y-4">
        <p class="text-xs text-slate-300">
          Manual virtual currency adjustment for <strong class="text-white">${username}</strong> (Current: <span class="font-mono text-amber-400 font-bold">${currentBalance.toLocaleString()} ★</span>).
        </p>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Adjustment Amount (+ or - Stars):</label>
          <input type="number" id="adj-amount-input" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" placeholder="e.g. 500 or -200" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Mandatory Justification Reason (min 8 chars):</label>
          <textarea id="adj-reason-input" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Customer support compensation for server disconnect"></textarea>
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="adj-submit-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Post Immutable Adjustment to Ledger
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(`Adjust Star Balance: #${userId}`, adjustHtml, (overlay) => {
      overlay.querySelector('#adj-submit-btn')?.addEventListener('click', async () => {
        const amountVal = parseInt((overlay.querySelector('#adj-amount-input') as HTMLInputElement).value);
        const reasonVal = (overlay.querySelector('#adj-reason-input') as HTMLTextAreaElement).value.trim();

        if (isNaN(amountVal) || amountVal === 0) {
          toast.show('Please provide a non-zero adjustment amount.', 'warning');
          return;
        }
        if (reasonVal.length < 8) {
          toast.show('A justification of at least 8 characters is required.', 'warning');
          return;
        }

        const res = await api.adjustStars({
          user_id: userId,
          amount: amountVal,
          reason: reasonVal
        });

        if (res.success) {
          toast.show(res.message || 'Balance adjusted successfully.', 'success');
          modal.close();
          await loadUsers();
        } else {
          toast.show(res.error || 'Adjustment failed.', 'error');
        }
      });
    });
  }
}
