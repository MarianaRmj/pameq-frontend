import Sidebar from "./componente/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#F9FAFB] p-6 overflow-auto">{children}</main>
    </div>
  );
}