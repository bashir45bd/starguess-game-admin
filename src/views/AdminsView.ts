import { api } from '../api';
import { modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { state } from '../state';

type AdminRow = { admin_id: number; username: string; email: string; full_name: string; role_id: number; role_name: string; is_active: number; last_login_at: string | null };
type RoleRow = { role_id: number; role_name: string; description: string };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export async function renderAdminsView(container: HTMLElement) {
  if (!state.hasPerm('admins:view')) { container.innerHTML = '<div class="p-8 text-rose-400">You do not have permission to view admin accounts.</div>'; return; }
  container.innerHTML = '<div class="p-8 text-slate-400">Loading admin accounts…</div>';
  const [adminRes, roleRes] = await Promise.all([api.getAdmins(), api.getAdminRoles()]);
  if (!adminRes.success || !roleRes.success) { container.innerHTML = `<div class="p-8 text-rose-400">${esc(adminRes.error || roleRes.error || 'Unable to load admins.')}</div>`; return; }
  const rows = adminRes.data as AdminRow[];
  const roles = roleRes.data as RoleRow[];
  const canCreate = state.hasPerm('admins:create');
  const canUpdate = state.hasPerm('admins:update');
  const renderRows = () => rows.map(row => `<tr class="border-t border-slate-800"><td class="px-4 py-3 font-medium text-white">${esc(row.username)}<div class="text-[11px] text-slate-500">${esc(row.full_name)}</div></td><td class="px-4 py-3">${esc(row.email)}</td><td class="px-4 py-3">${esc(row.role_name)}</td><td class="px-4 py-3"><span class="px-2 py-1 rounded ${row.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}">${row.is_active ? 'Active' : 'Inactive'}</span></td><td class="px-4 py-3">${esc(row.last_login_at || 'Never')}</td><td class="px-4 py-3">${canUpdate && row.admin_id !== state.admin?.admin_id ? `<button data-edit="${row.admin_id}" class="text-amber-300 hover:text-white">Edit</button>` : '—'}</td></tr>`).join('');
  container.innerHTML = `<div class="p-6 space-y-5"><header class="flex items-center justify-between"><div><h2 class="text-xl font-bold text-white">Admin Accounts</h2><p class="text-xs text-slate-400 mt-1">Create admin logins and manage account details, roles, and access.</p></div>${canCreate ? '<button id="new-admin" class="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold">+ Add admin</button>' : ''}</header><div class="overflow-auto rounded-xl border border-slate-800 bg-slate-900"><table class="w-full text-left text-xs text-slate-300"><thead class="bg-slate-950 text-slate-500 uppercase"><tr><th class="px-4 py-3">Admin</th><th class="px-4 py-3">Email</th><th class="px-4 py-3">Role</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Last login</th><th class="px-4 py-3">Action</th></tr></thead><tbody>${renderRows()}</tbody></table></div></div>`;
  const openForm = (row?: AdminRow) => {
    const editing = !!row;
    const roleOptions = roles.map(role => `<option value="${role.role_id}" ${row?.role_id === role.role_id ? 'selected' : ''}>${esc(role.role_name)}</option>`).join('');
    modal.showContentModal(editing ? 'Edit admin account' : 'Add admin account', `<form id="admin-account-form" class="space-y-3"><div class="grid sm:grid-cols-2 gap-3"><label>Username<input name="username" required minlength="3" maxlength="50" value="${esc(row?.username)}" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><label>Full name<input name="full_name" required minlength="2" maxlength="100" value="${esc(row?.full_name)}" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><label>Email<input name="email" type="email" required value="${esc(row?.email)}" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><label>Role<select name="role_id" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">${roleOptions}</select></label></div>${editing ? `<label class="flex items-center gap-2"><input name="is_active" type="checkbox" ${row?.is_active ? 'checked' : ''} /> Active account</label><label>New password (optional; at least 14 characters)<input name="new_password" type="password" minlength="14" autocomplete="new-password" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>` : '<label>Initial password (at least 14 characters)<input name="password" type="password" required minlength="14" autocomplete="new-password" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>'}<label>Confirm your current admin password<input name="current_password" type="password" required autocomplete="current-password" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label><p id="account-error" class="hidden text-rose-400"></p><button class="px-4 py-2 rounded-lg bg-amber-500 font-bold text-slate-950">${editing ? 'Save changes' : 'Create admin'}</button></form>`, overlay => {
      const form = overlay.querySelector('form') as HTMLFormElement;
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
        data.role_id = String(Number(data.role_id));
        data.is_active = String((form.elements.namedItem('is_active') as HTMLInputElement | null)?.checked ?? true);
        const result = editing ? await api.updateAdmin(row!.admin_id, data) : await api.createAdmin(data);
        if (!result.success) { const error = overlay.querySelector('#account-error')!; error.textContent = result.error || 'Unable to save admin account.'; error.classList.remove('hidden'); return; }
        toast.show(editing ? 'Admin account updated.' : 'Admin account created.', 'success');
        modal.close();
        void renderAdminsView(container);
      });
    });
  };
  container.querySelector('#new-admin')?.addEventListener('click', () => openForm());
  container.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => button.addEventListener('click', () => { const row = rows.find(item => item.admin_id === Number(button.dataset.edit)); if (row) openForm(row); }));
}
