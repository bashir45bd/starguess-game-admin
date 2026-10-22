// API Documentation & Interactive Testing Sandbox (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';

export function renderDocsView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">API Documentation & Integration Specs</h2>
          <p class="text-xs text-slate-400">Exhaustive REST API contracts for the Mobile Application client and Admin Panel administration.</p>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Base URL</span>
          <div class="text-sm font-mono font-bold text-white">/api/v1</div>
          <div class="text-[10px] text-slate-500 font-mono">PHP 8.2+ REST Route Handler</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Authentication Protocol</span>
          <div class="text-sm font-mono font-bold text-amber-400">Bearer &lt;TOKEN&gt;</div>
          <div class="text-[10px] text-slate-500 font-mono">Session & JWT Verification</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Transaction Guarantee</span>
          <div class="text-sm font-mono font-bold text-emerald-400">ACID + Row-Locking</div>
          <div class="text-[10px] text-slate-500 font-mono">SELECT FOR UPDATE on Wallets</div>
        </div>
      </div>

      <!-- Endpoints Directory -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-white">Documented REST Endpoints</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800 text-xs">
          <!-- 1. Admin Login -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">POST</span>
                <span class="font-mono text-white font-semibold">/api/v1/admin/auth/login</span>
              </div>
              <span class="text-slate-500 font-mono text-[10px]">Auth: Public</span>
            </div>
            <p class="text-slate-400 text-xs">Authenticates administrator with rate limiting and automated 15-minute account lockout after 5 consecutive failures.</p>
            <div class="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300">
              Payload: { "username": "admin", "password": "..." } → 200 OK: { "token": "...", "admin": {...} }
            </div>
          </div>

          <!-- 2. Wallet Adjust -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">POST</span>
                <span class="font-mono text-white font-semibold">/api/v1/admin/wallets/adjust</span>
              </div>
              <span class="text-purple-400 font-mono text-[10px]">Permission: wallets:*</span>
            </div>
            <p class="text-slate-400 text-xs">Executes authoritative Star balance modification. Never changes balances silently: generates unique transaction ID, logs before/after balance, and records mandatory reason.</p>
            <div class="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300">
              Payload: { "user_id": 101, "amount": 500, "reason": "Support compensation" } → 200 OK
            </div>
          </div>

          <!-- 3. Live Games -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold">GET</span>
                <span class="font-mono text-white font-semibold">/api/v1/admin/games/live</span>
              </div>
              <span class="text-purple-400 font-mono text-[10px]">Permission: games:monitor</span>
            </div>
            <p class="text-slate-400 text-xs">Streams currently in-progress 1v1 prediction matches, turn timers, player connection health, and cryptographic commitment hashes.</p>
          </div>

          <!-- 4. Payment Reconcile -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">POST</span>
                <span class="font-mono text-white font-semibold">/api/v1/admin/payments/reconcile</span>
              </div>
              <span class="text-purple-400 font-mono text-[10px]">Permission: payments:*</span>
            </div>
            <p class="text-slate-400 text-xs">Compares gateway transactions against internal purchase logs and credit transactions to catch duplicate callbacks or missing Stars.</p>
          </div>

          <!-- 5. Mobile Guess Submission -->
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">POST</span>
                <span class="font-mono text-white font-semibold">/api/v1/game/guess</span>
              </div>
              <span class="text-slate-500 font-mono text-[10px]">Auth: Bearer (Mobile Player)</span>
            </div>
            <p class="text-slate-400 text-xs">Mobile client submits prediction guess. Backend computes HIGHER / LOWER / MATCHED against securely salted secret commitment hash.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
