"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getManagementStats } from "@/app/management/services";

export default function ManagementDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    businesses: 0,
    foods: 0,
    reviews: 0,
    appReviews: 0,
    pendingAppReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getManagementStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your website content and users</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-4 mb-12">
            <StatCard label="Total Users" value={stats.users} />
            <StatCard label="Businesses" value={stats.businesses} />
            <StatCard label="Foods" value={stats.foods} />
            <StatCard label="Reviews" value={stats.reviews} />
            <StatCard label="App Reviews" value={stats.appReviews} highlight={stats.pendingAppReviews > 0} />
            {stats.pendingAppReviews > 0 && (
              <StatCard label="Pending Reviews" value={stats.pendingAppReviews} variant="warning" />
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ManagementCard
            title="Businesses"
            description="Create, edit, and delete businesses"
            href="/management/businesses"
          />
          <ManagementCard
            title="Foods"
            description="Manage heritage food items"
            href="/management/foods"
          />
          <ManagementCard
            title="Reviews"
            description="Moderate and manage reviews"
            href="/management/reviews"
          />
          <ManagementCard
            title="Users"
            description="Manage user accounts and roles"
            href="/management/users"
          />
          <ManagementCard
            title="App Reviews"
            description="Manage user feedback about the application"
            href="/management/app-reviews"
            badge={stats.pendingAppReviews > 0 ? `${stats.pendingAppReviews} pending` : undefined}
          />
          <ManagementCard
            title="Settings"
            description="Configure site settings"
            href="/management/settings"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  highlight = false,
  variant = "default"
}: { 
  label: string; 
  value: number;
  highlight?: boolean;
  variant?: "default" | "warning";
}) {
  const backgroundColor = variant === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-card border-border";
  const textColor = variant === "warning" ? "text-yellow-700" : "";
  
  return (
    <div className={`rounded-lg border ${backgroundColor} p-6 ${highlight ? "ring-2 ring-yellow-300" : ""}`}>
      <p className={`text-sm text-muted-foreground ${textColor}`}>{label}</p>
      <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function ManagementCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:bg-card/90"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4 text-sm text-primary">Manage →</div>
        </div>
        {badge && (
          <div className="ml-2 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
            {badge}
          </div>
        )}
      </div>
    </Link>
  );
}
