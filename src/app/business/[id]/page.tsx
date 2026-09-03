"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Star, ThumbsUp } from "lucide-react";
import { createReviewAction, getBusinessByIdAction, getBusinessesAction, upvoteReviewAction } from "@/app/business/actions";
import type { BusinessListItem } from "@/app/business/services";
import type { SerializableBusinessWithIncludes } from "@/app/business/services";
import { useSession } from "@/lib/session/client";
import { Button } from "@/lib/components/actions/button";

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [business, setBusiness] = useState<SerializableBusinessWithIncludes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuFilter, setMenuFilter] = useState("All");
  const [menuSort, setMenuSort] = useState<"popular" | "price-low" | "price-high">("popular");
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewScores, setReviewScores] = useState({ foodQuality: 5, service: 5, ambiance: 5, value: 5 });
  const [relatedBusinesses, setRelatedBusinesses] = useState<BusinessListItem[]>([]);
  const session = useSession();

  useEffect(() => {
    let isMounted = true;

    async function loadBusiness() {
      const resolvedParams = await params;
      const result = await getBusinessByIdAction(resolvedParams.id);

      if (!isMounted) return;

      if (result.success) {
        setBusiness(result.data ?? null);
        const allBusinesses = await getBusinessesAction({});
        if (allBusinesses.success && result.data) {
          const tags = new Set(result.data.tags.map((tag) => tag.value));
          setRelatedBusinesses((allBusinesses.data ?? []).filter((item) => item.id !== result.data?.id && item.tags.some((tag) => tags.has(tag.value))).slice(0, 3));
        }
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
  const metricRatings = [
    ["Food quality", business.reviews.reduce((sum, review) => sum + review.foodQuality, 0)],
    ["Service", business.reviews.reduce((sum, review) => sum + review.service, 0)],
    ["Ambiance", business.reviews.reduce((sum, review) => sum + review.ambiance, 0)],
    ["Value", business.reviews.reduce((sum, review) => sum + review.value, 0)],
  ];
  const menuTags = ["All", ...new Set(business.menuItems.flatMap((item) => item.dietaryTags))];
  const visibleMenu = [...(menuFilter === "All" ? business.menuItems : business.menuItems.filter((item) => item.dietaryTags.includes(menuFilter)))].sort((a, b) => menuSort === "price-low" ? Number(a.price) - Number(b.price) : menuSort === "price-high" ? Number(b.price) - Number(a.price) : a.name.localeCompare(b.name));
  const businessId = business.id;

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.user.id || reviewText.length < 10) {
      setReviewMessage("Sign in and write at least 10 characters to leave a review.");
      return;
    }
    const result = await createReviewAction({ userId: session.user.id, businessId, text: reviewText, ...reviewScores });
    setReviewMessage(result.success ? "Your review was saved." : "We could not save your review yet.");
    if (result.success) setReviewText("");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-foreground">
      <nav className="border-b border-[#dfe5dc] bg-[#f7f8f4]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="font-heading text-xl font-bold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <Link href="/business/discovery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All businesses
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12 border-b border-[#dfe5dc] pb-10">
          <div className="mb-8 flex min-h-64 items-end bg-[#234d43] p-7 text-white sm:p-10"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#d5e8d8]">San Pedro, Laguna</p><h1 className="font-heading text-5xl font-bold leading-none sm:text-7xl">{business.name}</h1></div></div>
          <p className="mb-7 max-w-3xl text-lg leading-relaxed text-muted-foreground">{business.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="flex items-center gap-2 text-2xl font-bold text-primary"><Star className="size-5 fill-[#e47b45] text-[#e47b45]" />{averageRating}/5</p>
              <p className="text-xs text-muted-foreground">({business.reviews.length} reviews)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-lg font-semibold">{business.address}</p><a className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`} target="_blank" rel="noreferrer">Get directions <ExternalLink className="size-3" /></a>
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
          {business.reviews.length > 0 && (
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
              {metricRatings.map(([label, total]) => (
                <div key={label as string} className="border-l-2 border-[#e47b45] pl-3">
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className="mt-1 font-semibold">{((total as number) / business.reviews.length).toFixed(1)} / 5</p>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
                <div className="mb-5 flex flex-wrap gap-2"><div className="flex gap-2 overflow-x-auto pb-1">{menuTags.map((item) => <button key={item} onClick={() => setMenuFilter(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${menuFilter === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white"}`}>{item}</button>)}</div><select value={menuSort} onChange={(event) => setMenuSort(event.target.value as typeof menuSort)} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"><option value="popular">Sort menu</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
                <div className="space-y-4">
                  {visibleMenu.map((item) => (
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
                        <p className="font-semibold text-primary">PHP {item.price.toString()}</p>
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
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Food: {review.foodQuality}/5</span>
                          <span>Service: {review.service}/5</span>
                          <span>Ambiance: {review.ambiance}/5</span>
                          <span>Value: {review.value}/5</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                      <button onClick={() => void upvoteReviewAction({ reviewId: review.id })} className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><ThumbsUp className="size-3.5" /> {review.upvotes} helpful</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-border pt-8"><h2 className="mb-4 font-heading text-2xl font-bold">Share your experience</h2><form onSubmit={submitReview} className="space-y-3"><div className="grid gap-3 sm:grid-cols-4">{Object.entries(reviewScores).map(([key, score]) => <label key={key} className="text-xs font-medium text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}<select value={score} onChange={(event) => setReviewScores({ ...reviewScores, [key]: Number(event.target.value) })} className="mt-1 block w-full border border-border bg-white px-2 py-2 text-sm text-foreground">{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>)}</div><textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="What should people know before they go?" rows={4} className="w-full border border-border bg-white p-3 text-sm outline-none focus:border-primary" /><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Your review covers food, service, ambiance, and value.</span><Button type="submit">Publish review</Button></div>{reviewMessage && <p className="text-sm text-muted-foreground">{reviewMessage}</p>}</form></section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="flex items-center gap-1 font-medium text-muted-foreground"><MapPin className="size-3.5" />Address</dt>
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
              <div className="overflow-hidden border border-border bg-white"><h3 className="p-6 pb-3 text-lg font-semibold">Find it on the map</h3><iframe title={`Map showing ${business.name}`} className="h-52 w-full border-0" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.01}%2C${business.latitude - 0.01}%2C${business.longitude + 0.01}%2C${business.latitude + 0.01}&layer=mapnik&marker=${business.latitude}%2C${business.longitude}`} /><a className="block p-4 text-sm text-primary hover:underline" href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`} target="_blank" rel="noreferrer">Open directions</a></div>
              {relatedBusinesses.length > 0 && <div className="border border-border bg-white p-6"><h3 className="mb-4 text-lg font-semibold">You may also like</h3><div className="space-y-4">{relatedBusinesses.map((item) => <Link key={item.id} href={`/business/${encodeURIComponent(item.name.toLowerCase().replaceAll(" ", "-"))}`} className="group block"><p className="font-semibold group-hover:text-primary">{item.name}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p></Link>)}</div></div>}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

/*
 * LEGACY VERSION - intentionally disabled for reference.
 * Original profile code, before the profile enhancements above:
 *
 * import { getBusinessByIdAction } from "@/app/business/actions";
 *
 * export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
 *   const [business, setBusiness] = useState<BusinessWithIncludes | null>(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     let isMounted = true;
 *     async function loadBusiness() {
 *       const resolvedParams = await params;
 *       const result = await getBusinessByIdAction(resolvedParams.id);
 *       if (!isMounted) return;
 *       setBusiness(result.success ? result.data ?? null : null);
 *       setIsLoading(false);
 *     }
 *     void loadBusiness();
 *     return () => { isMounted = false; };
 *   }, [params]);
 *
 *   if (isLoading) return <main className="min-h-screen bg-background text-foreground"><nav className="border-b border-border bg-card/80 backdrop-blur"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"><Link href="/home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">Ilaila</Link></div></nav><div className="mx-auto max-w-6xl px-6 py-20 text-center"><p className="text-muted-foreground">Loading business details...</p></div></main>;
 *   if (!business) return <main className="min-h-screen bg-background text-foreground"><nav className="border-b border-border bg-card/80 backdrop-blur"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"><Link href="/home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">Ilaila</Link></div></nav><div className="mx-auto max-w-6xl px-6 py-20 text-center"><p className="text-muted-foreground">Business not found</p><Link href="/business/discovery" className="mt-4 inline-block text-primary hover:underline">Back to businesses</Link></div></main>;
 *
 *   const averageRating = business.reviews.length > 0 ? Math.round((business.reviews.reduce((sum, r) => sum + (r.foodQuality + r.service + r.ambiance + r.value) / 4, 0) / business.reviews.length) * 10) / 10 : 0;
 *   return <main className="min-h-screen bg-background text-foreground"><nav className="border-b border-border bg-card/80 backdrop-blur"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"><Link href="/home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">Ilaila</Link><Link href="/business/discovery" className="text-sm text-muted-foreground hover:text-foreground">Back to businesses</Link></div></nav><article className="mx-auto max-w-4xl px-6 py-12"><header className="mb-12 border-b border-border pb-8"><h1 className="mb-4 text-4xl font-bold tracking-tight">{business.name}</h1><p className="mb-4 text-lg text-muted-foreground">{business.description}</p><div className="flex flex-wrap gap-4"><div><p className="text-sm font-medium text-muted-foreground">Rating</p><p className="text-2xl font-bold text-primary">{averageRating}/5</p><p className="text-xs text-muted-foreground">({business.reviews.length} reviews)</p></div><div><p className="text-sm font-medium text-muted-foreground">Location</p><p className="text-lg font-semibold">{business.address}</p></div><div><p className="text-sm font-medium text-muted-foreground">Hours</p><p className="text-lg font-semibold">{business.hours}</p></div></div>{business.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{business.tags.map((tag) => <span key={tag.id} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{tag.value}</span>)}</div>}</header><div className="grid gap-12 lg:grid-cols-3"><div className="lg:col-span-2">{business.history && <section className="mb-12"><h2 className="mb-4 text-2xl font-semibold">History</h2><p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{business.history}</p></section>}{business.foods.length > 0 && <section className="mb-12"><h2 className="mb-4 text-2xl font-semibold">Foods Served</h2><div className="grid gap-4 sm:grid-cols-2">{business.foods.map((bf) => <Link key={bf.id} href={`/foods/${encodeURIComponent(bf.food.name)}`} className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:bg-card/50"><h3 className="font-semibold text-primary hover:underline">{bf.food.name}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bf.food.description}</p></Link>)}</div></section>}{business.menuItems.length > 0 && <section className="mb-12"><h2 className="mb-4 text-2xl font-semibold">Menu</h2><div className="space-y-4">{business.menuItems.map((item) => <div key={item.id} className="border-b border-border pb-4 last:border-b-0"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{item.name}</h3>{item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}</div><p className="font-semibold text-primary">₱{item.price.toString()}</p></div>{item.dietaryTags.length > 0 && <div className="mt-2 flex gap-2">{item.dietaryTags.map((tag, idx) => <span key={idx} className="text-xs text-muted-foreground">{tag}</span>)}</div>}</div>)}</div></section>}{business.reviews.length > 0 && <section className="mb-12"><h2 className="mb-4 text-2xl font-semibold">Reviews</h2><div className="space-y-4">{business.reviews.map((review) => <div key={review.id} className="rounded-lg border border-border bg-card p-6"><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">{review.user.userName}</h3><div className="flex gap-4 text-sm text-muted-foreground"><span>Food: {review.foodQuality}/5</span><span>Service: {review.service}/5</span><span>Ambiance: {review.ambiance}/5</span><span>Value: {review.value}/5</span></div></div><p className="text-muted-foreground">{review.text}</p><p className="mt-2 text-xs text-muted-foreground">👍 {review.upvotes} {review.upvotes === 1 ? "upvote" : "upvotes"}</p></div>)}</div></section>}</div><aside className="lg:col-span-1"><div className="sticky top-6 space-y-4"><div className="rounded-lg border border-border bg-card p-6"><h3 className="mb-4 text-lg font-semibold">Contact Info</h3><dl className="space-y-3 text-sm"><div><dt className="font-medium text-muted-foreground">Address</dt><dd className="mt-1">{business.address}</dd></div><div><dt className="font-medium text-muted-foreground">Hours</dt><dd className="mt-1">{business.hours}</dd></div></dl></div>{business.images.length > 0 && <div className="rounded-lg border border-border bg-card p-6"><h3 className="mb-4 text-lg font-semibold">Gallery</h3><div className="space-y-2">{business.images.map((image) => <div key={image.id} className="text-sm text-muted-foreground">{image.description}</div>)}</div></div>}</div></aside></div></article></main>;
 * }
 */
