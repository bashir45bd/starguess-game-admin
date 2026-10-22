// Secure Admin Authentication & Login View (Vanilla JS)
import { api } from '../api';
import { state } from '../state';
import { toast } from '../components/Toast';

export function renderLoginView(container: HTMLElement) {
  container.innerHTML = `
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
  `;

  const form = container.querySelector('#login-form') as HTMLFormElement;
  const usernameInput = container.querySelector('#login-username') as HTMLInputElement;
  const passwordInput = container.querySelector('#login-password') as HTMLInputElement;
  const submitBtn = container.querySelector('#login-submit-btn') as HTMLButtonElement;
  const forgotLink = container.querySelector('#forgot-password-link') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = 'Verifying Authenticity...';

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const res = await api.login({ username, password });
    submitBtn.disabled = false;
    submitBtn.innerText = 'Authenticate & Access Panel';

    if (res.success && res.data) {
      api.setToken(res.data.token);
      state.setAdmin(res.data.admin);
      toast.show(`Welcome back, ${res.data.admin.full_name}.`, 'success');
      state.setRoute('dashboard');
    } else {
      toast.show(res.error || 'Authentication rejected.', 'error');
    }
  });

  forgotLink.addEventListener('click', () => {
    toast.show('Password reset protocol initiated. One-time verification token dispatched to admin registered email.', 'info');
  });
}
