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

    const hash = customHash || (moduleId ? `#${moduleId}` : window.location.hash || '#inicio');
    const url = `${window.location.origin}${window.location.pathname}${hash}`;

    let copySuccess = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        copySuccess = true;
      } catch {
        // fallback below
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
      } catch {
        // ignore
      }
    }

    if (copySuccess) {
      setCopied(true);
      triggerShareToast({
        title: 'Enlace copiado',
        subtitle: `Enlace directo a «${sectionTitle}» listo para compartir.`,
        url,
      });

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title={`Copiar enlace directo a ${sectionTitle}`}
      aria-label={`Compartir enlace de ${sectionTitle}`}
      className={`rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
        copied
          ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]'
          : 'bg-white hover:bg-[#FEF2F2] border border-[#E5E1D8] hover:border-[#FECACA] text-[#081D40] hover:text-[#D62027]'
      } ${sizeClasses[size]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#047857]" />
          {!iconOnly && <span className="font-semibold">Copiado</span>}
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#D62027]" />
          {!iconOnly && <span>{buttonText}</span>}
        </>
      )}
    </button>
  );
};
