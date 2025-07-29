import { useState } from "react";

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  const confirm = (msg: string, callback: () => void) => {
    setMessage(msg);
    setOnConfirm(() => callback);
    setIsOpen(true);
  };

  const ConfirmModal = () =>
    isOpen ? (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl p-6 shadow-2xl w-[360px] max-w-full text-center font-nunito">
          <h2 className="text-lg font-semibold text-negro mb-2">Confirmar acción</h2>
          <p className="text-sm text-gray-700 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setIsOpen(false);
                onConfirm();
              }}
              className="bg-verdeOscuro hover:bg-verdeClaro text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Confirmar
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return { confirm, ConfirmModal };
}
