'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card rounded-2xl p-6 max-w-sm w-full space-y-4 animate-[fadeIn_0.2s_ease-out]">
        {title && (
          <h3 className="text-lg font-bold">{title}</h3>
        )}
        <p className="text-sm text-[--text-secondary] leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors text-sm"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium text-[--text-muted] bg-[--surface-secondary] hover:bg-[--surface-secondary] transition-colors text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
