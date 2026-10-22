// Toast notification engine

type ToastType = 'success' | 'error' | 'warning' | 'info';

class ToastManager {
  private container: HTMLElement | null = null;

  private initContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  show(message: string, type: ToastType = 'info', durationMs: number = 4000) {
    this.initContainer();
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border text-sm shadow-xl transition-all duration-300 translate-y-2 opacity-0 font-sans ${
      type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' :
      type === 'error' ? 'bg-slate-900 border-rose-500/40 text-rose-300' :
      type === 'warning' ? 'bg-slate-900 border-amber-500/40 text-amber-300' :
      'bg-slate-900 border-slate-700 text-slate-200'
    }`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';

    toast.innerHTML = `
      <span class="font-mono text-base font-bold shrink-0">${icon}</span>
      <div class="flex-1 text-xs leading-relaxed text-slate-200">${message}</div>
      <button class="text-slate-400 hover:text-white text-xs font-mono shrink-0 ml-1">✕</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      this.dismiss(toast);
    }, durationMs);
  }

  private dismiss(toast: HTMLElement) {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export const toast = new ToastManager();
