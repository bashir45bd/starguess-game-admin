import { api } from '../api';
import { state } from '../state';
import { modal } from './Modal';
import { toast } from './Toast';

export function openAdminProfileModal() {
  const admin = state.admin;
  if (!admin) return;
  const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
  modal.showContentModal('Edit admin profile', `
    <form id="admin-profile-form" class="space-y-3">
      <label class="block">Username<input name="username" required minlength="3" maxlength="50" value="${esc(admin.username)}" class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white" /></label>
      <label class="block">Full name<input name="full_name" required minlength="2" maxlength="100" value="${esc(admin.full_name)}" class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white" /></label>
      <label class="block">Email<input name="email" type="email" required value="${esc(admin.email)}" class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white" /></label>
      <label class="block">Current password<input name="current_password" type="password" required autocomplete="current-password" class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white" /></label>
      <p id="profile-error" class="hidden text-rose-400"></p>
      <button class="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-semibold">Save profile</button>
    </form>`, overlay => {
      const form = overlay.querySelector('form') as HTMLFormElement;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
        const result = await api.updateAdminProfile(values as { username: string; email: string; full_name: string; current_password: string });
        if (!result.success) { const error = overlay.querySelector('#profile-error')!; error.textContent = result.error || 'Profile update failed.'; error.classList.remove('hidden'); return; }
        state.setAdmin(result.data.admin);
        toast.show('Admin profile updated.', 'success');
        modal.close();
      });
    });
}
