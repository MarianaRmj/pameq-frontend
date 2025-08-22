// app/dashboard/activities/ConfirmDialog.tsx
'use client';

export function ConfirmDialog({
  title,
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
        <h3 className="text-base font-nunito text-[#2A5559]">{title}</h3>
        {description && (
          <div className="mt-2 text-sm text-gray-700">{description}</div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="ui-btn"> {cancelText} </button>
          <button
            onClick={onConfirm}
            className={`ui-btn ${variant === 'danger' ? 'bg-rose-600 text-white border-rose-600 hover:opacity-95' : 'ui-btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
