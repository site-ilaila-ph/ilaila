"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("/api/management/users");
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load users"));
      const data = await response.json();
      setUsers(data as User[]);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAdminRole(userId: string, currentIsAdmin: boolean) {
    try {
      const response = await fetch("/api/management/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin }),
      });
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to update user role"));
      await loadUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setError(error instanceof Error ? error.message : "Failed to update user role");
    }
  }

  async function handleDelete(userId: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang user na ito? Hindi na ito maaaring ibalik.")) {
      try {
        const response = await fetch(`/api/management/users?id=${encodeURIComponent(userId)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to delete user"));
        await loadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        setError(error instanceof Error ? error.message : "Failed to delete user");
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
          <p className="mb-2 text-xs font-medium text-muted-foreground">Mga Pahina / Mga Gumagamit</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mga Gumagamit</h1>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-sm border border-border sm:w-64 sm:flex-none">
            <Search size={16} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Maghanap" suppressHydrationWarning className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
          <button type="button" aria-label="Higit pang mga opsyon" className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground border border-border shadow-sm transition hover:text-primary"><MoreHorizontal size={19} /></button>
        </div>
      </div>

      <ErrorAlert message={error} className="mb-4" onDismiss={() => setError(null)} />

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <FilterButton label={`Mga Aktibong Gumagamit ${users.length}`} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
        <FilterButton label={`Mga Tagapangasiwa ${users.filter((user) => user.isAdmin).length}`} active={activeFilter === "admins"} onClick={() => setActiveFilter("admins")} />
        <FilterButton label={`Mga Karaniwang Gumagamit ${users.filter((user) => !user.isAdmin).length}`} active={activeFilter === "users"} onClick={() => setActiveFilter("users")} />
      </div>

        {isLoading ? (
          <div className="rounded-2xl bg-card py-16 text-center shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Ikinakarga ang mga gumagamit...</p>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="rounded-2xl bg-card py-16 text-center shadow-sm border border-border">
            <UserRound className="mx-auto mb-3 text-muted-foreground/50" size={30} />
            <p className="text-sm text-muted-foreground">Walang nakitang gumagamit</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-border px-5 py-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-3"><input type="checkbox" aria-label="Piliin lahat" /> Gumagamit</span><span>Mga Review</span><span>Mga Bookmark</span><span>Tungkulin</span><span />
              </div>
              {visibleUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{user.email.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{user.userName || "Walang username"}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{user._count?.reviews || 0}</span>
                  <span className="text-sm text-muted-foreground">{user._count?.bookmarks || 0}</span>
                  <span className={`flex items-center gap-1.5 text-sm ${user.isAdmin ? "font-semibold text-primary" : "text-muted-foreground"}`}><ShieldCheck size={15} />{user.isAdmin ? "Tagapangasiwa" : "Gumagamit"}</span>
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
  return <button type="button" onClick={onClick} className={`rounded-full px-3.5 py-2 text-xs transition ${active ? "bg-primary font-semibold text-primary-foreground shadow-sm" : "bg-card text-muted-foreground border border-border hover:text-primary"}`}>{label}</button>;
}
