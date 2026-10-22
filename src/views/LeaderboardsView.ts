// Leaderboard, Daily Streak Rewards & Referral Program View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';

export async function renderLeaderboardsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Leaderboards, Rewards & Referrals</h2>
          <p class="text-xs text-slate-400">Competitive player standings, 7-day login streak incentives, and viral referral attribution.</p>
        </div>
      </div>

      <!-- 3 Columns / Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Col 1: Top Player Rankings -->
        <div class="lg:col-span-2 space-y-3">
          <h3 class="text-sm font-semibold text-white">All-Time Competitive Leaderboard</h3>
          <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                  <tr>
                    <th class="px-4 py-3">Rank</th>
                    <th class="px-4 py-3">Player</th>
                    <th class="px-4 py-3 text-right">Stars Won</th>
                    <th class="px-4 py-3 text-right">Win Rate</th>
                    <th class="px-4 py-3 text-right">Matches</th>
                  </tr>
                </thead>
                <tbody id="leaderboard-table-body" class="divide-y divide-slate-800/60 font-mono">
                  <tr><td colspan="5" class="px-4 py-6 text-center text-slate-500 font-sans">Loading rankings...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Col 2: 7-Day Login Streak Reward Matrix -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-white">Daily Login Streak Reward Ladder</h3>
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div id="rewards-ladder" class="space-y-2">
              <p class="text-xs text-slate-500">Loading reward tiers...</p>
            </div>
          </div>

          <!-- Transfer Settings Card -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 class="text-xs font-semibold text-white">P2P Star Transfer Guardrails</h4>
            <div class="space-y-2 text-xs text-slate-300">
              <div class="flex justify-between font-mono">
                <span class="text-slate-400 font-sans">Min Transfer:</span>
                <span class="text-white font-bold">50 ★</span>
              </div>
              <div class="flex justify-between font-mono">
                <span class="text-slate-400 font-sans">Daily Cap:</span>
                <span class="text-white font-bold">2,000 ★</span>
              </div>
              <div class="flex justify-between font-mono">
                <span class="text-slate-400 font-sans">Transfer Fee:</span>
                <span class="text-amber-400 font-bold">2.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Referrals Table -->
      <div class="space-y-3 pt-2">
        <h3 class="text-sm font-semibold text-white">Affiliate & Player Referral Network</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th class="px-4 py-3">Referrer</th>
                  <th class="px-4 py-3">Invited Referee</th>
                  <th class="px-4 py-3 text-right">Stars Bounty</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody id="referrals-table-body" class="divide-y divide-slate-800/60">
                <tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">Loading referral records...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  const lbTbody = container.querySelector('#leaderboard-table-body') as HTMLElement;
  const rewardsLadder = container.querySelector('#rewards-ladder') as HTMLElement;
  const refTbody = container.querySelector('#referrals-table-body') as HTMLElement;

  const [lbRes, rewRes, refRes] = await Promise.all([
    api.getLeaderboards(),
    api.getRewards(),
    api.getReferrals()
  ]);

  if (lbRes.success && lbRes.data) {
    lbTbody.innerHTML = lbRes.data.map((p: any) => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-2.5 font-bold ${p.rank === 1 ? 'text-amber-400' : p.rank === 2 ? 'text-slate-300' : p.rank === 3 ? 'text-amber-600' : 'text-slate-500'}">
          #${p.rank}
        </td>
        <td class="px-4 py-2.5 font-sans">
          <span class="font-semibold text-white">${p.username}</span>
          <span class="text-[10px] text-slate-500 font-mono ml-1">#${p.user_id}</span>
        </td>
        <td class="px-4 py-2.5 text-right font-bold text-amber-400 tabular-nums">
          ${p.stars_won.toLocaleString()} ★
        </td>
        <td class="px-4 py-2.5 text-right text-slate-300 tabular-nums">${p.win_rate}</td>
        <td class="px-4 py-2.5 text-right text-slate-400 tabular-nums">${p.games_played}</td>
      </tr>
    `).join('');
  }

  if (rewRes.success && rewRes.data) {
    rewardsLadder.innerHTML = rewRes.data.map((r: any) => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
        <span class="text-slate-400 font-sans font-medium">Day ${r.day} Login</span>
        <div class="flex items-center gap-2">
          <span class="font-bold text-amber-400 tabular-nums">+${r.stars} ★</span>
          ${r.streak_bonus > 0 ? `<span class="text-[10px] text-emerald-400">(+${r.streak_bonus} streak)</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  if (refRes.success && refRes.data) {
    refTbody.innerHTML = refRes.data.map((rf: any) => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-2.5 font-semibold text-white font-mono">#${rf.referrer_id} (${rf.referrer_username})</td>
        <td class="px-4 py-2.5 font-semibold text-slate-200 font-mono">#${rf.referee_id} (${rf.referee_username})</td>
        <td class="px-4 py-2.5 text-right font-mono font-bold text-emerald-400 tabular-nums">+${rf.reward} ★</td>
        <td class="px-4 py-2.5 font-mono text-xs text-emerald-400 font-semibold">${rf.status}</td>
        <td class="px-4 py-2.5 font-mono text-slate-500 text-[10px]">${new Date(rf.registered_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }
}
