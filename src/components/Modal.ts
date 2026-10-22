// Modal & Dangerous Action Confirmation Manager (Vanilla JS)

interface DangerousConfirmOptions {
  title: string;
  message: string;
  actionButtonText?: string;
  requirePassword?: boolean;
  requireTypingWord?: string; // e.g. "CONFIRM" or "BAN"
  onConfirm: (password?: string) => Promise<void> | void;
}

class ModalManager {
  private activeOverlay: HTMLElement | null = null;

  showDangerousConfirm(options: DangerousConfirmOptions) {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4';

    const wordToType = options.requireTypingWord || '';
    const hasTypingReq = !!wordToType;

    overlay.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-xl p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono text-xl font-bold">
            ⚠
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">${options.title}</h3>
            <p class="text-xs text-rose-400 font-medium">Critical Administrative Action</p>
          </div>
        </div>

        <p class="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          ${options.message}
        </p>

        ${hasTypingReq ? `
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">
              Type <strong class="text-rose-400 font-mono tracking-wider">${wordToType}</strong> to confirm:
            </label>
            <input type="text" id="confirm-typed-word" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500" placeholder="${wordToType}" />
          </div>
        ` : ''}

        ${options.requirePassword ? `
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">
              Confirm Admin Security Credential:
            </label>
            <input type="password" id="confirm-admin-password" autocomplete="current-password" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500" placeholder="Enter your password" />
          </div>
        ` : ''}

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="cancel-danger-btn" class="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button id="execute-danger-btn" class="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-900/30">
            ${options.actionButtonText || 'Confirm & Execute'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;

    const cancelBtn = overlay.querySelector('#cancel-danger-btn');
    const executeBtn = overlay.querySelector('#execute-danger-btn') as HTMLButtonElement;
    const typedInput = overlay.querySelector('#confirm-typed-word') as HTMLInputElement | null;
    const passwordInput = overlay.querySelector('#confirm-admin-password') as HTMLInputElement | null;

    cancelBtn?.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    executeBtn?.addEventListener('click', async () => {
      if (hasTypingReq && typedInput) {
        if (typedInput.value.trim().toUpperCase() !== wordToType.toUpperCase()) {
          typedInput.classList.add('border-rose-500', 'animate-shake');
          return;
        }
      }
      if (options.requirePassword && (!passwordInput || passwordInput.value.length === 0)) {
        passwordInput?.classList.add('border-rose-500');
        return;
      }

      executeBtn.disabled = true;
      executeBtn.innerText = 'Processing...';

      try {
        await options.onConfirm(passwordInput?.value);
        this.close();
      } catch (err: any) {
        executeBtn.disabled = false;
        executeBtn.innerText = options.actionButtonText || 'Confirm & Execute';
      }
    });
  }

  showContentModal(title: string, contentHtml: string, onRender?: (modalEl: HTMLElement) => void) {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto';

    overlay.innerHTML = `
      <div class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-semibold text-white">${title}</h3>
          <button id="modal-close-x" class="text-slate-400 hover:text-white text-sm font-mono p-1">✕</button>
        </div>
        <div id="modal-body" class="flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 pr-1">
          ${contentHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;

    overlay.querySelector('#modal-close-x')?.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    if (onRender) {
      onRender(overlay);
    }
  }

  close() {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }
}

export const modal = new ModalManager();
