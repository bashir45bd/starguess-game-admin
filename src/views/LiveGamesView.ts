// Live Game Monitoring View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderLiveGamesView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Active Matches & Live Prediction Monitor</h2>
          <p class="text-xs text-slate-400">Read-only real-time monitoring of 1-vs-1 number prediction matches. Admins cannot alter game state.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Socket Live Stream
          </span>
          <button id="refresh-live-btn" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded-lg border border-slate-700 transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>

      <!-- Live matches cards grid -->
      <div id="live-matches-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="col-span-full p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
          Polling active matches...
        </div>
      </div>
    </div>
  `;

  const grid = container.querySelector('#live-matches-grid') as HTMLElement;
  const refreshBtn = container.querySelector('#refresh-live-btn') as HTMLButtonElement;

  async function loadLiveMatches() {
    const res = await api.getLiveGames();
    if (!res.success || !res.data) {
      grid.innerHTML = `<div class="col-span-full p-6 text-center text-rose-400 bg-slate-900 rounded-xl border border-slate-800">Failed to load active matches: ${res.error || 'Server error'}</div>`;
      return;
    }

    const matches = res.data;
    if (matches.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-12 text-center bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span class="text-2xl font-mono">🎯</span>
          <p class="text-sm font-semibold text-white">No active matches in progress</p>
          <p class="text-xs text-slate-500">All player matchmaking queues are idle or waiting for opponents.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = matches.map((m: any) => `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
        <!-- Top bar with mode & match ID -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-white font-mono">${m.game_id}</span>
            <span class="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">${m.mode_name}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Server: ${m.server_node}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        <!-- 1v1 Arena Versus Box -->
        <div class="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 relative">
          <!-- Player A -->
          <div class="p-2.5 rounded-md ${m.current_turn_player_id === m.player_a_id ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900/50 border border-slate-800'}">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white truncate">${m.player_a_username}</span>
              <span class="text-[9px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">UID #${m.player_a_id} · Slot A</div>
            ${m.current_turn_player_id === m.player_a_id ? `
              <div class="mt-2 text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                <span class="animate-pulse">▶</span> CURRENT TURN
              </div>
            ` : '<div class="mt-2 text-[10px] font-mono text-slate-600">Waiting opponent</div>'}
          </div>

          <!-- Player B -->
          <div class="p-2.5 rounded-md ${m.current_turn_player_id === m.player_b_id ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900/50 border border-slate-800'}">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white truncate">${m.player_b_username}</span>
              <span class="text-[9px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">UID #${m.player_b_id} · Slot B</div>
            ${m.current_turn_player_id === m.player_b_id ? `
              <div class="mt-2 text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                <span class="animate-pulse">▶</span> CURRENT TURN
              </div>
            ` : '<div class="mt-2 text-[10px] font-mono text-slate-600">Waiting opponent</div>'}
          </div>
        </div>

        <!-- Match Meta & Cryptographic Commitment Hash -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Stakes / Prize</span>
            <div class="text-xs font-mono font-bold text-amber-400 tabular-nums">${m.entry_fee} ★ → ${m.prize_amount} ★</div>
          </div>
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Attempts Made</span>
            <div class="text-xs font-mono font-bold text-white tabular-nums">${m.total_attempts}</div>
          </div>
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Turn Clock</span>
            <div class="text-xs font-mono font-bold text-emerald-400 tabular-nums animate-pulse">${m.turn_time_remaining}s left</div>
          </div>
        </div>

        <!-- Secret Commitment Hash -->
        <div class="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
          <div class="flex items-center justify-between text-slate-400">
            <span>Cryptographic Secret Commitment (SHA-256):</span>
            <span class="text-emerald-400 font-bold">LOCKED & FAIR</span>
          </div>
          <p class="text-slate-300 break-all select-all font-mono">${m.secret_commitment_hash}</p>
        </div>

        <!-- Action Bar: Timeline Inspector & Safe Simulation -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <button data-inspect-game="${m.game_id}" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors">
            Inspect Full Guess Timeline
          </button>
          <button data-simulate-step="${m.game_id}" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono rounded-lg transition-colors border border-amber-500/30">
            Simulate Next Turn (Demo)
          </button>
        </div>
      </div>
    `).join('');

    // Attach inspect handlers
    grid.querySelectorAll('[data-inspect-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gameId = btn.getAttribute('data-inspect-game')!;
        inspectGameTimeline(gameId);
      });
    });

    // Attach simulate handlers
    grid.querySelectorAll('[data-simulate-step]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const gameId = btn.getAttribute('data-simulate-step')!;
        const simRes = await api.simulateGameStep(gameId);
        if (simRes.success) {
          toast.show(simRes.message || 'Turn simulated.', 'info');
          await loadLiveMatches();
        } else {
          toast.show(simRes.error || 'Simulation error.', 'error');
        }
      });
    });
  }

  refreshBtn.addEventListener('click', () => loadLiveMatches());
  await loadLiveMatches();

  async function inspectGameTimeline(gameId: string) {
    const res = await api.getGameDetails(gameId);
    if (!res.success || !res.data) {
      toast.show('Failed to fetch game details.', 'error');
      return;
    }
    const g = res.data;

    const guessesHtml = g.guesses.map((gu: any) => `
      <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
        <div class="flex items-center gap-3">
          <span class="text-slate-500 text-[10px]">#${gu.attempt_number}</span>
          <span class="font-bold text-white">${gu.player_id === g.player_a_id ? g.player_a?.username : g.player_b?.username}</span>
          <span class="text-slate-400">guessed <strong class="text-amber-400 font-bold">${gu.guess_number}</strong></span>
        </div>
        <div class="flex items-center gap-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
            gu.result === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-400' :
            gu.result === 'HIGHER' ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'
          }">${gu.result}</span>
          <span class="text-[10px] text-slate-500">${gu.response_time_ms}ms</span>
        </div>
      </div>
    `).join('');

    const modalHtml = `
      <div class="space-y-4">
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm">${g.game_id}</span>
            <span class="font-mono text-xs text-amber-400">${g.status}</span>
          </div>
          <div class="text-[11px] font-mono text-slate-400">
            ${g.player_a?.username} vs ${g.player_b?.username} · Entry: ${g.entry_fee} ★ · Prize: ${g.prize_amount} ★
          </div>
        </div>

        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Guess Sequence & Feedback:</h5>
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            ${guessesHtml.length > 0 ? guessesHtml : '<p class="text-slate-500 text-center py-4">No guesses submitted yet.</p>'}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-end">
          <button id="modal-close-inspect" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium">
            Close Inspector
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(`Game Details: ${gameId}`, modalHtml, (overlay) => {
      overlay.querySelector('#modal-close-inspect')?.addEventListener('click', () => modal.close());
    });
  }
}
