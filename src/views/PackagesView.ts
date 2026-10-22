// Star Virtual Currency Packages View (Vanilla JS)
import { api } from '../api';
import { toast } from '../components/Toast';
import { modal } from '../components/Modal';

export async function renderPackagesView(container: HTMLElement) {
  container.innerHTML = `
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
  `;

  const grid = container.querySelector('#packages-grid') as HTMLElement;
  const addBtn = container.querySelector('#add-package-btn') as HTMLButtonElement;

  async function loadPackages() {
    const res = await api.getPackages();
    if (!res.success || !res.data) {
      grid.innerHTML = `<div class="col-span-full p-6 text-center text-rose-400">Failed to load packages: ${res.error || 'Server error'}</div>`;
      return;
    }

    const packages = res.data;
    grid.innerHTML = packages.map((p: any) => `
      <div class="bg-slate-900 border ${p.is_featured ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-800'} rounded-xl p-5 space-y-4 relative flex flex-col justify-between">
        ${p.is_featured ? `
          <span class="absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            FEATURED
          </span>
        ` : ''}

        <div class="space-y-1">
          <span class="text-xs font-mono text-slate-500">Tier #${p.sort_order}</span>
          <h3 class="text-base font-bold text-white">${p.name}</h3>
        </div>

        <div class="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              ${p.stars.toLocaleString()} ★
            </span>
            <span class="text-sm font-bold font-mono text-white tabular-nums">
              $${(p.price_cents / 100).toFixed(2)} ${p.currency}
            </span>
          </div>
          ${p.bonus_stars > 0 ? `
            <div class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span>+${p.bonus_stars.toLocaleString()} Bonus Stars Included</span>
            </div>
          ` : '<div class="text-[10px] font-mono text-slate-600">Standard tier</div>'}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <span class="text-xs font-mono ${p.is_active ? 'text-emerald-400' : 'text-slate-500'} font-semibold">
            ${p.is_active ? '● STORE ACTIVE' : '○ DISABLED'}
          </span>
          <button data-edit-package="${p.package_id}" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors">
            Edit Pricing & Status
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-edit-package]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pkgId = parseInt(btn.getAttribute('data-edit-package')!);
        const pkg = packages.find((x: any) => x.package_id === pkgId);
        if (pkg) openPackageModal(pkg);
      });
    });
  }

  addBtn.addEventListener('click', () => openPackageModal());
  await loadPackages();

  function openPackageModal(pkg?: any) {
    const isEdit = !!pkg;
    const html = `
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Package Display Name:</label>
          <input type="text" id="pkg-name-input" value="${pkg?.name || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Grand Master Treasury" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Base Stars:</label>
            <input type="number" id="pkg-stars-input" value="${pkg?.stars || 1000}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Bonus Stars:</label>
            <input type="number" id="pkg-bonus-input" value="${pkg?.bonus_stars || 0}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Price (in cents USD):</label>
            <input type="number" id="pkg-cents-input" value="${pkg?.price_cents || 999}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" placeholder="999 = $9.99" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Featured in Mobile Store:</label>
            <select id="pkg-feat-input" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
              <option value="false" ${pkg?.is_featured ? '' : 'selected'}>Normal</option>
              <option value="true" ${pkg?.is_featured ? 'selected' : ''}>Featured Badge</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Store Status:</label>
          <select id="pkg-active-input" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="true" ${pkg?.is_active ?? true ? 'selected' : ''}>ACTIVE (Available for purchase)</option>
            <option value="false" ${pkg && !pkg.is_active ? 'selected' : ''}>DISABLED (Archived from store)</option>
          </select>
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="modal-save-pkg-btn" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            ${isEdit ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      </div>
    `;

    modal.showContentModal(isEdit ? `Edit: ${pkg.name}` : 'New Star Package', html, (overlay) => {
      overlay.querySelector('#modal-save-pkg-btn')?.addEventListener('click', async () => {
        const name = (overlay.querySelector('#pkg-name-input') as HTMLInputElement).value.trim();
        const stars = parseInt((overlay.querySelector('#pkg-stars-input') as HTMLInputElement).value);
        const bonus_stars = parseInt((overlay.querySelector('#pkg-bonus-input') as HTMLInputElement).value);
        const price_cents = parseInt((overlay.querySelector('#pkg-cents-input') as HTMLInputElement).value);
        const is_featured = (overlay.querySelector('#pkg-feat-input') as HTMLSelectElement).value === 'true';
        const is_active = (overlay.querySelector('#pkg-active-input') as HTMLSelectElement).value === 'true';

        if (!name || isNaN(stars) || isNaN(price_cents)) {
          toast.show('Please fill all required package attributes.', 'warning');
          return;
        }

        const res = isEdit
          ? await api.updatePackage(pkg.package_id, { name, stars, bonus_stars, price_cents, is_featured, is_active })
          : await api.createPackage({ name, stars, bonus_stars, price_cents, is_featured, is_active });

        if (res.success) {
          toast.show(`Package ${isEdit ? 'updated' : 'created'} successfully.`, 'success');
          modal.close();
          await loadPackages();
        } else {
          toast.show(res.error || 'Failed to persist package.', 'error');
        }
      });
    });
  }
}
