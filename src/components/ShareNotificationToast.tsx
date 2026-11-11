import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, X, Share2 } from 'lucide-react';

export interface ShareToastData {
  title: string;
  subtitle?: string;
  url: string;
}

export const triggerShareToast = (data: ShareToastData) => {
  window.dispatchEvent(
    new CustomEvent('junior-share-toast', {
      detail: data,
    })
  );
};

export const ShareNotificationToast: React.FC = () => {
  const [toast, setToast] = useState<ShareToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ShareToastData>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
        setVisible(true);

        clearTimeout(timer);
        timer = setTimeout(() => {
          setVisible(false);
        }, 3200);
      }
    };

    window.addEventListener('junior-share-toast', handleToast);
    return () => {
      window.removeEventListener('junior-share-toast', handleToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/98 dark:bg-slate-900/98 border border-emerald-500/50 rounded-xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
        <CheckCircle2 className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
            {toast.title || '¡Enlace copiado con éxito!'}
          </h4>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {toast.subtitle && (
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            {toast.subtitle}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-slate-950/80 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 truncate">
          <Share2 className="w-3 h-3 text-red-500 shrink-0" />
          <span className="truncate">{toast.url}</span>
        </div>
      </div>
    </div>
  );
};
