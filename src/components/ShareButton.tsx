import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { triggerShareToast } from './ShareNotificationToast';

interface ShareButtonProps {
  sectionTitle: string;
  moduleId?: string;
  customHash?: string;
  className?: string;
  buttonText?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  sectionTitle,
  moduleId,
  customHash,
  className = '',
  buttonText = 'Compartir',
  iconOnly = false,
  size = 'sm',
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Construct target URL
    const hash = customHash || (moduleId ? `#${moduleId}` : window.location.hash || '#inicio');
    const url = `${window.location.origin}${window.location.pathname}${hash}`;

    let copySuccess = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        copySuccess = true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    if (!copySuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccess = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback clipboard copy failed:', err);
      }
    }

    if (copySuccess) {
      setCopied(true);
      triggerShareToast({
        title: '¡Enlace copiado al portapapeles!',
        subtitle: `Enlace directo a "${sectionTitle}" copiado. ¡Listo para compartir con la hinchada tiburona!`,
        url,
      });

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-1.5 text-xs sm:text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title={`Copiar enlace directo a ${sectionTitle}`}
      aria-label={`Compartir enlace de ${sectionTitle}`}
      className={`rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
        copied
          ? 'bg-emerald-950/60 border border-emerald-500/70 text-emerald-400'
          : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-white'
      } ${sizeClasses[size]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-50 duration-150" />
          {!iconOnly && <span className="text-emerald-400 font-bold">¡Copiado!</span>}
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300" />
          {!iconOnly && <span>{buttonText}</span>}
        </>
      )}
    </button>
  );
};
