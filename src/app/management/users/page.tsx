"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { ManagementHeader } from "@/components/management-header";
import { ManagementSearchBar } from "@/components/management-search-bar";
import { UsersTable, FilterButton, type ManagementUser } from "@/components/users-table";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

export default function ManageUsers() {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "admins" | "users">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch("/api/management/users");
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load users"));
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleAdminRole(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/management/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to update user"));
      await loadUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      setError(error instanceof Error ? error.message : "Failed to update user");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang gumagamit na ito?")) {
      try {
        const response = await fetch(`/api/management/users/${id}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
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
    const matchesQuery = !query || user.email?.toLowerCase().includes(query) || user.userName?.toLowerCase().includes(query);
    if (!matchesQuery) return false;

    if (activeFilter === "admins") return user.isAdmin;
    if (activeFilter === "users") return !user.isAdmin;
    return true;
  });

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <ManagementHeader
        breadcrumb="Mga Pahina / Mga Gumagamit"
        title="Mga Gumagamit"
      >
        <ManagementSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <button
          type="button"
          aria-label="Higit pang mga opsyon"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground border border-border shadow-sm transition hover:text-primary"
        >
          <MoreHorizontal size={19} />
        </button>
      </ManagementHeader>

      <ErrorAlert message={error} className="mb-4" onDismiss={() => setError(null)} />

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <FilterButton
          label={`Mga Aktibong Gumagamit ${users.length}`}
          active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        />
        <FilterButton
          label={`Mga Tagapangasiwa ${users.filter((user) => user.isAdmin).length}`}
          active={activeFilter === "admins"}
          onClick={() => setActiveFilter("admins")}
        />
        <FilterButton
          label={`Mga Karaniwang Gumagamit ${users.filter((user) => !user.isAdmin).length}`}
          active={activeFilter === "users"}
          onClick={() => setActiveFilter("users")}
        />
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-card py-16 text-center shadow-sm border border-border">
          <p className="text-sm text-muted-foreground">Ikinakarga ang mga gumagamit...</p>
        </div>
      ) : (
        <UsersTable
          users={visibleUsers}
          onToggleAdminRole={toggleAdminRole}
          onDeleteUser={handleDelete}
        />
      )}
    </div>
  );
}
