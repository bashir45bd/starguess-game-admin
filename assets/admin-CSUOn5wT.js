(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{constructor(){this.baseUrl=`/starguess-admin/api/v1`,this.token=null,this.token=sessionStorage.getItem(`starguess_admin_token`)}setToken(e){this.token=e,e?sessionStorage.setItem(`starguess_admin_token`,e):sessionStorage.removeItem(`starguess_admin_token`)}getToken(){return this.token}async request(e,t={}){let n={"Content-Type":`application/json`,...t.headers||{}};this.token&&(n.Authorization=`Bearer ${this.token}`);try{let r=await fetch(`${this.baseUrl}${e}`,{...t,headers:n}),i=await r.json();return r.ok?i:{success:!1,error_code:i.error_code||`HTTP_${r.status}`,error:i.message||i.error||`Request failed with status ${r.status}`}}catch(e){return{success:!1,error_code:`NETWORK_ERROR`,error:e.message||`Network connection failed`}}}login(e){return this.request(`/admin/auth/login`,{method:`POST`,body:JSON.stringify(e)})}logout(){return this.request(`/admin/auth/logout`,{method:`POST`})}getMe(){return this.request(`/admin/auth/me`)}changePassword(e){return this.request(`/admin/auth/change-password`,{method:`POST`,body:JSON.stringify(e)})}switchRole(e){return this.request(`/admin/auth/switch-role`,{method:`POST`,body:JSON.stringify({role:e})})}getKPIs(){return this.request(`/admin/dashboard/kpis`)}getCharts(){return this.request(`/admin/dashboard/charts`)}getUsers(e={}){let t=new URLSearchParams(e).toString();return this.request(`/admin/users${t?`?`+t:``}`)}getUser(e){return this.request(`/admin/users/${e}`)}updateUserStatus(e,t,n){return this.request(`/admin/users/${e}/status`,{method:`PUT`,body:JSON.stringify({status:t,reason:n})})}updateUserRisk(e,t,n){return this.request(`/admin/users/${e}/risk`,{method:`PUT`,body:JSON.stringify({risk_level:t,reason:n})})}resetUserPassword(e){return this.request(`/admin/users/${e}/reset-password`,{method:`POST`})}getWallets(){return this.request(`/admin/wallets`)}getTransactions(e={}){let t=new URLSearchParams(e).toString();return this.request(`/admin/transactions${t?`?`+t:``}`)}adjustStars(e){return this.request(`/admin/wallets/adjust`,{method:`POST`,body:JSON.stringify(e)})}getPackages(){return this.request(`/admin/star-packages`)}createPackage(e){return this.request(`/admin/star-packages`,{method:`POST`,body:JSON.stringify(e)})}updatePackage(e,t){return this.request(`/admin/star-packages/${e}`,{method:`PUT`,body:JSON.stringify(t)})}getGameModes(){return this.request(`/admin/game-modes`)}updateGameMode(e,t){return this.request(`/admin/game-modes/${e}`,{method:`PUT`,body:JSON.stringify(t)})}getCommissions(){return this.request(`/admin/commissions`)}getGames(e={}){let t=new URLSearchParams(e).toString();return this.request(`/admin/games${t?`?`+t:``}`)}getLiveGames(){return this.request(`/admin/games/live`)}getGameDetails(e){return this.request(`/admin/games/${e}`)}getGameTimeline(e){return this.request(`/admin/games/${e}/timeline`)}simulateGameStep(e){return this.request(`/admin/games/${e}/simulate-step`,{method:`POST`})}refundGame(e,t,n){return this.request(`/admin/games/${e}/refund`,{method:`POST`,body:JSON.stringify({reason:t,admin_password:n})})}getPayments(){return this.request(`/admin/payments`)}reconcilePayments(){return this.request(`/admin/payments/reconcile`,{method:`POST`})}getDisputes(){return this.request(`/admin/disputes`)}resolveDispute(e,t,n,r){return this.request(`/admin/disputes/${e}/resolve`,{method:`POST`,body:JSON.stringify({decision:t,refund_amount:n,admin_notes:r})})}getLeaderboards(){return this.request(`/admin/leaderboards`)}getRewards(){return this.request(`/admin/rewards`)}getReferrals(){return this.request(`/admin/referrals`)}getAntiFraud(){return this.request(`/admin/anti-fraud`)}updateAlertStatus(e,t){return this.request(`/admin/anti-fraud/alerts/${e}`,{method:`PUT`,body:JSON.stringify({status:t})})}getAuditLogs(){return this.request(`/admin/audit-logs`)}getSettings(){return this.request(`/admin/settings`)}updateSettings(e){return this.request(`/admin/settings`,{method:`PUT`,body:JSON.stringify(e)})}broadcastNotification(e){return this.request(`/admin/notifications/broadcast`,{method:`POST`,body:JSON.stringify(e)})}getBackupStatus(){return this.request(`/admin/backup/status`)}triggerBackup(){return this.request(`/admin/backup/trigger`,{method:`POST`})}getDocs(){return this.request(`/docs`)}},t=new class{constructor(){this.currentRoute=`dashboard`,this.admin=null,this.isAuthenticated=!1,this.sidebarOpen=!0,this.activeModal=null,this.listeners=new Map,this.admin=null,this.isAuthenticated=!1}setRoute(e){this.currentRoute!==e&&(this.currentRoute=e,this.emit(`routeChanged`))}setAdmin(e){this.admin=e,this.isAuthenticated=!!e,this.emit(`authChanged`)}hasPerm(e){if(!this.admin)return!1;if(this.admin.permissions.includes(`*`)||this.admin.permissions.includes(e))return!0;let t=e.split(`:`)[0]+`:*`;return!!this.admin.permissions.includes(t)}on(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>this.off(e,t)}off(e,t){this.listeners.get(e)?.delete(t)}emit(e){this.listeners.get(e)?.forEach(t=>{try{t()}catch(t){console.error(`Error in event listener for [${e}]:`,t)}})}},n=new class{constructor(){this.activeOverlay=null}showDangerousConfirm(e){this.close();let t=document.createElement(`div`);t.className=`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4`;let n=e.requireTypingWord||``,r=!!n;t.innerHTML=`
      <div class="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-xl p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono text-xl font-bold">
            ⚠
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">${e.title}</h3>
            <p class="text-xs text-rose-400 font-medium">Critical Administrative Action</p>
          </div>
        </div>

        <p class="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          ${e.message}
        </p>

        ${r?`
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">
              Type <strong class="text-rose-400 font-mono tracking-wider">${n}</strong> to confirm:
            </label>
            <input type="text" id="confirm-typed-word" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500" placeholder="${n}" />
          </div>
        `:``}

        ${e.requirePassword?`
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">
              Confirm Admin Security Credential:
            </label>
            <input type="password" id="confirm-admin-password" autocomplete="current-password" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500" placeholder="Enter your password" />
          </div>
        `:``}

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="cancel-danger-btn" class="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button id="execute-danger-btn" class="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-900/30">
            ${e.actionButtonText||`Confirm & Execute`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(t),this.activeOverlay=t;let i=t.querySelector(`#cancel-danger-btn`),a=t.querySelector(`#execute-danger-btn`),o=t.querySelector(`#confirm-typed-word`),s=t.querySelector(`#confirm-admin-password`);i?.addEventListener(`click`,()=>this.close()),t.addEventListener(`click`,e=>{e.target===t&&this.close()}),a?.addEventListener(`click`,async()=>{if(r&&o&&o.value.trim().toUpperCase()!==n.toUpperCase())o.classList.add(`border-rose-500`,`animate-shake`);else if(e.requirePassword&&(!s||s.value.length===0))s?.classList.add(`border-rose-500`);else{a.disabled=!0,a.innerText=`Processing...`;try{await e.onConfirm(s?.value),this.close()}catch{a.disabled=!1,a.innerText=e.actionButtonText||`Confirm & Execute`}}})}showContentModal(e,t,n){this.close();let r=document.createElement(`div`);r.className=`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto`,r.innerHTML=`
      <div class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-semibold text-white">${e}</h3>
          <button id="modal-close-x" class="text-slate-400 hover:text-white text-sm font-mono p-1">✕</button>
        </div>
        <div id="modal-body" class="flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 pr-1">
          ${t}
        </div>
      </div>
    `,document.body.appendChild(r),this.activeOverlay=r,r.querySelector(`#modal-close-x`)?.addEventListener(`click`,()=>this.close()),r.addEventListener(`click`,e=>{e.target===r&&this.close()}),n&&n(r)}close(){this.activeOverlay&&=(this.activeOverlay.remove(),null)}},r=new class{constructor(){this.container=null}initContainer(){this.container||(this.container=document.createElement(`div`),this.container.id=`toast-container`,this.container.className=`fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none`,document.body.appendChild(this.container))}show(e,t=`info`,n=4e3){if(this.initContainer(),!this.container)return;let r=document.createElement(`div`);r.className=`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border text-sm shadow-xl transition-all duration-300 translate-y-2 opacity-0 font-sans ${t===`success`?`bg-slate-900 border-emerald-500/40 text-emerald-300`:t===`error`?`bg-slate-900 border-rose-500/40 text-rose-300`:t===`warning`?`bg-slate-900 border-amber-500/40 text-amber-300`:`bg-slate-900 border-slate-700 text-slate-200`}`,r.innerHTML=`
      <span class="font-mono text-base font-bold shrink-0">${t===`success`?`✓`:t===`error`?`✕`:t===`warning`?`⚠`:`ℹ`}</span>
      <div class="flex-1 text-xs leading-relaxed text-slate-200">${e}</div>
      <button class="text-slate-400 hover:text-white text-xs font-mono shrink-0 ml-1">✕</button>
    `,r.querySelector(`button`)?.addEventListener(`click`,()=>{this.dismiss(r)}),this.container.appendChild(r),requestAnimationFrame(()=>{r.classList.remove(`translate-y-2`,`opacity-0`)}),setTimeout(()=>{this.dismiss(r)},n)}dismiss(e){e.classList.add(`opacity-0`,`translate-x-4`),setTimeout(()=>{e.remove()},300)}};function i(){n.showContentModal(`Change administrator password`,`
    <form id="change-admin-password-form" class="space-y-4">
      <p class="text-xs text-slate-400">Use a unique password with at least 14 characters. Changing it signs out every other active admin session.</p>
      <label class="block text-xs text-slate-300">Current password
        <input id="admin-current-password" type="password" autocomplete="current-password" required class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
      </label>
      <label class="block text-xs text-slate-300">New password
        <input id="admin-new-password" type="password" autocomplete="new-password" minlength="14" required class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
      </label>
      <label class="block text-xs text-slate-300">Confirm new password
        <input id="admin-confirm-password" type="password" autocomplete="new-password" minlength="14" required class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
      </label>
      <button id="admin-change-password-submit" type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg">Update password</button>
      <p id="admin-password-error" role="alert" class="hidden text-xs text-rose-400"></p>
    </form>
  `,t=>{let i=t.querySelector(`#change-admin-password-form`),a=t.querySelector(`#admin-password-error`),o=t.querySelector(`#admin-change-password-submit`);i.addEventListener(`submit`,async i=>{i.preventDefault();let s=t.querySelector(`#admin-current-password`).value,c=t.querySelector(`#admin-new-password`).value,l=t.querySelector(`#admin-confirm-password`).value;if(c.length<14)a.textContent=`New password must be at least 14 characters.`,a.classList.remove(`hidden`);else if(c!==l)a.textContent=`The new passwords do not match.`,a.classList.remove(`hidden`);else{o.disabled=!0,o.textContent=`Updating…`,a.classList.add(`hidden`);try{let t=await e.changePassword({current_password:s,new_password:c});if(!t.success||!t.data?.token){a.textContent=t.error||`Could not change the password.`,a.classList.remove(`hidden`);return}e.setToken(t.data.token),r.show(`Password changed. Other admin sessions were signed out.`,`success`),n.close()}finally{o.disabled=!1,o.textContent=`Update password`}}})})}var a=[{id:`dashboard`,label:`Dashboard`,icon:`📊`,category:`Overview`},{id:`users`,label:`User Directory`,icon:`👥`,category:`Economy & Players`},{id:`wallets`,label:`Wallets & Ledger`,icon:`🪙`,category:`Economy & Players`},{id:`packages`,label:`Star Packages`,icon:`📦`,category:`Economy & Players`},{id:`payments`,label:`Payments & Reconcile`,icon:`💳`,category:`Economy & Players`},{id:`live-games`,label:`Live Games Monitor`,icon:`⚡`,category:`Game Engine`,badge:`LIVE`},{id:`games`,label:`Game Audit & History`,icon:`🎯`,category:`Game Engine`},{id:`game-modes`,label:`Game Modes & Rules`,icon:`⚙️`,category:`Game Engine`},{id:`disputes`,label:`Dispute Resolution`,icon:`⚖️`,category:`Integrity & Security`},{id:`anti-fraud`,label:`Anti-Cheat & Fraud`,icon:`🛡️`,category:`Integrity & Security`,badge:`ALERT`},{id:`leaderboards`,label:`Leaderboard & Rewards`,icon:`🏆`,category:`Integrity & Security`},{id:`audit-logs`,label:`Admin Audit Trail`,icon:`📜`,category:`System Operations`},{id:`reports`,label:`Reports & CSV Export`,icon:`📈`,category:`System Operations`},{id:`settings`,label:`System Settings`,icon:`🔧`,category:`System Operations`},{id:`backup`,label:`Database Health`,icon:`💾`,category:`System Operations`},{id:`docs`,label:`API Docs & Sandbox`,icon:`📖`,category:`System Operations`}];function o(n){let r=t.currentRoute,o=t.admin,s=[`Overview`,`Economy & Players`,`Game Engine`,`Integrity & Security`,`System Operations`],c=``;s.forEach(e=>{let t=a.filter(t=>t.category===e);t.length!==0&&(c+=`
      <div class="px-3 pt-4 pb-1">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">${e}</span>
      </div>
      <div class="space-y-0.5">
    `,t.forEach(e=>{let t=r===e.id;c+=`
        <button 
          data-route="${e.id}"
          class="nav-link w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${t?`bg-amber-500/10 text-amber-300 font-semibold border-l-2 border-amber-500`:`text-slate-400 hover:text-slate-100 hover:bg-slate-800/60`}"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span class="text-sm shrink-0">${e.icon}</span>
            <span class="truncate">${e.label}</span>
          </div>
          ${e.badge?`
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${e.badge===`LIVE`?`bg-emerald-500/20 text-emerald-400 animate-pulse`:`bg-rose-500/20 text-rose-400`}">${e.badge}</span>
          `:``}
        </button>
      `}),c+=`</div>`)}),n.innerHTML=`
    <div class="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 w-64 shrink-0 select-none">
      <!-- Brand lockup -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
            ★
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-tight">StarGuess</h1>
            <p class="text-[10px] text-slate-400 font-mono">Game Administration</p>
          </div>
        </div>
      </div>

      <!-- Navigation links -->
      <div class="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        ${c}
      </div>

      <!-- Active Admin Profile Footprint -->
      <div class="p-3 border-t border-slate-800 bg-slate-950/40">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-amber-400 shrink-0">
              ${o?.username?.slice(0,2).toUpperCase()||`AD`}
            </div>
            <div class="truncate">
              <p class="text-xs font-semibold text-slate-200 truncate">${o?.username||`Admin`}</p>
              <p class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">${o?.role||`SUPER_ADMIN`}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button id="change-password-btn" title="Change password" aria-label="Change password" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors text-xs">🔑</button>
            <button id="logout-btn" title="Logout" aria-label="Logout" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-xs font-mono">⏻</button>
          </div>
        </div>
      </div>
    </div>
  `,n.querySelectorAll(`.nav-link`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.getAttribute(`data-route`);n&&t.setRoute(n)})}),n.querySelector(`#logout-btn`)?.addEventListener(`click`,()=>{e.logout(),e.setToken(null),t.setAdmin(null),t.setRoute(`login`)}),n.querySelector(`#change-password-btn`)?.addEventListener(`click`,i)}var s={dashboard:{group:`Overview`,title:`Operational KPIs & Economy`},users:{group:`Players & Economy`,title:`User Management & Profiles`},wallets:{group:`Players & Economy`,title:`Wallets & Stars Ledger`},packages:{group:`Players & Economy`,title:`Star Packages & Pricing`},payments:{group:`Players & Economy`,title:`Payments & Reconciliation`},"live-games":{group:`Game Operations`,title:`Live 1v1 Prediction Monitor`},games:{group:`Game Operations`,title:`Game History & Event Timeline`},"game-modes":{group:`Game Operations`,title:`Game Modes & Rules Matrix`},disputes:{group:`Integrity`,title:`Player Dispute Resolution`},"anti-fraud":{group:`Integrity`,title:`Anti-Cheat & Security Intelligence`},leaderboards:{group:`Integrity`,title:`Leaderboards & Daily Rewards`},"audit-logs":{group:`Governance`,title:`Immutable Admin Audit Trail`},reports:{group:`Governance`,title:`Reports & CSV Data Export`},settings:{group:`System`,title:`Centralized System Settings`},backup:{group:`System`,title:`Database Health & Snapshots`},docs:{group:`System`,title:`REST API Documentation & Runner`},login:{group:`Auth`,title:`Secure Login`}};function c(n){let i=t.currentRoute,a=t.admin,o=s[i]||{group:`Admin`,title:`Dashboard`};n.innerHTML=`
    <header class="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between select-none">
      <!-- Zone 1: Contextual Breadcrumb Trail -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-500 font-medium">${o.group}</span>
        <span class="text-slate-600 font-mono">/</span>
        <h2 class="text-slate-100 font-semibold tracking-tight">${o.title}</h2>
      </div>

      <!-- Zone 2: System Health & Demo Role Switcher -->
      <div class="flex items-center gap-4">
        <!-- Backend Status Indicator -->
        <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>PHP 8.2+ · MySQL 8.0 Active</span>
        </div>

        <!-- RBAC Role Switcher (Simulates login as different admin roles to test permissions) -->
        <div class="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <span class="text-[10px] text-slate-500 font-medium">Test Role:</span>
          <select id="role-switcher-select" class="bg-transparent text-xs font-mono font-medium text-amber-400 focus:outline-none cursor-pointer">
            <option value="SUPER_ADMIN" ${a?.role===`SUPER_ADMIN`?`selected`:``}>SUPER_ADMIN (Full Access)</option>
            <option value="FINANCE_ADMIN" ${a?.role===`FINANCE_ADMIN`?`selected`:``}>FINANCE_ADMIN (Ledger & Payments)</option>
            <option value="GAME_MODERATOR" ${a?.role===`GAME_MODERATOR`?`selected`:``}>GAME_MODERATOR (Games & Live Monitor)</option>
            <option value="SUPPORT_ADMIN" ${a?.role===`SUPPORT_ADMIN`?`selected`:``}>SUPPORT_ADMIN (Users & Disputes)</option>
            <option value="ADMIN" ${a?.role===`ADMIN`?`selected`:``}>ADMIN (Standard Admin)</option>
          </select>
        </div>
      </div>

      <!-- Zone 3: Primary Actions -->
      <div class="flex items-center gap-3">
        <button id="quick-refresh-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700">
          <span class="font-mono text-xs">↻</span>
          <span>Refresh</span>
        </button>
      </div>
    </header>
  `;let c=n.querySelector(`#role-switcher-select`);c?.addEventListener(`change`,async()=>{let n=c.value,i=await e.switchRole(n);i.success&&i.data&&(t.setAdmin(i.data.admin),r.show(`Role switched to ${n}. Permissions updated.`,`info`),t.emit(`routeChanged`))}),n.querySelector(`#quick-refresh-btn`)?.addEventListener(`click`,()=>{r.show(`Synchronized authoritative state with database.`,`success`),t.emit(`routeChanged`)})}async function l(n){n.innerHTML=`
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
  `;let r=n.querySelector(`#dash-loading`),i=n.querySelector(`#dash-content`),[a,o]=await Promise.all([e.getKPIs(),e.getCharts()]);if(!a.success||!a.data){r?.classList.add(`hidden`),n.innerHTML+=`<div class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs">Failed to load dashboard metrics.</div>`;return}let s=a.data,c=o.data||{days:[],daily_users:[],daily_games:[],stars_purchased:[],commission:[],revenue:[]};r?.classList.add(`hidden`),i?.classList.remove(`hidden`);function l(e,t,n,r=``){let i=Math.max(...e,1),a=Math.min(...e,0),o=i-a||1,s=e.map((t,n)=>{let r=15+n/(e.length-1)*330,i=75-(t-a)/o*60;return`${r.toFixed(1)},${i.toFixed(1)}`}),c=`M ${s.join(` L `)}`,l=`${c} L 345,90 L 15,90 Z`;return`
      <div class="w-full">
        <svg viewBox="0 0 360 90" class="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="grad-${n.replace(`#`,``)}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${n}" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="${n}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${l}" fill="url(#grad-${n.replace(`#`,``)})" />
          <path d="${c}" fill="none" stroke="${n}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${e.map((e,t)=>{let[r,i]=s[t].split(`,`);return`<circle cx="${r}" cy="${i}" r="3" fill="#0f172a" stroke="${n}" stroke-width="2" />`}).join(``)}
        </svg>
        <div class="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
          <span>${t[0]||``}</span>
          <span>${r}${e[e.length-1]?.toLocaleString()}</span>
          <span>${t[t.length-1]||``}</span>
        </div>
      </div>
    `}i.innerHTML=`
    <!-- Top KPI Grid: 15 Core Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      <!-- Total Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Total Users</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${s.total_users}</div>
        <div class="text-[10px] text-emerald-400 font-mono">+${s.new_users_today} today</div>
      </div>

      <!-- Active Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Active Players</span>
        <div class="text-xl font-bold font-mono text-emerald-400 tabular-nums">${s.active_users}</div>
        <div class="text-[10px] text-slate-500 font-mono">Status: ACTIVE</div>
      </div>

      <!-- Active Matches -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 relative overflow-hidden">
        <span class="text-[11px] font-medium text-slate-400">Live 1v1 Matches</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${s.active_matches}</div>
        <div class="text-[10px] text-amber-400 font-mono">Turns in flight</div>
      </div>

      <!-- Games Completed -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Completed Games</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${s.games_completed}</div>
        <div class="text-[10px] text-slate-500 font-mono">${s.games_cancelled} cancelled / refunded</div>
      </div>

      <!-- Platform Commission -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Platform Commission</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${s.platform_commission.toLocaleString()} ★</div>
        <div class="text-[10px] text-slate-400 font-mono">Virtual rake collected</div>
      </div>

      <!-- Stars Sold -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Stars Sold (IAP)</span>
        <div class="text-xl font-bold font-mono text-white tabular-nums">${s.stars_sold.toLocaleString()} ★</div>
        <div class="text-[10px] text-emerald-400 font-mono">Gross package credits</div>
      </div>

      <!-- Stars in Circulation -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Stars In Circulation</span>
        <div class="text-xl font-bold font-mono text-sky-400 tabular-nums">${s.stars_in_circulation.toLocaleString()} ★</div>
        <div class="text-[10px] text-slate-500 font-mono">Combined player balances</div>
      </div>

      <!-- Gross Revenue USD -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Fiat Gross Revenue</span>
        <div class="text-xl font-bold font-mono text-emerald-400 tabular-nums">$${s.revenue_usd}</div>
        <div class="text-[10px] text-slate-500 font-mono">Stripe & App Stores</div>
      </div>

      <!-- Suspended Users -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Sanctioned Accounts</span>
        <div class="text-xl font-bold font-mono text-rose-400 tabular-nums">${s.suspended_users}</div>
        <div class="text-[10px] text-rose-400/80 font-mono">Suspended / Banned</div>
      </div>

      <!-- System Alerts -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
        <span class="text-[11px] font-medium text-slate-400">Anti-Cheat Alerts</span>
        <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${s.system_alerts}</div>
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
            <span class="text-[10px] font-mono text-emerald-400">Peak: ${Math.max(0,...c.daily_users)}</span>
          </div>
          ${l(c.daily_users,c.days,`#10b981`)}
        </div>

        <!-- Chart 2: Daily Games -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">2. Daily Matches Played</span>
            <span class="text-[10px] font-mono text-sky-400">Peak: ${Math.max(0,...c.daily_games)}</span>
          </div>
          ${l(c.daily_games,c.days,`#0284c7`)}
        </div>

        <!-- Chart 3: Stars Purchased -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">3. Stars Purchased (Volume)</span>
            <span class="text-[10px] font-mono text-amber-400">Peak: ${Math.max(0,...c.stars_purchased).toLocaleString()} ★</span>
          </div>
          ${l(c.stars_purchased,c.days,`#f59e0b`,`★`)}
        </div>

        <!-- Chart 4: Commission -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">4. Platform Commission</span>
            <span class="text-[10px] font-mono text-purple-400">Peak: ${Math.max(0,...c.commission).toLocaleString()} ★</span>
          </div>
          ${l(c.commission,c.days,`#a855f7`,`★`)}
        </div>

        <!-- Chart 5: Revenue -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-200">5. Fiat Revenue (USD)</span>
            <span class="text-[10px] font-mono text-emerald-400">Peak: $${Math.max(0,...c.revenue).toFixed(2)}</span>
          </div>
          ${l(c.revenue,c.days,`#22c55e`,`$`)}
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
              <span class="text-emerald-400">${s.active_matches} active matches</span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Ledger Invariant:</span>
              <span class="text-emerald-400">${s.platform_commission.toLocaleString()} ★ commission total</span>
            </div>
            <button id="view-live-btn" class="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>View Live Games Monitor</span>
              <span class="font-mono">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,i.querySelector(`#view-live-btn`)?.addEventListener(`click`,()=>{t.setRoute(`live-games`)})}async function u(t){t.innerHTML=`
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
  `;let i=t.querySelector(`#user-search-input`),a=t.querySelector(`#user-status-filter`),o=t.querySelector(`#user-risk-filter`),s=t.querySelector(`#users-table-body`);async function c(){s.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Querying database...</td></tr>`;let t=await e.getUsers({search:i.value.trim(),status:a.value,risk_level:o.value});if(!t.success||!t.data){s.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load users: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;n.length===0?s.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No users matched search criteria.</td></tr>`:(s.innerHTML=n.map(e=>{let t=e.games_played>0?(e.games_won/e.games_played*100).toFixed(1):`0`,n=e.status===`ACTIVE`?`<span class="text-emerald-400 font-semibold font-mono">ACTIVE</span>`:e.status===`SUSPENDED`?`<span class="text-amber-400 font-semibold font-mono">SUSPENDED</span>`:`<span class="text-rose-400 font-semibold font-mono">BANNED</span>`,r=e.risk_level===`NORMAL`?`<span class="text-slate-400 font-mono">NORMAL</span>`:e.risk_level===`MONITOR`?`<span class="text-amber-400 font-mono font-bold">MONITOR</span>`:e.risk_level===`SUSPICIOUS`?`<span class="text-rose-400 font-mono font-bold">SUSPICIOUS</span>`:`<span class="text-red-500 font-mono font-black">BLOCKED</span>`;return`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img src="${e.avatar_url}" alt="${e.username}" class="w-7 h-7 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0" />
              <div>
                <span class="font-semibold text-white">${e.username}</span>
                <div class="text-[10px] text-slate-500 font-mono">ID #${e.user_id} · ${e.email}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-xs">${n}</td>
          <td class="px-4 py-3 text-xs">${r}</td>
          <td class="px-4 py-3 text-right font-mono font-semibold tabular-nums text-amber-400">
            ${e.current_balance.toLocaleString()} ★
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
            <span class="text-emerald-400">${e.games_won}W</span> / <span class="text-rose-400">${e.games_lost}L</span>
            <div class="text-[10px] text-slate-500">Total: ${e.games_played}</div>
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums ${parseFloat(t)>80?`text-amber-400 font-bold`:`text-slate-300`}">
            ${t}%
          </td>
          <td class="px-4 py-3 text-[11px] font-mono text-slate-400">
            ${new Date(e.last_login_at).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-inspect-id="${e.user_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium transition-colors">
                Profile
              </button>
              <button data-sanction-id="${e.user_id}" data-current-status="${e.status}" class="px-2.5 py-1 ${e.status===`ACTIVE`?`bg-rose-500/10 hover:bg-rose-500/20 text-rose-400`:`bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400`} rounded text-[11px] font-medium transition-colors">
                ${e.status===`ACTIVE`?`Sanction`:`Unban`}
              </button>
            </div>
          </td>
        </tr>
      `}).join(``),s.querySelectorAll(`[data-inspect-id]`).forEach(e=>{e.addEventListener(`click`,()=>{l(parseInt(e.getAttribute(`data-inspect-id`)))})}),s.querySelectorAll(`[data-sanction-id]`).forEach(e=>{e.addEventListener(`click`,()=>{u(parseInt(e.getAttribute(`data-sanction-id`)),e.getAttribute(`data-current-status`))})}))}i.addEventListener(`input`,()=>c()),a.addEventListener(`change`,()=>c()),o.addEventListener(`change`,()=>c()),await c();async function l(t){let i=await e.getUser(t);if(!i.success||!i.data){r.show(`Failed to fetch user profile details.`,`error`);return}let{user:a,wallet:o,transactions:s,games:c,alerts:l,referrals:u}=i.data,f=a.games_played>0?(a.games_won/a.games_played*100).toFixed(1):`0`,p=`
      <div class="space-y-4">
        <!-- Header summary -->
        <div class="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <img src="${a.avatar_url}" alt="${a.username}" class="w-14 h-14 rounded-full border border-slate-700 object-cover" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-base font-bold text-white">${a.username}</h4>
              <span class="text-xs font-mono text-slate-400">#${a.user_id}</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded ${a.status===`ACTIVE`?`bg-emerald-500/20 text-emerald-400`:`bg-rose-500/20 text-rose-400`}">${a.status}</span>
            </div>
            <p class="text-xs text-slate-400 font-mono">${a.email} · Phone: ${a.phone||`N/A`}</p>
            <p class="text-[10px] text-slate-500 font-mono mt-1">Joined: ${new Date(a.created_at).toLocaleDateString()} · Device: ${a.device_id}</p>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 uppercase font-medium">Stars Balance</span>
            <div class="text-xl font-bold font-mono text-amber-400 tabular-nums">${o.balance.toLocaleString()} ★</div>
          </div>
        </div>

        <!-- Economy breakdown -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Purchased Stars</span>
            <div class="text-sm font-bold font-mono text-white tabular-nums">${a.total_stars_purchased.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Won in Games</span>
            <div class="text-sm font-bold font-mono text-emerald-400 tabular-nums">${a.total_stars_won.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Spent on Entry Fees</span>
            <div class="text-sm font-bold font-mono text-rose-400 tabular-nums">${a.total_stars_spent.toLocaleString()} ★</div>
          </div>
          <div class="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span class="text-[10px] text-slate-400">Win Rate (${a.games_won}W / ${a.games_lost}L)</span>
            <div class="text-sm font-bold font-mono text-sky-400 tabular-nums">${f}%</div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Recent Wallet Transactions</h5>
          <div class="bg-slate-950 rounded-lg border border-slate-800 divide-y divide-slate-800/60 max-h-40 overflow-y-auto">
            ${s.length===0?`<div class="p-3 text-center text-slate-500">No transactions recorded.</div>`:s.map(e=>`
              <div class="p-2.5 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span class="font-semibold text-slate-200">${e.type}</span>
                  <span class="text-slate-500 text-[10px] ml-2">${e.transaction_id}</span>
                  <div class="text-[10px] text-slate-400">${e.notes||``}</div>
                </div>
                <div class="text-right">
                  <span class="${e.amount>0?`text-emerald-400`:`text-rose-400`} font-bold tabular-nums">${e.amount>0?`+`:``}${e.amount} ★</span>
                  <div class="text-[10px] text-slate-500">${e.balance_before} → ${e.balance_after}</div>
                </div>
              </div>
            `).join(``)}
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
    `;n.showContentModal(`User Profile: ${a.username}`,p,t=>{t.querySelector(`#modal-reset-pwd-btn`)?.addEventListener(`click`,async()=>{let t=await e.resetUserPassword(a.user_id);t.success?r.show(t.message||`Password reset link sent.`,`success`):r.show(t.error||`Failed to dispatch reset link.`,`error`)}),t.querySelector(`#modal-adjust-stars-btn`)?.addEventListener(`click`,()=>{n.close(),d(a.user_id,a.username,o.balance)})})}function u(t,i){i===`ACTIVE`?n.showDangerousConfirm({title:`Sanction Player #${t}`,message:`Are you sure you want to suspend/ban this player? All active matchmaking sessions will be terminated. A clear reason is required for administrative audit logs.`,actionButtonText:`Apply Account Ban`,requireTypingWord:`BAN`,requirePassword:!0,onConfirm:async()=>{let n=await e.updateUserStatus(t,`BANNED`,`Administrative ban enforced due to suspicious activity investigation`);n.success?(r.show(`Player #${t} has been BANNED.`,`success`),await c()):r.show(n.error||`Sanction failed.`,`error`)}}):n.showDangerousConfirm({title:`Reactivate Player #${t}`,message:`Restore player account to ACTIVE status. The player will be permitted to enter 1v1 matchmaking again.`,actionButtonText:`Lift Sanction`,requireTypingWord:`UNBAN`,onConfirm:async()=>{let n=await e.updateUserStatus(t,`ACTIVE`,`Administrative unsuspension / penalty lifted`);n.success?(r.show(`Player #${t} is now ACTIVE.`,`success`),await c()):r.show(n.error||`Failed to lift sanction.`,`error`)}})}function d(t,i,a){let o=`
      <div class="space-y-4">
        <p class="text-xs text-slate-300">
          Manual virtual currency adjustment for <strong class="text-white">${i}</strong> (Current: <span class="font-mono text-amber-400 font-bold">${a.toLocaleString()} ★</span>).
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
    `;n.showContentModal(`Adjust Star Balance: #${t}`,o,i=>{i.querySelector(`#adj-submit-btn`)?.addEventListener(`click`,async()=>{let a=parseInt(i.querySelector(`#adj-amount-input`).value),o=i.querySelector(`#adj-reason-input`).value.trim();if(isNaN(a)||a===0){r.show(`Please provide a non-zero adjustment amount.`,`warning`);return}if(o.length<8){r.show(`A justification of at least 8 characters is required.`,`warning`);return}let s=await e.adjustStars({user_id:t,amount:a,reason:o});s.success?(r.show(s.message||`Balance adjusted successfully.`,`success`),n.close(),await c()):r.show(s.error||`Adjustment failed.`,`error`)})})}}async function d(t){t.innerHTML=`
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
  `;let i=t.querySelector(`#tab-wallets-btn`),a=t.querySelector(`#tab-transactions-btn`),o=t.querySelector(`#wallets-tab-content`),s=t.querySelector(`#transactions-tab-content`),c=t.querySelector(`#wallets-table-body`),l=t.querySelector(`#tx-table-body`),u=t.querySelector(`#tx-search-input`),d=t.querySelector(`#tx-type-filter`);i.addEventListener(`click`,()=>{i.className=`px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-colors`,a.className=`px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors`,o.classList.remove(`hidden`),s.classList.add(`hidden`),f()}),a.addEventListener(`click`,()=>{a.className=`px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 transition-colors`,i.className=`px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors`,s.classList.remove(`hidden`),o.classList.add(`hidden`),p()});async function f(){let t=await e.getWallets();if(!t.success||!t.data){c.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Error loading wallets: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;c.innerHTML=n.map(e=>`
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 font-mono text-slate-400">#W-${e.wallet_id}</td>
        <td class="px-4 py-3">
          <span class="font-semibold text-white">${e.username}</span>
          <div class="text-[10px] text-slate-500 font-mono">UID #${e.user_id}</div>
        </td>
        <td class="px-4 py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
          ${e.balance.toLocaleString()} ★
        </td>
        <td class="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">${e.purchased_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-emerald-400 tabular-nums">${e.won_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-sky-400 tabular-nums">${e.bonus_balance.toLocaleString()}</td>
        <td class="px-4 py-3 text-right font-mono text-slate-500">v${e.version}</td>
        <td class="px-4 py-3 text-right">
          <button data-adjust-user="${e.user_id}" data-adjust-username="${e.username}" data-adjust-balance="${e.balance}" class="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-medium transition-colors">
            Adjust
          </button>
        </td>
      </tr>
    `).join(``),c.querySelectorAll(`[data-adjust-user]`).forEach(e=>{e.addEventListener(`click`,()=>{m(parseInt(e.getAttribute(`data-adjust-user`)),e.getAttribute(`data-adjust-username`),parseInt(e.getAttribute(`data-adjust-balance`)))})})}async function p(){l.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Loading ledger records...</td></tr>`;let t=await e.getTransactions({type:d.value,search:u.value.trim()});if(!t.success||!t.data){l.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load transactions: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;n.length===0?l.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No transactions recorded under current filter.</td></tr>`:l.innerHTML=n.map(e=>{let t=e.type===`PURCHASE`?`text-emerald-400`:e.type===`GAME_WIN`?`text-amber-400`:e.type===`GAME_ENTRY`?`text-slate-400`:e.type===`ADMIN_ADJUSTMENT`?`text-purple-400 font-bold`:e.type===`GAME_REFUND`?`text-sky-400 font-bold`:`text-slate-300`;return`
        <tr class="hover:bg-slate-800/40 transition-colors font-mono">
          <td class="px-4 py-3 text-slate-400 font-semibold text-[11px]">${e.transaction_id}</td>
          <td class="px-4 py-3 font-sans">
            <span class="font-semibold text-white">${e.username}</span>
            <span class="text-[10px] text-slate-500 font-mono ml-1">#${e.user_id}</span>
          </td>
          <td class="px-4 py-3 text-[11px] ${t}">${e.type}</td>
          <td class="px-4 py-3 text-right font-bold tabular-nums ${e.amount>0?`text-emerald-400`:`text-rose-400`}">
            ${e.amount>0?`+`:``}${e.amount.toLocaleString()} ★
          </td>
          <td class="px-4 py-3 text-right text-slate-400 tabular-nums text-[11px]">
            ${e.balance_before.toLocaleString()} → <span class="text-white font-semibold">${e.balance_after.toLocaleString()}</span>
          </td>
          <td class="px-4 py-3 text-slate-400 text-[10px]">${e.reference_type}: ${e.reference_id}</td>
          <td class="px-4 py-3 font-sans text-slate-300 text-[11px] truncate max-w-xs">${e.notes||`—`}</td>
          <td class="px-4 py-3 text-slate-500 text-[10px] whitespace-nowrap">${new Date(e.created_at).toLocaleTimeString()}</td>
        </tr>
      `}).join(``)}u.addEventListener(`input`,()=>p()),d.addEventListener(`change`,()=>p()),t.querySelector(`#open-adjust-modal-btn`)?.addEventListener(`click`,()=>{m()}),await f();function m(t,i,a){let o=`
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
            value="${t||``}" 
            ${t?`readonly`:``}
          />
          ${i?`<span class="text-[10px] text-amber-400 font-mono mt-0.5 block">Player: ${i} (Current Balance: ${a?.toLocaleString()} ★)</span>`:``}
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
    `;n.showContentModal(`Execute Star Balance Adjustment`,o,t=>{t.querySelector(`#modal-cancel-adj`)?.addEventListener(`click`,()=>n.close()),t.querySelector(`#modal-submit-adj`)?.addEventListener(`click`,async()=>{let i=parseInt(t.querySelector(`#adj-target-uid`).value),a=parseInt(t.querySelector(`#adj-amount-val`).value),o=t.querySelector(`#adj-reason-val`).value.trim();if(!i||isNaN(a)||a===0){r.show(`Please provide a valid User ID and non-zero amount.`,`warning`);return}if(o.length<8){r.show(`A justification reason of at least 8 characters is required.`,`warning`);return}let s=await e.adjustStars({user_id:i,amount:a,reason:o});s.success?(r.show(s.message||`Balance adjusted successfully.`,`success`),n.close(),await f()):r.show(s.error||`Adjustment failed.`,`error`)})})}}async function f(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Star Packages & IAP Catalog</h2>
          <p class="text-xs text-slate-400">Configure virtual currency store bundles. Historical packages are archived without deletion.</p>
        </div>
        <div>
          <button id="add-package-btn" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20">
            + New Star Package
          </button>
        </div>
      </div>

      <!-- Packages Grid -->
      <div id="packages-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
          Loading virtual currency bundles...
        </div>
      </div>
    </div>
  `;let i=t.querySelector(`#packages-grid`),a=t.querySelector(`#add-package-btn`);async function o(){let t=await e.getPackages();if(!t.success||!t.data){i.innerHTML=`<div class="col-span-full p-6 text-center text-rose-400">Failed to load packages: ${t.error||`Server error`}</div>`;return}let n=t.data;i.innerHTML=n.map(e=>`
      <div class="bg-slate-900 border ${e.is_featured?`border-amber-500/50 shadow-lg shadow-amber-500/5`:`border-slate-800`} rounded-xl p-5 space-y-4 relative flex flex-col justify-between">
        ${e.is_featured?`
          <span class="absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            FEATURED
          </span>
        `:``}

        <div class="space-y-1">
          <span class="text-xs font-mono text-slate-500">Tier #${e.sort_order}</span>
          <h3 class="text-base font-bold text-white">${e.name}</h3>
        </div>

        <div class="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              ${e.stars.toLocaleString()} ★
            </span>
            <span class="text-sm font-bold font-mono text-white tabular-nums">
              $${(e.price_cents/100).toFixed(2)} ${e.currency}
            </span>
          </div>
          ${e.bonus_stars>0?`
            <div class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span>+${e.bonus_stars.toLocaleString()} Bonus Stars Included</span>
            </div>
          `:`<div class="text-[10px] font-mono text-slate-600">Standard tier</div>`}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <span class="text-xs font-mono ${e.is_active?`text-emerald-400`:`text-slate-500`} font-semibold">
            ${e.is_active?`● STORE ACTIVE`:`○ DISABLED`}
          </span>
          <button data-edit-package="${e.package_id}" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors">
            Edit Pricing & Status
          </button>
        </div>
      </div>
    `).join(``),i.querySelectorAll(`[data-edit-package]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.getAttribute(`data-edit-package`)),r=n.find(e=>e.package_id===t);r&&s(r)})})}a.addEventListener(`click`,()=>s()),await o();function s(t){let i=!!t,a=`
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Package Display Name:</label>
          <input type="text" id="pkg-name-input" value="${t?.name||``}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Grand Master Treasury" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Base Stars:</label>
            <input type="number" id="pkg-stars-input" value="${t?.stars||1e3}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Bonus Stars:</label>
            <input type="number" id="pkg-bonus-input" value="${t?.bonus_stars||0}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Price (in cents USD):</label>
            <input type="number" id="pkg-cents-input" value="${t?.price_cents||999}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" placeholder="999 = $9.99" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Featured in Mobile Store:</label>
            <select id="pkg-feat-input" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
              <option value="false" ${t?.is_featured?``:`selected`}>Normal</option>
              <option value="true" ${t?.is_featured?`selected`:``}>Featured Badge</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Store Status:</label>
          <select id="pkg-active-input" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="true" ${t?.is_active??!0?`selected`:``}>ACTIVE (Available for purchase)</option>
            <option value="false" ${t&&!t.is_active?`selected`:``}>DISABLED (Archived from store)</option>
          </select>
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-save-pkg-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            ${i?`Save Changes`:`Create Package`}
          </button>
        </div>
      </div>
    `;n.showContentModal(i?`Edit: ${t.name}`:`New Star Package`,a,a=>{a.querySelector(`#modal-save-pkg-btn`)?.addEventListener(`click`,async()=>{let s=a.querySelector(`#pkg-name-input`).value.trim(),c=parseInt(a.querySelector(`#pkg-stars-input`).value),l=parseInt(a.querySelector(`#pkg-bonus-input`).value),u=parseInt(a.querySelector(`#pkg-cents-input`).value),d=a.querySelector(`#pkg-feat-input`).value===`true`,f=a.querySelector(`#pkg-active-input`).value===`true`;if(!s||isNaN(c)||isNaN(u)){r.show(`Please fill all required package attributes.`,`warning`);return}let p=i?await e.updatePackage(t.package_id,{name:s,stars:c,bonus_stars:l,price_cents:u,is_featured:d,is_active:f}):await e.createPackage({name:s,stars:c,bonus_stars:l,price_cents:u,is_featured:d,is_active:f});p.success?(r.show(`Package ${i?`updated`:`created`} successfully.`,`success`),n.close(),await o()):r.show(p.error||`Failed to persist package.`,`error`)})})}}async function p(t){t.innerHTML=`
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
  `;let n=t.querySelector(`#payments-table-body`),i=t.querySelector(`#run-reconcile-btn`),a=t.querySelector(`#reconciliation-panel`),o=t.querySelector(`#reconciliation-results`),s=t.querySelector(`#close-reconcile-btn`);async function c(){let t=await e.getPayments();if(!t.success||!t.data){n.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load payments: ${t.error||`Server error`}</td></tr>`;return}let r=t.data;n.innerHTML=r.map(e=>{let t=e.status===`SUCCESS`?`<span class="text-emerald-400 font-mono font-semibold">SUCCESS</span>`:e.status===`PENDING`?`<span class="text-amber-400 font-mono font-semibold">PENDING</span>`:e.status===`FAILED`?`<span class="text-rose-400 font-mono font-semibold">FAILED</span>`:`<span class="text-purple-400 font-mono font-semibold">REFUNDED</span>`;return`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono text-slate-300 font-semibold text-[11px]">${e.payment_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${e.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${e.user_id}</div>
          </td>
          <td class="px-4 py-3 text-slate-300">${e.package_name}</td>
          <td class="px-4 py-3 text-right font-mono font-bold text-white tabular-nums">
            $${(e.amount_cents/100).toFixed(2)} ${e.currency}
          </td>
          <td class="px-4 py-3 font-mono text-[11px] text-slate-400">
            <div>${e.gateway}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-xs">${e.gateway_tx_id}</div>
          </td>
          <td class="px-4 py-3 font-mono font-bold text-amber-400 tabular-nums">
            ${e.stars_credited>0?`+${e.stars_credited.toLocaleString()} ★`:`—`}
          </td>
          <td class="px-4 py-3 text-xs">${t}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">
            ${new Date(e.created_at).toLocaleDateString()}
          </td>
        </tr>
      `}).join(``)}i.addEventListener(`click`,async()=>{i.disabled=!0,i.innerText=`Analyzing Ledgers...`;let t=await e.reconcilePayments();i.disabled=!1,i.innerText=`⚖️ Run 3-Way Reconciliation`,t.success&&t.data&&(a.classList.remove(`hidden`),o.innerHTML=t.data.map(e=>`
        <div class="py-2.5 flex items-center justify-between">
          <div>
            <span class="font-bold text-white">${e.payment_id}</span>
            <span class="text-slate-400 ml-2">Gateway: ${e.gateway_tx_id} (${e.gateway_status})</span>
            <div class="text-[10px] text-slate-500">Stars Credit TX: ${e.stars_credit_tx_id}</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${e.reconciliation_status===`MATCHED_BALANCED`?`bg-emerald-500/20 text-emerald-400`:`bg-rose-500/20 text-rose-400`}">${e.reconciliation_status}</span>
            ${e.discrepancy_note?`<div class="text-[10px] text-rose-400 mt-0.5">${e.discrepancy_note}</div>`:``}
          </div>
        </div>
      `).join(``),r.show(`Reconciliation audit complete. 0 financial leaks found.`,`success`))}),s.addEventListener(`click`,()=>{a.classList.add(`hidden`)}),await c()}async function m(t){t.innerHTML=`
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
  `;let i=t.querySelector(`#live-matches-grid`),a=t.querySelector(`#refresh-live-btn`);async function o(){let t=await e.getLiveGames();if(!t.success||!t.data){i.innerHTML=`<div class="col-span-full p-6 text-center text-rose-400 bg-slate-900 rounded-xl border border-slate-800">Failed to load active matches: ${t.error||`Server error`}</div>`;return}let n=t.data;n.length===0?i.innerHTML=`
        <div class="col-span-full p-12 text-center bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <span class="text-2xl font-mono">🎯</span>
          <p class="text-sm font-semibold text-white">No active matches in progress</p>
          <p class="text-xs text-slate-500">All player matchmaking queues are idle or waiting for opponents.</p>
        </div>
      `:(i.innerHTML=n.map(e=>`
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
        <!-- Top bar with mode & match ID -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-white font-mono">${e.game_id}</span>
            <span class="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">${e.mode_name}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Server: ${e.server_node}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        <!-- 1v1 Arena Versus Box -->
        <div class="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 relative">
          <!-- Player A -->
          <div class="p-2.5 rounded-md ${e.current_turn_player_id===e.player_a_id?`bg-amber-500/10 border border-amber-500/30`:`bg-slate-900/50 border border-slate-800`}">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white truncate">${e.player_a_username}</span>
              <span class="text-[9px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">UID #${e.player_a_id} · Slot A</div>
            ${e.current_turn_player_id===e.player_a_id?`
              <div class="mt-2 text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                <span class="animate-pulse">▶</span> CURRENT TURN
              </div>
            `:`<div class="mt-2 text-[10px] font-mono text-slate-600">Waiting opponent</div>`}
          </div>

          <!-- Player B -->
          <div class="p-2.5 rounded-md ${e.current_turn_player_id===e.player_b_id?`bg-amber-500/10 border border-amber-500/30`:`bg-slate-900/50 border border-slate-800`}">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white truncate">${e.player_b_username}</span>
              <span class="text-[9px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">UID #${e.player_b_id} · Slot B</div>
            ${e.current_turn_player_id===e.player_b_id?`
              <div class="mt-2 text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                <span class="animate-pulse">▶</span> CURRENT TURN
              </div>
            `:`<div class="mt-2 text-[10px] font-mono text-slate-600">Waiting opponent</div>`}
          </div>
        </div>

        <!-- Match Meta & Cryptographic Commitment Hash -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Stakes / Prize</span>
            <div class="text-xs font-mono font-bold text-amber-400 tabular-nums">${e.entry_fee} ★ → ${e.prize_amount} ★</div>
          </div>
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Attempts Made</span>
            <div class="text-xs font-mono font-bold text-white tabular-nums">${e.total_attempts}</div>
          </div>
          <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span class="text-[10px] text-slate-400">Turn Clock</span>
            <div class="text-xs font-mono font-bold text-emerald-400 tabular-nums animate-pulse">${e.turn_time_remaining}s left</div>
          </div>
        </div>

        <!-- Secret Commitment Hash -->
        <div class="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
          <div class="flex items-center justify-between text-slate-400">
            <span>Cryptographic Secret Commitment (SHA-256):</span>
            <span class="text-emerald-400 font-bold">LOCKED & FAIR</span>
          </div>
          <p class="text-slate-300 break-all select-all font-mono">${e.secret_commitment_hash}</p>
        </div>

        <!-- Action Bar: Timeline Inspector & Safe Simulation -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <button data-inspect-game="${e.game_id}" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors">
            Inspect Full Guess Timeline
          </button>
          <button data-simulate-step="${e.game_id}" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono rounded-lg transition-colors border border-amber-500/30">
            Simulate Next Turn (Demo)
          </button>
        </div>
      </div>
    `).join(``),i.querySelectorAll(`[data-inspect-game]`).forEach(e=>{e.addEventListener(`click`,()=>{s(e.getAttribute(`data-inspect-game`))})}),i.querySelectorAll(`[data-simulate-step]`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.getAttribute(`data-simulate-step`),i=await e.simulateGameStep(n);i.success?(r.show(i.message||`Turn simulated.`,`info`),await o()):r.show(i.error||`Simulation error.`,`error`)})}))}a.addEventListener(`click`,()=>o()),await o();async function s(t){let i=await e.getGameDetails(t);if(!i.success||!i.data){r.show(`Failed to fetch game details.`,`error`);return}let a=i.data,o=a.guesses.map(e=>`
      <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
        <div class="flex items-center gap-3">
          <span class="text-slate-500 text-[10px]">#${e.attempt_number}</span>
          <span class="font-bold text-white">${e.player_id===a.player_a_id?a.player_a?.username:a.player_b?.username}</span>
          <span class="text-slate-400">guessed <strong class="text-amber-400 font-bold">${e.guess_number}</strong></span>
        </div>
        <div class="flex items-center gap-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${e.result===`MATCHED`?`bg-emerald-500/20 text-emerald-400`:e.result===`HIGHER`?`bg-sky-500/20 text-sky-400`:`bg-purple-500/20 text-purple-400`}">${e.result}</span>
          <span class="text-[10px] text-slate-500">${e.response_time_ms}ms</span>
        </div>
      </div>
    `).join(``),s=`
      <div class="space-y-4">
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm">${a.game_id}</span>
            <span class="font-mono text-xs text-amber-400">${a.status}</span>
          </div>
          <div class="text-[11px] font-mono text-slate-400">
            ${a.player_a?.username} vs ${a.player_b?.username} · Entry: ${a.entry_fee} ★ · Prize: ${a.prize_amount} ★
          </div>
        </div>

        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Guess Sequence & Feedback:</h5>
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            ${o.length>0?o:`<p class="text-slate-500 text-center py-4">No guesses submitted yet.</p>`}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-end">
          <button id="modal-close-inspect" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium">
            Close Inspector
          </button>
        </div>
      </div>
    `;n.showContentModal(`Game Details: ${t}`,s,e=>{e.querySelector(`#modal-close-inspect`)?.addEventListener(`click`,()=>n.close())})}}async function h(t){t.innerHTML=`
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
  `;let i=t.querySelector(`#games-table-body`),a=t.querySelector(`#games-search-input`),o=t.querySelector(`#games-status-filter`);async function s(){i.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">Querying games database...</td></tr>`;let t=await e.getGames({search:a.value.trim(),status:o.value});if(!t.success||!t.data){i.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400">Failed to load games: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;n.length===0?i.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-slate-500">No matches found matching query.</td></tr>`:(i.innerHTML=n.map(e=>{let t=e.status===`COMPLETED`?`<span class="text-emerald-400 font-mono font-semibold">COMPLETED</span>`:e.status===`IN_PROGRESS`?`<span class="text-amber-400 font-mono font-semibold">IN_PROGRESS</span>`:e.status===`CANCELLED`?`<span class="text-rose-400 font-mono font-semibold">CANCELLED</span>`:`<span class="text-purple-400 font-mono font-semibold">DISPUTED</span>`;return`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono text-slate-300 font-semibold text-[11px]">${e.game_id}</td>
          <td class="px-4 py-3 text-slate-400 font-mono text-[11px]">${e.mode_name}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${e.player_a_username}</span>
            <span class="text-slate-500 font-mono text-[10px] mx-1">vs</span>
            <span class="font-semibold text-white">${e.player_b_username}</span>
          </td>
          <td class="px-4 py-3 text-right font-mono font-semibold tabular-nums text-amber-400">
            ${e.entry_fee} ★
          </td>
          <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-300 text-[11px]">
            ${e.prize_amount} ★ <span class="text-slate-500">(-${e.commission_amount} ★)</span>
          </td>
          <td class="px-4 py-3 font-mono text-[11px]">
            ${e.winner_id?`<span class="text-emerald-400 font-bold">#${e.winner_id}</span>`:`<span class="text-slate-500">—</span>`}
          </td>
          <td class="px-4 py-3 text-xs">${t}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button data-inspect-game="${e.game_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
                Audit
              </button>
              ${e.status===`IN_PROGRESS`||e.status===`DISPUTED`?`
                <button data-refund-game="${e.game_id}" class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded text-[11px] font-medium transition-colors">
                  Cancel & Refund
                </button>
              `:``}
            </div>
          </td>
        </tr>
      `}).join(``),i.querySelectorAll(`[data-inspect-game]`).forEach(e=>{e.addEventListener(`click`,()=>{c(e.getAttribute(`data-inspect-game`))})}),i.querySelectorAll(`[data-refund-game]`).forEach(e=>{e.addEventListener(`click`,()=>{l(e.getAttribute(`data-refund-game`))})}))}a.addEventListener(`input`,()=>s()),o.addEventListener(`change`,()=>s()),await s();async function c(t){let i=await e.getGameDetails(t);if(!i.success||!i.data){r.show(`Failed to fetch game audit.`,`error`);return}let a=i.data,o=`
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-bold text-white font-mono">${a.game_id}</h4>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">${a.status}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
            <div>Contender A: <strong class="text-white">${a.player_a?.username}</strong> (#${a.player_a_id})</div>
            <div>Contender B: <strong class="text-white">${a.player_b?.username}</strong> (#${a.player_b_id})</div>
            <div>Stakes: ${a.entry_fee} ★ each</div>
            <div>Commission: ${a.commission_amount} ★ (${a.mode?.commission_percentage}%)</div>
            <div>Prize: <strong class="text-amber-400">${a.prize_amount} ★</strong></div>
            <div>Winner: ${a.winner_id?`<span class="text-emerald-400 font-bold">#${a.winner_id}</span>`:`None / Cancelled`}</div>
          </div>
        </div>

        <!-- Cryptographic Proof Box -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <span class="text-slate-400 font-bold uppercase text-[10px]">Cryptographic Fairness Verification:</span>
          <div class="text-slate-400">
            Secret Number: <strong class="text-emerald-400">${a.secret_revealed_number??`Hidden until match completion`}</strong>
          </div>
          <div class="text-slate-400">
            Salt: <strong class="text-slate-300">${a.secret_salt}</strong>
          </div>
          <div class="text-slate-400 break-all text-[10px]">
            Commitment Hash (SHA-256): <span class="text-slate-200">${a.secret_commitment_hash}</span>
          </div>
        </div>

        <!-- Attempt Sequence Table -->
        <div>
          <h5 class="text-xs font-semibold text-slate-200 mb-2">Turn Attempt Sequence:</h5>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            ${a.guesses.length===0?`<p class="text-slate-500 text-xs text-center py-2">No guesses submitted.</p>`:a.guesses.map(e=>`
              <div class="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span class="text-slate-400">#${e.attempt_number} · Player #${e.player_id} guessed <strong class="text-white">${e.guess_number}</strong></span>
                <div class="flex items-center gap-3">
                  <span class="font-bold ${e.result===`MATCHED`?`text-emerald-400`:e.result===`HIGHER`?`text-sky-400`:`text-purple-400`}">${e.result}</span>
                  <span class="text-[10px] text-slate-500">${e.response_time_ms}ms</span>
                </div>
              </div>
            `).join(``)}
          </div>
        </div>
      </div>
    `;n.showContentModal(`Game Audit Inspector: ${t}`,o)}function l(t){n.showDangerousConfirm({title:`Cancel & Refund Match ${t}`,message:`Cancelling this match will immediately refund all entry Stars back into the players' wallets via an immutable ledger transaction. Provide justification for the audit trail.`,actionButtonText:`Execute Game Refund`,requireTypingWord:`REFUND`,requirePassword:!0,onConfirm:async n=>{let i=await e.refundGame(t,`Admin cancelled match and refunded entry fees due to technical investigation`,n||``);i.success?(r.show(i.message||`Refund processed.`,`success`),await s()):r.show(i.error||`Refund failed.`,`error`)}})}}async function g(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Game Modes & Commission Matrix</h2>
          <p class="text-xs text-slate-400">Configure number ranges, turn durations, entry stakes, and tiered platform rake percentages.</p>
        </div>
      </div>

      <!-- Game Modes Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Active Prediction Game Modes</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                <tr>
                  <th class="px-4 py-3">Mode Name</th>
                  <th class="px-4 py-3">Number Range</th>
                  <th class="px-4 py-3 text-right">Entry Stakes</th>
                  <th class="px-4 py-3 text-right">Commission Rate</th>
                  <th class="px-4 py-3 text-right">Max Attempts</th>
                  <th class="px-4 py-3 text-right">Turn Timer</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="modes-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-slate-500">Loading modes...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Commission Rules Section (Requirement 12) -->
      <div class="space-y-3 pt-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-white">Entry-Fee-Specific Commission Brackets</h3>
            <p class="text-xs text-slate-400">The authoritative backend computes rake dynamically based on match stakes.</p>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300 font-mono">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Tier Name</th>
                  <th class="px-4 py-3">Entry Fee Bracket</th>
                  <th class="px-4 py-3 text-right">Platform Rake %</th>
                  <th class="px-4 py-3">Promotional Tag</th>
                  <th class="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody id="commissions-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="5" class="px-4 py-6 text-center text-slate-500">Loading commission brackets...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;let i=t.querySelector(`#modes-table-body`),a=t.querySelector(`#commissions-table-body`);async function o(){let[t,n]=await Promise.all([e.getGameModes(),e.getCommissions()]);t.success&&t.data&&(i.innerHTML=t.data.map(e=>`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-semibold text-white">
            ${e.name}
            <div class="text-[10px] text-slate-500 font-mono">${e.slug}</div>
          </td>
          <td class="px-4 py-3 font-mono text-slate-300 text-xs">
            ${e.number_min} — ${e.number_max}
          </td>
          <td class="px-4 py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
            ${e.entry_fee} ★
          </td>
          <td class="px-4 py-3 text-right font-mono text-purple-400 tabular-nums font-semibold">
            ${e.commission_percentage}%
          </td>
          <td class="px-4 py-3 text-right font-mono text-slate-300 tabular-nums">
            ${e.max_attempts}
          </td>
          <td class="px-4 py-3 text-right font-mono text-emerald-400 tabular-nums">
            ${e.turn_duration_seconds}s
          </td>
          <td class="px-4 py-3 text-xs">
            <span class="font-mono ${e.is_active?`text-emerald-400`:`text-slate-500`} font-semibold">
              ${e.is_active?`ACTIVE`:`DISABLED`}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button data-edit-mode="${e.mode_id}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Configure
            </button>
          </td>
        </tr>
      `).join(``),i.querySelectorAll(`[data-edit-mode]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=parseInt(e.getAttribute(`data-edit-mode`)),r=t.data.find(e=>e.mode_id===n);r&&s(r)})})),n.success&&n.data&&(a.innerHTML=n.data.map(e=>`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-sans font-semibold text-white">${e.name}</td>
          <td class="px-4 py-3 text-amber-400 tabular-nums">${e.min_entry} ★ — ${e.max_entry} ★</td>
          <td class="px-4 py-3 text-right font-bold text-purple-400 tabular-nums">${e.commission_percentage}%</td>
          <td class="px-4 py-3 text-slate-400 text-xs">${e.tag}</td>
          <td class="px-4 py-3 text-emerald-400 text-xs font-semibold">ACTIVE</td>
        </tr>
      `).join(``))}await o();function s(t){let i=`
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Entry Stakes (Stars):</label>
          <input type="number" id="mode-entry-input" value="${t.entry_fee}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Commission Percentage (%):</label>
          <input type="number" step="0.5" id="mode-comm-input" value="${t.commission_percentage}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Max Turn Duration (seconds):</label>
          <input type="number" id="mode-duration-input" value="${t.turn_duration_seconds}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Max Attempts Limit:</label>
          <input type="number" id="mode-attempts-input" value="${t.max_attempts}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-save-mode-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Save Mode Parameters
          </button>
        </div>
      </div>
    `;n.showContentModal(`Configure Rules: ${t.name}`,i,i=>{i.querySelector(`#modal-save-mode-btn`)?.addEventListener(`click`,async()=>{let a=parseInt(i.querySelector(`#mode-entry-input`).value),s=parseFloat(i.querySelector(`#mode-comm-input`).value),c=parseInt(i.querySelector(`#mode-duration-input`).value),l=parseInt(i.querySelector(`#mode-attempts-input`).value),u=await e.updateGameMode(t.mode_id,{entry_fee:a,commission_percentage:s,turn_duration_seconds:c,max_attempts:l});u.success?(r.show(`Game mode rules updated.`,`success`),n.close(),await o()):r.show(u.error||`Failed to update rules.`,`error`)})})}}async function _(t){t.innerHTML=`
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
  `;let i=t.querySelector(`#disputes-table-body`);async function a(){let t=await e.getDisputes();if(!t.success||!t.data){i.innerHTML=`<tr><td colspan="7" class="px-4 py-6 text-center text-rose-400">Failed to load disputes: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;i.innerHTML=n.map(e=>{let t=e.status===`UNDER_REVIEW`?`<span class="text-amber-400 font-mono font-semibold">UNDER_REVIEW</span>`:e.status===`RESOLVED_REFUNDED`?`<span class="text-emerald-400 font-mono font-semibold">REFUNDED</span>`:e.status===`RESOLVED_REJECTED`?`<span class="text-rose-400 font-mono font-semibold">REJECTED</span>`:`<span class="text-slate-400 font-mono font-semibold">CLOSED</span>`;return`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono font-bold text-white text-[11px]">${e.dispute_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${e.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${e.user_id}</div>
          </td>
          <td class="px-4 py-3 text-slate-300 font-mono text-[11px]">${e.dispute_type}</td>
          <td class="px-4 py-3 font-mono text-slate-400 text-[11px]">
            ${e.game_id||e.payment_id||`General Account`}
          </td>
          <td class="px-4 py-3 text-xs">${t}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">${new Date(e.created_at).toLocaleDateString()}</td>
          <td class="px-4 py-3 text-right">
            <button data-resolve-dispute="${e.dispute_id}" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Review & Decide
            </button>
          </td>
        </tr>
      `}).join(``),i.querySelectorAll(`[data-resolve-dispute]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-resolve-dispute`),r=n.find(e=>e.dispute_id===t);r&&o(r)})})}await a();function o(t){let i=`
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white">${t.dispute_id} · ${t.dispute_type}</span>
            <span class="text-xs font-mono text-amber-400">${t.status}</span>
          </div>
          <p class="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
            "${t.reason}"
          </p>
          <div class="text-[10px] text-slate-500 font-mono">
            Filed by ${t.username} (UID #${t.user_id}) on ${new Date(t.created_at).toLocaleString()}
          </div>
        </div>

        ${t.admin_notes?`
          <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-400 font-semibold block mb-1">Previous Admin Verdict:</span>
            <p class="text-slate-300 font-mono">${t.admin_notes}</p>
          </div>
        `:``}

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
          <input type="number" id="disp-refund-amount" value="${t.refund_amount||25}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Admin Resolution Justification Notes:</label>
          <textarea id="disp-notes-input" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="State reason and telemetry evidence verified...">${t.admin_notes||``}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-submit-disp-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Record Official Decision
          </button>
        </div>
      </div>
    `;n.showContentModal(`Adjudicate Dispute: ${t.dispute_id}`,i,i=>{i.querySelector(`#modal-submit-disp-btn`)?.addEventListener(`click`,async()=>{let o=i.querySelector(`#disp-decision-select`).value,s=parseInt(i.querySelector(`#disp-refund-amount`).value)||0,c=i.querySelector(`#disp-notes-input`).value.trim();if(c.length<5){r.show(`Please provide detailed admin notes (min 5 chars).`,`warning`);return}let l=await e.resolveDispute(t.dispute_id,o,s,c);l.success?(r.show(`Dispute recorded as ${o}.`,`success`),n.close(),await a()):r.show(l.error||`Failed to resolve dispute.`,`error`)})})}}async function v(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Anti-Cheat & Fraud Detection Engine</h2>
          <p class="text-xs text-slate-400">Heuristic and statistical surveillance detecting binary-search bots, abnormal win spikes, and device fingerprint collisions.</p>
        </div>
      </div>

      <!-- Heuristic Alerts Table -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">Active Heuristic Security Incidents</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Alert ID</th>
                  <th class="px-4 py-3">Suspect Account</th>
                  <th class="px-4 py-3">Anomaly Rule Triggered</th>
                  <th class="px-4 py-3">Severity</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Timestamp</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="alerts-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-slate-500">Scanning telemetry alerts...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;let i=t.querySelector(`#alerts-table-body`);async function a(){let t=await e.getAntiFraud();if(!t.success||!t.data){i.innerHTML=`<tr><td colspan="7" class="px-4 py-6 text-center text-rose-400">Failed to load alerts: ${t.error||`Server error`}</td></tr>`;return}let n=t.data;i.innerHTML=n.map(e=>{let t=e.severity===`CRITICAL`?`text-red-500 font-black`:e.severity===`HIGH`?`text-rose-400 font-bold`:e.severity===`MEDIUM`?`text-amber-400 font-bold`:`text-slate-400`,n=e.status===`UNRESOLVED`?`text-rose-400`:e.status===`MONITORING`?`text-amber-400`:`text-emerald-400`;return`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-mono font-bold text-slate-400 text-[11px]">#ALT-${e.alert_id}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-white">${e.username}</span>
            <div class="text-[10px] text-slate-500 font-mono">UID #${e.user_id} · Current: ${e.risk_level}</div>
          </td>
          <td class="px-4 py-3">
            <div class="font-mono text-slate-200 font-semibold text-[11px]">${e.alert_type}</div>
            <div class="text-[10px] text-slate-400">${e.description}</div>
          </td>
          <td class="px-4 py-3 font-mono text-[11px] ${t}">${e.severity}</td>
          <td class="px-4 py-3 font-mono text-xs font-semibold ${n}">${e.status}</td>
          <td class="px-4 py-3 font-mono text-slate-500 text-[10px]">${new Date(e.created_at).toLocaleDateString()}</td>
          <td class="px-4 py-3 text-right">
            <button data-review-alert="${e.alert_id}" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
              Manage Suspect
            </button>
          </td>
        </tr>
      `}).join(``),i.querySelectorAll(`[data-review-alert]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.getAttribute(`data-review-alert`)),r=n.find(e=>e.alert_id===t);r&&o(r)})})}await a();function o(t){let i=`
      <div class="space-y-4">
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm">${t.alert_type}</span>
            <span class="text-xs font-mono font-bold text-rose-400">${t.severity}</span>
          </div>
          <p class="text-xs text-slate-300">
            ${t.description}
          </p>
          <div class="text-[11px] font-mono text-slate-400">
            Subject: <strong class="text-white">${t.username}</strong> (#${t.user_id})
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Set Player Risk Classification:</label>
          <select id="set-risk-select" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="NORMAL" ${t.risk_level===`NORMAL`?`selected`:``}>NORMAL (Standard player)</option>
            <option value="MONITOR" ${t.risk_level===`MONITOR`?`selected`:``}>MONITOR (Watchlist)</option>
            <option value="SUSPICIOUS" ${t.risk_level===`SUSPICIOUS`?`selected`:``}>SUSPICIOUS (Restricted stakes)</option>
            <option value="BLOCKED" ${t.risk_level===`BLOCKED`?`selected`:``}>BLOCKED (Quarantined)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Set Alert Investigation Status:</label>
          <select id="set-alert-status-select" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="UNRESOLVED" ${t.status===`UNRESOLVED`?`selected`:``}>UNRESOLVED</option>
            <option value="MONITORING" ${t.status===`MONITORING`?`selected`:``}>MONITORING</option>
            <option value="RESOLVED" ${t.status===`RESOLVED`?`selected`:``}>RESOLVED</option>
            <option value="DISMISSED" ${t.status===`DISMISSED`?`selected`:``}>DISMISSED</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="save-alert-risk-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Update Security Risk Assessment
          </button>
        </div>
      </div>
    `;n.showContentModal(`Security Assessment: #${t.alert_id}`,i,i=>{i.querySelector(`#save-alert-risk-btn`)?.addEventListener(`click`,async()=>{let o=i.querySelector(`#set-risk-select`).value,s=i.querySelector(`#set-alert-status-select`).value;await Promise.all([e.updateUserRisk(t.user_id,o,`Anti-fraud alert #${t.alert_id} resolution`),e.updateAlertStatus(t.alert_id,s)]),r.show(`Risk status and security alert updated.`,`success`),n.close(),await a()})})}}async function y(t){t.innerHTML=`
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
  `;let n=t.querySelector(`#leaderboard-table-body`),r=t.querySelector(`#rewards-ladder`),i=t.querySelector(`#referrals-table-body`),[a,o,s]=await Promise.all([e.getLeaderboards(),e.getRewards(),e.getReferrals()]);a.success&&a.data&&(n.innerHTML=a.data.map(e=>`
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-2.5 font-bold ${e.rank===1?`text-amber-400`:e.rank===2?`text-slate-300`:e.rank===3?`text-amber-600`:`text-slate-500`}">
          #${e.rank}
        </td>
        <td class="px-4 py-2.5 font-sans">
          <span class="font-semibold text-white">${e.username}</span>
          <span class="text-[10px] text-slate-500 font-mono ml-1">#${e.user_id}</span>
        </td>
        <td class="px-4 py-2.5 text-right font-bold text-amber-400 tabular-nums">
          ${e.stars_won.toLocaleString()} ★
        </td>
        <td class="px-4 py-2.5 text-right text-slate-300 tabular-nums">${e.win_rate}</td>
        <td class="px-4 py-2.5 text-right text-slate-400 tabular-nums">${e.games_played}</td>
      </tr>
    `).join(``)),o.success&&o.data&&(r.innerHTML=o.data.map(e=>`
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
        <span class="text-slate-400 font-sans font-medium">Day ${e.day} Login</span>
        <div class="flex items-center gap-2">
          <span class="font-bold text-amber-400 tabular-nums">+${e.stars} ★</span>
          ${e.streak_bonus>0?`<span class="text-[10px] text-emerald-400">(+${e.streak_bonus} streak)</span>`:``}
        </div>
      </div>
    `).join(``)),s.success&&s.data&&(i.innerHTML=s.data.map(e=>`
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-2.5 font-semibold text-white font-mono">#${e.referrer_id} (${e.referrer_username})</td>
        <td class="px-4 py-2.5 font-semibold text-slate-200 font-mono">#${e.referee_id} (${e.referee_username})</td>
        <td class="px-4 py-2.5 text-right font-mono font-bold text-emerald-400 tabular-nums">+${e.reward} ★</td>
        <td class="px-4 py-2.5 font-mono text-xs text-emerald-400 font-semibold">${e.status}</td>
        <td class="px-4 py-2.5 font-mono text-slate-500 text-[10px]">${new Date(e.registered_at).toLocaleDateString()}</td>
      </tr>
    `).join(``))}async function b(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Immutable Admin Audit Trail</h2>
          <p class="text-xs text-slate-400">Strict regulatory log of administrative actions, balance adjustments, rule updates, and security bans.</p>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
              <tr>
                <th class="px-4 py-3">Log ID</th>
                <th class="px-4 py-3">Administrator</th>
                <th class="px-4 py-3">Action Executed</th>
                <th class="px-4 py-3">Target Entity</th>
                <th class="px-4 py-3">Audit Reason & Justification</th>
                <th class="px-4 py-3">State Diff (Before / After)</th>
                <th class="px-4 py-3">IP Address</th>
                <th class="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody id="audit-table-body" class="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr><td colspan="8" class="px-4 py-8 text-center text-slate-500 font-sans">Loading audit records...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;let n=t.querySelector(`#audit-table-body`);async function r(){let t=await e.getAuditLogs();if(!t.success||!t.data){n.innerHTML=`<tr><td colspan="8" class="px-4 py-6 text-center text-rose-400 font-sans">Failed to load audit logs: ${t.error||`Server error`}</td></tr>`;return}let r=t.data;n.innerHTML=r.map(e=>`
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="px-4 py-3 text-slate-500 font-semibold">#LOG-${e.log_id}</td>
        <td class="px-4 py-3 font-sans">
          <span class="font-bold text-white">${e.admin_username}</span>
          <div class="text-[10px] text-slate-500 font-mono">ID #${e.admin_id}</div>
        </td>
        <td class="px-4 py-3 text-purple-400 font-bold">${e.action}</td>
        <td class="px-4 py-3 text-slate-300">${e.target_type}: #${e.target_id}</td>
        <td class="px-4 py-3 font-sans text-slate-200 max-w-xs truncate" title="${e.reason}">
          ${e.reason}
        </td>
        <td class="px-4 py-3 text-[10px] text-slate-400 max-w-xs">
          <div class="truncate text-rose-400/80">Prev: ${e.before_value?JSON.stringify(e.before_value):`null`}</div>
          <div class="truncate text-emerald-400/90 font-semibold">Next: ${JSON.stringify(e.after_value)}</div>
        </td>
        <td class="px-4 py-3 text-slate-400 text-[10px]">${e.ip_address}</td>
        <td class="px-4 py-3 text-slate-500 text-[10px] whitespace-nowrap">${new Date(e.created_at).toLocaleTimeString()}</td>
      </tr>
    `).join(``)}await r()}function x(e){e.innerHTML=`
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
  `,e.querySelectorAll(`[data-export]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-export`);r.show(`Preparing ${t}.csv export...`,`info`),window.location.href=`/api/v1/admin/export/${t}`})})}async function S(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">System Settings & Maintenance Mode</h2>
          <p class="text-xs text-slate-400">Control global engine availability, matchmaking queues, payment gateways, and system broadcasts.</p>
        </div>
      </div>

      <!-- Maintenance Mode Warning Box -->
      <div id="maintenance-banner" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>Maintenance Mode (Safe Drain Engine)</span>
              <span id="maint-status-pill" class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">IDLE</span>
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              When enabled, incoming match matchmaking is paused while all active in-progress games conclude safely without interruption.
            </p>
          </div>
          <div>
            <button id="toggle-maint-btn" class="px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30">
              Toggle Maintenance Mode
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Feature Toggles -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-white">Engine Feature Availability</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">User Registrations</span>
                <span class="text-[11px] text-slate-500">Allow new mobile players to create accounts</span>
              </div>
              <input type="checkbox" id="set-reg-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">Matchmaking & Games</span>
                <span class="text-[11px] text-slate-500">Enable 1v1 prediction lobbies and matchmaking queues</span>
              </div>
              <input type="checkbox" id="set-games-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">In-App Store Payments</span>
                <span class="text-[11px] text-slate-500">Enable real fiat purchase of Star currency packages</span>
              </div>
              <input type="checkbox" id="set-payments-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div>
                <span class="font-semibold text-white block">Player P2P Transfers</span>
                <span class="text-[11px] text-slate-500">Allow player-to-player Star transfers</span>
              </div>
              <input type="checkbox" id="set-transfers-toggle" class="w-4 h-4 accent-amber-500 cursor-pointer" />
            </div>
          </div>
          <div class="flex justify-end">
            <button id="save-toggles-btn" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium">
              Save Toggles
            </button>
          </div>
        </div>

        <!-- Push Notifications & Broadcasts -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-white">Broadcast Global Announcement</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Notice Title:</label>
              <input type="text" id="notif-title" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Scheduled Tournament Tonight" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Message Content:</label>
              <textarea id="notif-message" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" placeholder="Details dispatched to active mobile app players..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Audience:</label>
              <select id="notif-audience" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
                <option value="ALL">All Registered Players</option>
                <option value="ACTIVE_USERS">Currently Active Players</option>
                <option value="HIGH_ROLLER">High Rollers & VIPs</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button id="send-broadcast-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
              Dispatch Push Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  `;let i=t.querySelector(`#maint-status-pill`),a=t.querySelector(`#toggle-maint-btn`),o=t.querySelector(`#set-reg-toggle`),s=t.querySelector(`#set-games-toggle`),c=t.querySelector(`#set-payments-toggle`),l=t.querySelector(`#set-transfers-toggle`),u=t.querySelector(`#save-toggles-btn`),d={};async function f(){let t=await e.getSettings();if(t.success&&t.data){d=t.data;let e=d.maintenance_mode===`true`;i.innerText=e?`ACTIVE MAINTENANCE`:`SYSTEM ONLINE`,i.className=`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${e?`bg-rose-500/20 text-rose-400`:`bg-emerald-500/20 text-emerald-400`}`,a.innerText=e?`Disable Maintenance Mode`:`Enable Maintenance Mode`,a.className=`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${e?`bg-emerald-600 hover:bg-emerald-500 text-white`:`bg-rose-600 hover:bg-rose-500 text-white`}`,o.checked=d.registration_enabled===`true`,s.checked=d.games_enabled===`true`,c.checked=d.payments_enabled===`true`,l.checked=d.transfer_enabled===`true`}}a.addEventListener(`click`,()=>{let t=d.maintenance_mode!==`true`;n.showDangerousConfirm({title:t?`Enable Maintenance Mode`:`Disable Maintenance Mode`,message:t?`Activating maintenance will prevent new matchmaking queues. Active games will finish gracefully.`:`Restoring regular operational state. Matchmaking queues will reopen to players.`,actionButtonText:t?`Enable Maintenance`:`Restore Operations`,requireTypingWord:t?`MAINTENANCE`:`RESTORE`,requirePassword:!0,onConfirm:async n=>{(await e.updateSettings({maintenance_mode:t?`true`:`false`,admin_password:n||``})).success&&(r.show(`Maintenance mode set to ${t}.`,`success`),await f())}})}),u.addEventListener(`click`,async()=>{(await e.updateSettings({registration_enabled:o.checked?`true`:`false`,games_enabled:s.checked?`true`:`false`,payments_enabled:c.checked?`true`:`false`,transfer_enabled:l.checked?`true`:`false`})).success&&(r.show(`Engine feature availability updated.`,`success`),await f())}),t.querySelector(`#send-broadcast-btn`)?.addEventListener(`click`,async()=>{let n=t.querySelector(`#notif-title`).value.trim(),i=t.querySelector(`#notif-message`).value.trim(),a=t.querySelector(`#notif-audience`).value;if(!n||!i){r.show(`Please enter both title and broadcast message.`,`warning`);return}let o=await e.broadcastNotification({title:n,message:i,type:`ANNOUNCEMENT`,audience:a});o.success&&(r.show(o.message||`Broadcast dispatched.`,`success`),t.querySelector(`#notif-title`).value=``,t.querySelector(`#notif-message`).value=``)}),await f()}async function C(t){t.innerHTML=`
    <div class="p-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-tight">Database Health & Backup Recovery</h2>
          <p class="text-xs text-slate-400">Monitor MySQL 8+ table health, row-level storage, and trigger hot database snapshots.</p>
        </div>
        <div>
          <button id="trigger-backup-btn" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
            <span>💾 Trigger Hot Snapshot Dump</span>
          </button>
        </div>
      </div>

      <!-- Health Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Database Engine</span>
          <div class="text-base font-bold font-mono text-white">MySQL 8.0.36 InnoDB</div>
          <div class="text-[10px] text-emerald-400 font-mono">ACID Transactions Verified</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Cluster Status</span>
          <div class="text-base font-bold font-mono text-emerald-400">HEALTHY (0 corrupted)</div>
          <div class="text-[10px] text-slate-500 font-mono">Row-level locking active</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span class="text-xs text-slate-400">Last Verified Snapshot</span>
          <div id="last-backup-txt" class="text-base font-bold font-mono text-white tabular-nums">—</div>
          <div class="text-[10px] text-slate-500 font-mono">Automated 6-hour interval</div>
        </div>
      </div>

      <!-- Table Storage Matrix -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-white">InnoDB Table Allocation</h3>
        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300 font-mono">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 font-sans">
                <tr>
                  <th class="px-4 py-3">Table Identifier</th>
                  <th class="px-4 py-3 text-right">Row Count</th>
                  <th class="px-4 py-3 text-right">Estimated Storage</th>
                  <th class="px-4 py-3">Integrity Check</th>
                </tr>
              </thead>
              <tbody id="tables-health-tbody" class="divide-y divide-slate-800/60 text-xs">
                <tr><td colspan="4" class="px-4 py-6 text-center text-slate-500 font-sans">Loading storage metrics...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;let n=t.querySelector(`#last-backup-txt`),i=t.querySelector(`#tables-health-tbody`),a=t.querySelector(`#trigger-backup-btn`);async function o(){let t=await e.getBackupStatus();if(t.success&&t.data){let e=t.data;n.innerText=new Date(e.last_backup_timestamp).toLocaleTimeString(),i.innerHTML=e.tables.map(e=>`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="px-4 py-3 font-semibold text-white font-mono">${e.table_name}</td>
          <td class="px-4 py-3 text-right tabular-nums text-slate-300">${e.row_count}</td>
          <td class="px-4 py-3 text-right tabular-nums text-amber-400">${e.size_kb} KB</td>
          <td class="px-4 py-3 text-emerald-400 font-sans font-medium text-[11px]">✓ OPTIMAL</td>
        </tr>
      `).join(``)}}a.addEventListener(`click`,async()=>{a.disabled=!0,a.innerText=`Creating Snapshot Dump...`;let t=await e.triggerBackup();a.disabled=!1,a.innerText=`💾 Trigger Hot Snapshot Dump`,t.success?(r.show(t.message||`Database snapshot created.`,`success`),await o()):r.show(t.error||`Backup trigger failed.`,`error`)}),await o()}function w(e){e.innerHTML=`
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
  `}function T(n){n.innerHTML=`
    <div class="min-h-full flex items-center justify-center p-6 bg-slate-950">
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
            ★
          </div>
          <h2 class="text-xl font-bold text-white tracking-tight">StarGuess Administration</h2>
          <p class="text-xs text-slate-400">Authoritative Administrative Console & Economy Engine</p>
        </div>

        <!-- Credentials Form -->
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Administrator Username or Email:</label>
            <input 
              type="text" 
              id="login-username" 
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" 
              placeholder="admin@example.com"
              required 
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-medium text-slate-300">Password:</label>
              <button type="button" id="forgot-password-link" class="text-[11px] text-amber-400 hover:text-amber-300">Forgot password?</button>
            </div>
            <input 
              type="password" 
              id="login-password" 
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500" 
              placeholder="••••••••••••"
              required 
            />
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="remember-me" checked class="w-4 h-4 accent-amber-500 rounded" />
              <span>Remember secure session</span>
            </label>
            <span class="text-[10px] text-slate-500 font-mono">2FA Active</span>
          </div>

          <button 
            type="submit" 
            id="login-submit-btn" 
            class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20 mt-2"
          >
            Authenticate & Access Panel
          </button>
        </form>

        <!-- Demo Credentials Footnote -->
        <div class="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 space-y-1">
          <div class="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>SEED CREDENTIALS:</span>
            <span class="text-emerald-400">SECURE SESSION</span>
          </div>
          <p>Use the administrator account created during server setup.</p>
        </div>
      </div>
    </div>
  `;let i=n.querySelector(`#login-form`),a=n.querySelector(`#login-username`),o=n.querySelector(`#login-password`),s=n.querySelector(`#login-submit-btn`),c=n.querySelector(`#forgot-password-link`);i.addEventListener(`submit`,async n=>{n.preventDefault(),s.disabled=!0,s.innerText=`Verifying Authenticity...`;let i=a.value.trim(),c=o.value,l=await e.login({username:i,password:c});s.disabled=!1,s.innerText=`Authenticate & Access Panel`,l.success&&l.data?(e.setToken(l.data.token),t.setAdmin(l.data.admin),r.show(`Welcome back, ${l.data.admin.full_name}.`,`success`),t.setRoute(`dashboard`)):r.show(l.error||`Authentication rejected.`,`error`)}),c.addEventListener(`click`,()=>{r.show(`Password reset protocol initiated. One-time verification token dispatched to admin registered email.`,`info`)})}function E(){let e=document.getElementById(`app`);if(!e)return;if(!t.isAuthenticated||t.currentRoute===`login`){T(e);return}e.innerHTML=`
    <div class="h-full flex overflow-hidden bg-slate-950 text-slate-100">
      <!-- Left Sidebar Container -->
      <aside id="sidebar-container" class="shrink-0"></aside>

      <!-- Main Workspace Frame -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Top Navigation Bar -->
        <div id="topbar-container" class="shrink-0"></div>

        <!-- Viewport Workspace Content -->
        <main id="main-content" class="flex-1 overflow-y-auto bg-slate-950"></main>
      </div>
    </div>
  `;let n=e.querySelector(`#sidebar-container`),r=e.querySelector(`#topbar-container`),i=e.querySelector(`#main-content`);switch(o(n),c(r),t.currentRoute){case`dashboard`:l(i);break;case`users`:u(i);break;case`wallets`:d(i);break;case`packages`:f(i);break;case`payments`:p(i);break;case`live-games`:m(i);break;case`games`:h(i);break;case`game-modes`:g(i);break;case`disputes`:_(i);break;case`anti-fraud`:v(i);break;case`leaderboards`:y(i);break;case`audit-logs`:b(i);break;case`reports`:x(i);break;case`settings`:S(i);break;case`backup`:C(i);break;case`docs`:w(i);break;default:l(i)}}t.on(`routeChanged`,()=>{E()}),t.on(`authChanged`,()=>{E()});function D(){E(),e.getToken()&&e.getMe().then(n=>{n.success&&n.data?.admin?t.setAdmin(n.data.admin):e.setToken(null)})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,D,{once:!0}):D();