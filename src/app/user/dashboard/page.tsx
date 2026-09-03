"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";

export default function UserDashboard() {
  const user: { userName?: string; email?: string } = {};
  const [stats] = useState({
    reviews: 0,
    bookmarks: 0,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/sign-out">
              <Button variant="outline">Sign Out</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your Ilaila dashboard</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-12">
          <StatCard label="Reviews" value={stats.reviews} />
          <StatCard label="Bookmarks" value={stats.bookmarks} />
          <StatCard label="Visited" value={0} />
          <StatCard label="Activities" value={0} />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">No bookmarks yet</p>
              <Link href="/business/discovery">
                <Button>Browse Businesses</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">No reviews yet</p>
              <Link href="/business/discovery">
                <Button>Write a Review</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Username:</span> {user?.userName || "Not set"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Email:</span> {user?.email || "—"}
                </p>
              </div>
              <Link href="/user/settings" className="mt-4 block">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/business/discovery" className="block text-primary hover:underline">
                → Explore Businesses
              </Link>
              <Link href="/foods" className="block text-primary hover:underline">
                → Heritage Foods
              </Link>
              <Link href="/about/the-website" className="block text-primary hover:underline">
                → About Us
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
