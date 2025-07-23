import Link from "next/link";
import RecoverPasswordPage from "@/app/(single-page)/authpag/componentes/RequestPasswordPage";
import { routes } from "@/app/routes";
import { FiArrowLeft } from "react-icons/fi";

export default function RequestPassword() {
  return (
    <main className="p-2 pt-11 flex flex-col items-center font-nunito">
      <div className="w-full max-w-6xl flex items-center justify-between">
        <Link
          href={routes.login}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow transition duration-200"
        >
          <FiArrowLeft className="text-lg" />
          Regresar al inicio
        </Link>
      </div>
      <RecoverPasswordPage />
    </main>
  );
}
