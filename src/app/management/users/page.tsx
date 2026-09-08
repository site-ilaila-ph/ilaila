"use client";

import { useEffect, useState } from "react";
import { getAllUsersForManagement } from "@/app/management/services";
import { updateUserRoleAction, deleteUserAction } from "@/app/management/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";

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
    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      try {
        await deleteUserAction(userId);
        await loadUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="mt-1 text-muted-foreground">Manage user accounts and roles</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.userName || "No username"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>Reviews: {user._count?.reviews || 0}</span>
                      <span>Bookmarks: {user._count?.bookmarks || 0}</span>
                      <span className={`font-semibold ${user.isAdmin ? "text-primary" : "text-muted-foreground"}`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={user.isAdmin ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
