// Game History, Match Audits & Refund Administration View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderGamesView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Game Matches & Audit History</h2>
          <p class="text-xs text-slate-400">Complete archive of finished, cancelled, and active prediction duels with cryptographic verification.</p>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
          <span class="text-slate-500 text-xs font-mono">🔍</span>
          <input 
            type="text" 
            id="games-search-input" 
            placeholder="Search Match ID or Player ID..." 
            class="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select id="games-status-filter" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none">
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="DISPUTED">DISPUTED</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Matches Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
              <tr>
                <th class="px-4 py-3">Match ID</th>
                <th class="px-4 py-3">Mode</th>
                <th class="px-4 py-3">Contenders</th>
                <th class="px-4 py-3 text-right">Entry Stakes</th>
                <th class="px-4 py-3 text-right">Prize / Rake</th>
                <th class="px-4 py-3">Winner</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="games-table-body" class="divide-y divide-slate-800/60">
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading matches...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#games-table-body') as HTMLElement;
  const searchInput = container.querySelector('#games-search-input') as HTMLInputElement;
  const statusFilter = container.querySelector('#games-status-filter') as HTMLSelectElement;

  async function loadGames() {
    tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Querying games database...</td></tr>`;
    const res = await api.getGames({
      search: searchInput.value.trim(),
      status: statusFilter.value
    });

    if (!res.success || !res.data) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load games: ${res.error || 'Server error'}</td></tr>`;
      return;
    }

    const games = res.data;
    if (games.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No matches found matching query.</td></tr>`;
      return;
    }

    tbody.innerHTML = games.map((g: any) => {
      const statusBadge = 
        g.status === 'COMPLETED' ? '<span class="text-emerald-400 font-mono font-semibold">COMPLETED</span>' :
        g.status === 'IN_PROGRESS' ? '<span class="text-amber-400 font-mono font-semibold">IN_PROGRESS</span>' :
        g.status === 'CANCELLED' ? '<span class="text-rose-400 font-mono font-semibold">CANCELLED</span>' :
        '<span class="text-purple-400 font-mono font-semibold">DISPUTED</span>';

      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono text-slate-300 font-semibold text-[11px]">${g.game_id}</td>
          <td class="px-4 py-3 text-slate-400 font-mono text-[11px]">${g.mode_name}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${g.player_a_username}</span>
            <span class="text-slate-500 font-mono text-[10px] mx-1">vs</span>
            <span class="font-semibold text-white">${g.player_b_username}</span>
          </td>
          <td class="px-4 py-3 text-right font-mono font-semibold tabular-nums text-amber-400">
            ${g.entry_fee} ★
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-300 text-[11px]">
            ${g.prize_amount} ★ <span class="text-slate-500">(-${g.commission_amount} ★)</span>
          </td>
          <td class="px-4 py-3 font-mono text-[11px]">
            ${g.winner_id ? `<span class="text-emerald-400 font-bold">#${g.winner_id}</span>` : '<span class="text-slate-500">—</span>'}
          </td>
          <td class="px-4 py-3 text-xs">${statusBadge}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-inspect-game="${g.game_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
                Audit
              </button>
              ${g.status === 'IN_PROGRESS' || g.status === 'DISPUTED' ? `
                <button data-refund-game="${g.game_id}" class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded text-[11px] font-medium transition-colors">
                  Cancel & Refund
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-inspect-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = btn.getAttribute('data-inspect-game')!;
        inspectGameAudit(gid);
      });
    });

    tbody.querySelectorAll('[data-refund-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = btn.getAttribute('data-refund-game')!;
        refundGameFlow(gid);
      });
    });
  }

  searchInput.addEventListener('input', () => loadGames());
  statusFilter.addEventListener('change', () => loadGames());
  await loadGames();

  async function inspectGameAudit(gameId: string) {
    const res = await api.getGameDetails(gameId);
    if (!res.success || !res.data) {
      toast.show('Failed to fetch game audit.', 'error');
      return;
    }
    const g = res.data;

    const modalHtml = `
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-bold text-white font-mono">${g.game_id}</h4>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">${g.status}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
            <div>Contender A: <strong class="text-white">${g.player_a?.username}</strong> (#${g.player_a_id})</div>
            <div>Contender B: <strong class="text-white">${g.player_b?.username}</strong> (#${g.player_b_id})</div>
            <div>Stakes: ${g.entry_fee} ★ each</div>
            <div>Commission: ${g.commission_amount} ★ (${g.mode?.commission_percentage}%)</div>
            <div>Prize: <strong class="text-amber-400">${g.prize_amount} ★</strong></div>
            <div>Winner: ${g.winner_id ? `<span class="text-emerald-400 font-bold">#${g.winner_id}</span>` : 'None / Cancelled'}</div>
          </div>
        </div>

        <!-- Cryptographic Proof Box -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <span class="text-slate-400 font-bold uppercase text-[10px]">Cryptographic Fairness Verification:</span>
          <div class="text-slate-400">
            Secret Number: <strong class="text-emerald-400">${g.secret_revealed_number ?? 'Hidden until match completion'}</strong>
          </div>
          <div class="text-slate-400">
            Salt: <strong class="text-slate-300">${g.secret_salt}</strong>
          </div>
          <div class="text-slate-400 break-all text-[10px]">
            Commitment Hash (SHA-256): <span class="text-slate-200">${g.secret_commitment_hash}</span>
          </div>
        </div>

        <!-- Attempt Sequence Table -->
        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Turn Attempt Sequence:</h5>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            ${g.guesses.length === 0 ? '<p class="text-slate-500 text-xs text-center py-2">No guesses submitted.</p>' : g.guesses.map((gu: any) => `
              <div class="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span class="text-slate-400">#${gu.attempt_number} · Player #${gu.player_id} guessed <strong class="text-white">${gu.guess_number}</strong></span>
                <div class="flex items-center gap-3">
                  <span class="font-bold ${gu.result === 'MATCHED' ? 'text-emerald-400' : gu.result === 'HIGHER' ? 'text-sky-400' : 'text-purple-400'}">${gu.result}</span>
                  <span class="text-[10px] text-slate-500">${gu.response_time_ms}ms</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    modal.showContentModal(`Game Audit Inspector: ${gameId}`, modalHtml);
  }

  function refundGameFlow(gameId: string) {
    modal.showDangerousConfirm({
      title: `Cancel & Refund Match ${gameId}`,
      message: `Cancelling this match will immediately refund all entry Stars back into the players' wallets via an immutable ledger transaction. Provide justification for the audit trail.`,
      actionButtonText: 'Execute Game Refund',
      requireTypingWord: 'REFUND',
      requirePassword: true,
      onConfirm: async (adminPassword) => {
        const res = await api.refundGame(gameId, 'Admin cancelled match and refunded entry fees due to technical investigation', adminPassword || '');
        if (res.success) {
          toast.show(res.message || 'Refund processed.', 'success');
          await loadGames();
        } else {
          toast.show(res.error || 'Refund failed.', 'error');
        }
      }
    });
  }
}
