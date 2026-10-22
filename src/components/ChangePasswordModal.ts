import { api } from '../api';
import { modal } from './Modal';
import { toast } from './Toast';

export function openChangePasswordModal() {
  modal.showContentModal('Change administrator password', `
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
  `, (overlay) => {
    const form = overlay.querySelector('#change-admin-password-form') as HTMLFormElement;
    const error = overlay.querySelector('#admin-password-error') as HTMLParagraphElement;
    const submit = overlay.querySelector('#admin-change-password-submit') as HTMLButtonElement;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const current = (overlay.querySelector('#admin-current-password') as HTMLInputElement).value;
      const next = (overlay.querySelector('#admin-new-password') as HTMLInputElement).value;
      const confirm = (overlay.querySelector('#admin-confirm-password') as HTMLInputElement).value;
      if (next.length < 14) {
        error.textContent = 'New password must be at least 14 characters.';
        error.classList.remove('hidden');
        return;
      }
      if (next !== confirm) {
        error.textContent = 'The new passwords do not match.';
        error.classList.remove('hidden');
        return;
      }
      submit.disabled = true;
      submit.textContent = 'Updating…';
      error.classList.add('hidden');
      try {
        const result = await api.changePassword({ current_password: current, new_password: next });
        if (!result.success || !result.data?.token) {
          error.textContent = result.error || 'Could not change the password.';
          error.classList.remove('hidden');
          return;
        }
        api.setToken(result.data.token);
        toast.show('Password changed. Other admin sessions were signed out.', 'success');
        modal.close();
      } finally {
        submit.disabled = false;
        submit.textContent = 'Update password';
      }
    });
  });
}
