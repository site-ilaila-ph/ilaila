"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { getAllUsersForManagement } from "@/app/management/services";
import { updateUserRoleAction, deleteUserAction } from "@/app/management/actions";
import { Button } from "@/lib/components/actions/button";

interface User {
  id: string;
  email: string;
  userName: string | null;
  isAdmin: boolean;
  createdAt: Date;
  _count?: {
    reviews: number;
    bookmarks: number;
  };
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "admins" | "users">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAllUsersForManagement();
      setUsers(data as User[]);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAdminRole(userId: string, currentIsAdmin: boolean) {
    try {
      await updateUserRoleAction({ userId, isAdmin: !currentIsAdmin });
      await loadUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  }

  async function handleDelete(userId: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang user na ito? Hindi na ito maaaring ibalik.")) {
      try {
        await deleteUserAction(userId);
        await loadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  }

  const visibleUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || user.email.toLowerCase().includes(query) || (user.userName?.toLowerCase().includes(query) ?? false);
    const matchesFilter = activeFilter === "all" || (activeFilter === "admins" ? user.isAdmin : !user.isAdmin);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">Mga Pahina / Mga Gumagamit</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mga Gumagamit</h1>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-slate-400 shadow-sm sm:w-64 sm:flex-none">
            <Search size={16} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Maghanap" className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
          <button type="button" aria-label="Higit pang mga opsyon" className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-blue-500"><MoreHorizontal size={19} /></button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <FilterButton label={`Mga Aktibong Gumagamit ${users.length}`} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
        <FilterButton label={`Mga Tagapangasiwa ${users.filter((user) => user.isAdmin).length}`} active={activeFilter === "admins"} onClick={() => setActiveFilter("admins")} />
        <FilterButton label={`Mga Karaniwang Gumagamit ${users.filter((user) => !user.isAdmin).length}`} active={activeFilter === "users"} onClick={() => setActiveFilter("users")} />
      </div>

        {isLoading ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <p className="text-sm text-slate-400">Ikinakarga ang mga gumagamit...</p>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <UserRound className="mx-auto mb-3 text-slate-300" size={30} />
            <p className="text-sm text-slate-400">Walang nakitang gumagamit</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-3"><input type="checkbox" aria-label="Piliin lahat" /> Gumagamit</span><span>Mga Review</span><span>Mga Bookmark</span><span>Tungkulin</span><span />
              </div>
              {visibleUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">{(user.userName || user.email).charAt(0).toUpperCase()}</div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{user.userName || "Walang username"}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
                  </div>
                  <span className="text-sm text-slate-600">{user._count?.reviews || 0}</span>
                  <span className="text-sm text-slate-600">{user._count?.bookmarks || 0}</span>
                  <span className={`flex items-center gap-1.5 text-sm ${user.isAdmin ? "font-semibold text-blue-600" : "text-slate-500"}`}><ShieldCheck size={15} />{user.isAdmin ? "Tagapangasiwa" : "Gumagamit"}</span>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant={user.isAdmin ? "destructive" : "outline"}
                      size="sm"
                      className="px-2 text-xs"
                      onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? "Alisin" : "Admin"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="px-2"
                      onClick={() => handleDelete(user.id)}
                      aria-label={`Tanggalin si ${user.userName || user.email}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-3.5 py-2 text-xs transition ${active ? "bg-blue-500 font-semibold text-white shadow-sm" : "bg-white text-slate-500 hover:text-blue-500"}`}>{label}</button>;
}
