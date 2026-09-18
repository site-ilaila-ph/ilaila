import { ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Button } from "@/presentation/ui/button";

export interface ManagementUser {
  id: string;
  email: string | null;
  userName: string | null;
  isAdmin: boolean;
  _count?: {
    reviews: number;
    bookmarks: number;
  };
}

interface UsersTableProps {
  users: ManagementUser[];
  onToggleAdminRole: (id: string, currentStatus: boolean) => void;
  onDeleteUser: (id: string) => void;
}

export function UsersTable({
  users,
  onToggleAdminRole,
  onDeleteUser,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl bg-card py-16 text-center shadow-sm border border-border">
        <UserRound className="mx-auto mb-3 text-muted-foreground/50" size={30} />
        <p className="text-sm text-muted-foreground">Walang nakitang gumagamit</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-border px-5 py-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-3">
            <input type="checkbox" aria-label="Piliin lahat" /> Gumagamit
          </span>
          <span>Mga Review</span>
          <span>Mga Bookmark</span>
          <span>Tungkulin</span>
          <span />
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/50"
          >
            <span className="text-sm text-muted-foreground">{user.email || 0}</span>
            <span className="text-sm text-muted-foreground">{user._count?.reviews || 0}</span>
            <span className="text-sm text-muted-foreground">{user._count?.bookmarks || 0}</span>
            <span
              className={`flex items-center gap-1.5 text-sm ${
                user.isAdmin ? "font-semibold text-primary" : "text-muted-foreground"
              }`}
            >
              <ShieldCheck size={15} />
              {user.isAdmin ? "Tagapangasiwa" : "Gumagamit"}
            </span>
            <div className="flex justify-end gap-1">
              <Button
                variant={user.isAdmin ? "destructive" : "outline"}
                size="sm"
                className="px-2 text-xs"
                onClick={() => onToggleAdminRole(user.id, user.isAdmin)}
              >
                {user.isAdmin ? "Alisin" : "Admin"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="px-2"
                onClick={() => onDeleteUser(user.id)}
                aria-label={`Tanggalin si ${user.userName || user.email}`}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs transition ${
        active
          ? "bg-primary font-semibold text-primary-foreground shadow-sm"
          : "bg-card text-muted-foreground border border-border hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}

