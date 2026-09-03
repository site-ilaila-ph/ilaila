import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Store,
  Utensils,
  Users,
} from "lucide-react";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef4ff] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 p-4 lg:p-6">
        <aside className="hidden w-56 shrink-0 flex-col rounded-2xl bg-white/90 px-3 py-5 shadow-[0_12px_40px_rgba(65,93,145,0.12)] lg:flex">
          <div className="flex items-center gap-2 px-3 pb-7 text-sm font-bold text-slate-700">
            <div className="grid size-8 place-items-center rounded-lg bg-blue-500 text-white"><BarChart3 size={17} /></div>
            Ilaila Admin
          </div>
          <nav className="space-y-1 text-sm">
            <SidebarLink href="/management" icon={<LayoutDashboard size={16} />} label="Dashboard" />
            <SidebarLink href="/management/businesses" icon={<Store size={16} />} label="Mga Negosyo" />
            <SidebarLink href="/management/foods" icon={<Utensils size={16} />} label="Mga Pagkain" />
            <SidebarLink href="/management/reviews" icon={<MessageSquareText size={16} />} label="Mga Review" />
            <SidebarLink href="/management/users" icon={<Users size={16} />} label="Mga Gumagamit" />
            <SidebarLink href="/management/app-reviews" icon={<ClipboardList size={16} />} label="Review ng App" />
          </nav>
          <div className="mt-auto rounded-xl bg-blue-500 p-3 text-xs text-white shadow-lg shadow-blue-200">
            <p className="font-semibold">Kailangan ng tulong?</p>
            <p className="mt-1 text-blue-100">Tingnan ang dokumentasyon</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">{icon}{label}</Link>;
}