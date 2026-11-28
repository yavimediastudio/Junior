import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Share2 } from 'lucide-react';

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
    let timer: ReturnType<typeof setTimeout>;
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
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-[#E5E1D8] rounded-2xl shadow-2xl p-4 flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shrink-0 mt-0.5">
        <CheckCircle2 className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-[#081D40] tracking-tight">
            {toast.title || 'Enlace copiado'}
          </h4>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Cerrar notificación"
            className="text-[#64748B] hover:text-[#081D40] p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toast.subtitle && (
          <p className="text-xs text-[#526075] mt-0.5 leading-snug">{toast.subtitle}</p>
        )}

        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F5F0] rounded-lg border border-[#E5E1D8] text-[11px] font-mono text-[#081D40] truncate">
          <Share2 className="w-3 h-3 text-[#D62027] shrink-0" />
          <span className="truncate">{toast.url}</span>
        </div>
      </div>
    </div>
  );
};
