"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinessByIdAction } from "@/app/(session-gated)/business/actions";
import type { BusinessWithIncludes } from "@/app/(session-gated)/business/services";

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [business, setBusiness] = useState<BusinessWithIncludes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBusiness() {
      const resolvedParams = await params;
      const result = await getBusinessByIdAction(resolvedParams.id);

      if (!isMounted) return;

      if (result.success) {
        setBusiness(result.data ?? null);
      } else {
        setBusiness(null);
      }

      setIsLoading(false);
    }

    void loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Business not found</p>
          <Link href="/business/discovery" className="mt-4 inline-block text-primary hover:underline">
            Back to businesses
          </Link>
        </div>
      </main>
    );
  }

  const averageRating = business.reviews.length > 0
    ? Math.round(
        (business.reviews.reduce(
          (sum, r) => sum + (r.foodQuality + r.service + r.ambiance + r.value) / 4,
          0
        ) /
          business.reviews.length) *
          10
      ) / 10
    : 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <Link href="/business/discovery" className="text-sm text-muted-foreground hover:text-foreground">
            Back to businesses
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12 border-b border-border pb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{business.name}</h1>
          <p className="mb-4 text-lg text-muted-foreground">{business.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold text-primary">{averageRating}/5</p>
              <p className="text-xs text-muted-foreground">({business.reviews.length} reviews)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-lg font-semibold">{business.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hours</p>
              <p className="text-lg font-semibold">{business.hours}</p>
            </div>
          </div>

          {business.tags && business.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {business.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {business.history && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">History</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {business.history}
                </p>
              </section>
            )}

            {business.foods && business.foods.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Foods Served</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {business.foods.map((bf) => (
                    <Link
                      key={bf.id}
                      href={`/foods/${encodeURIComponent(bf.food.name)}`}
                      className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:bg-card/50"
                    >
                      <h3 className="font-semibold text-primary hover:underline">
                        {bf.food.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {bf.food.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {business.menuItems && business.menuItems.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Menu</h2>
                <div className="space-y-4">
                  {business.menuItems.map((item) => (
                    <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-primary">₱{item.price.toString()}</p>
                      </div>
                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {item.dietaryTags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {business.reviews && business.reviews.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-card p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{review.user.userName}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Food: {review.foodQuality}/5</span>
                          <span>Service: {review.service}/5</span>
                          <span>Ambiance: {review.ambiance}/5</span>
                          <span>Value: {review.value}/5</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        👍 {review.upvotes} {review.upvotes === 1 ? "upvote" : "upvotes"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Address</dt>
                    <dd className="mt-1">{business.address}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Hours</dt>
                    <dd className="mt-1">{business.hours}</dd>
                  </div>
                </dl>
              </div>

              {business.images && business.images.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Gallery</h3>
                  <div className="space-y-2">
                    {business.images.map((image) => (
                      <div key={image.id} className="text-sm text-muted-foreground">
                        {image.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
