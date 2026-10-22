// Dashboard View (Vanilla JS) - Comprehensive KPIs & 5 Real-Time SVG Charts
import { api } from '../api';
import { state } from '../state';

export async function renderDashboardView(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Executive Game & Economy Dashboard</h2>
          <p class="text-xs text-slate-400">Authoritative real-time telemetry from PHP 8.2 backend and MySQL 8 virtual ledger.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Database Snapshot
          </span>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div id="dash-loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        <div class="h-24 bg-slate-900 rounded-xl border border-slate-800"></div>
        <div class="h-24 bg-slate-900 rounded-xl border border-slate-800"></div>
        <div class="h-24 bg-slate-900 rounded-xl border border-slate-800"></div>
        <div class="h-24 bg-slate-900 rounded-xl border border-slate-800"></div>
      </div>

      <div id="dash-content" class="space-y-6 hidden"></div>
    </div>
  `;

  const loadingEl = container.querySelector('#dash-loading');
  const contentEl = container.querySelector('#dash-content');

  const [kpisRes, chartsRes] = await Promise.all([
    api.getKPIs(),
    api.getCharts()
  ]);

  if (!kpisRes.success || !kpisRes.data) {
    loadingEl?.classList.add('hidden');
    container.innerHTML += `<div class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs">Failed to load dashboard metrics.</div>`;
    return;
  }

  const kpis = kpisRes.data;
  const charts = chartsRes.data || { days: [], daily_users: [], daily_games: [], stars_purchased: [], commission: [], revenue: [] };

  loadingEl?.classList.add('hidden');
  contentEl?.classList.remove('hidden');

  // Helper for generating smooth SVG sparkline / area chart
  function renderSvgChart(values: number[], labels: string[], colorHex: string, unit: string = '') {
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;
    const width = 360;
    const height = 90;
    const padding = 15;

    const points = values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaData = `${pathData} L ${width - padding},${height} L ${padding},${height} Z`;

    return `
      <div class="w-full">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="grad-${colorHex.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${colorHex}" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="${colorHex}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${areaData}" fill="url(#grad-${colorHex.replace('#', '')})" />
          <path d="${pathData}" fill="none" stroke="${colorHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${values.map((v, i) => {
            const [cx, cy] = points[i].split(',');
            return `<circle cx="${cx}" cy="${cy}" r="3" fill="#0f172a" stroke="${colorHex}" stroke-width="2" />`;
          }).join('')}
        </svg>
        <div class="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
          <span>${labels[0] || ''}</span>
          <span>${unit}${values[values.length - 1]?.toLocaleString()}</span>
          <span>${labels[labels.length - 1] || ''}</span>
        </div>
      </div>
    `;
  }

  contentEl!.innerHTML = `
    <!-- Top KPI Grid: 15 Core Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      <!-- Total Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Total Users</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${kpis.total_users}</div>
        <div class="text-[10px] text-emerald-400 font-mono">+${kpis.new_users_today} today</div>
      </div>

      <!-- Active Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Active Players</span>
        <div class="text-xl font-bold font-mono text-emerald-400 tabular-nums">${kpis.active_users}</div>
        <div class="text-[10px] text-slate-500 font-mono">Status: ACTIVE</div>
      </div>

      <!-- Active Matches -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 relative overflow-hidden">
        <span class="text-[11px] font-medium text-slate-400">Live 1v1 Matches</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${kpis.active_matches}</div>
        <div class="text-[10px] text-amber-400 font-mono">Turns in flight</div>
      </div>

      <!-- Games Completed -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Completed Games</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${kpis.games_completed}</div>
        <div class="text-[10px] text-slate-500 font-mono">${kpis.games_cancelled} cancelled / refunded</div>
      </div>

      <!-- Platform Commission -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Platform Commission</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${kpis.platform_commission.toLocaleString()} ★</div>
        <div class="text-[10px] text-slate-400 font-mono">Virtual rake collected</div>
      </div>

      <!-- Stars Sold -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Stars Sold (IAP)</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${kpis.stars_sold.toLocaleString()} ★</div>
        <div class="text-[10px] text-emerald-400 font-mono">Gross package credits</div>
      </div>

      <!-- Stars in Circulation -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Stars In Circulation</span>
        <div class="text-xl font-bold font-mono text-sky-400 tabular-nums">${kpis.stars_in_circulation.toLocaleString()} ★</div>
        <div class="text-[10px] text-slate-500 font-mono">Combined player balances</div>
      </div>

      <!-- Gross Revenue USD -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Fiat Gross Revenue</span>
        <div class="text-xl font-bold font-mono text-emerald-400 tabular-nums">$${kpis.revenue_usd}</div>
        <div class="text-[10px] text-slate-500 font-mono">Stripe & App Stores</div>
      </div>

      <!-- Suspended Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Sanctioned Accounts</span>
        <div class="text-xl font-bold font-mono text-rose-400 tabular-nums">${kpis.suspended_users}</div>
        <div class="text-[10px] text-rose-400/80 font-mono">Suspended / Banned</div>
      </div>

      <!-- System Alerts -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Anti-Cheat Alerts</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${kpis.system_alerts}</div>
        <div class="text-[10px] text-amber-400 font-mono">Pending investigation</div>
      </div>
    </div>

    <!-- 5 Dedicated Charts as requested in Requirement 4 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-white">7-Day Trend Analysis (Daily Users, Volume, Stars, Commission, Revenue)</h3>
        <span class="text-xs text-slate-500 font-mono">Last 7 UTC days</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Chart 1: Daily Users -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">1. Daily Active Users</span>
            <span class="text-[10px] font-mono text-emerald-400">Peak: ${Math.max(0, ...charts.daily_users)}</span>
          </div>
          ${renderSvgChart(charts.daily_users, charts.days, '#10b981')}
        </div>

        <!-- Chart 2: Daily Games -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">2. Daily Matches Played</span>
            <span class="text-[10px] font-mono text-sky-400">Peak: ${Math.max(0, ...charts.daily_games)}</span>
          </div>
          ${renderSvgChart(charts.daily_games, charts.days, '#0284c7')}
        </div>

        <!-- Chart 3: Stars Purchased -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">3. Stars Purchased (Volume)</span>
            <span class="text-[10px] font-mono text-amber-400">Peak: ${Math.max(0, ...charts.stars_purchased).toLocaleString()} ★</span>
          </div>
          ${renderSvgChart(charts.stars_purchased, charts.days, '#f59e0b', '★')}
        </div>

        <!-- Chart 4: Commission -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">4. Platform Commission</span>
            <span class="text-[10px] font-mono text-purple-400">Peak: ${Math.max(0, ...charts.commission).toLocaleString()} ★</span>
          </div>
          ${renderSvgChart(charts.commission, charts.days, '#a855f7', '★')}
        </div>

        <!-- Chart 5: Revenue -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">5. Fiat Revenue (USD)</span>
            <span class="text-[10px] font-mono text-emerald-400">Peak: $${Math.max(0, ...charts.revenue).toFixed(2)}</span>
          </div>
          ${renderSvgChart(charts.revenue, charts.days, '#22c55e', '$')}
        </div>

        <!-- Quick Action & System Status Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <span class="text-xs font-semibold text-slate-200">System State & Engine Mode</span>
            <p class="text-[11px] text-slate-400 mt-1">Live operational totals from the configured database.</p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Match Engine:</span>
              <span class="text-emerald-400">${kpis.active_matches} active matches</span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Ledger Invariant:</span>
              <span class="text-emerald-400">${kpis.platform_commission.toLocaleString()} ★ commission total</span>
            </div>
            <button id="view-live-btn" class="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>View Live Games Monitor</span>
              <span class="font-mono">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  contentEl!.querySelector('#view-live-btn')?.addEventListener('click', () => {
    state.setRoute('live-games');
  });
}
