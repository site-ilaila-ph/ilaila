import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BusinessListItem } from "@/app/businesses/types";

export type MenuSort = "popular" | "price-low" | "price-high";

interface BusinessMenuProps {
  business: BusinessListItem;
  menuSort: MenuSort;
  onMenuSortChange: (value: MenuSort) => void;
  visibleMenu: NonNullable<BusinessListItem["menuItems"]>;
}

export function BusinessMenu({
  business,
  menuSort,
  onMenuSortChange,
  visibleMenu,
}: BusinessMenuProps) {
  return (
    <>
      {business.history && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Kasaysayan</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{business.history}</p>
        </section>
      )}

      {business.foods && business.foods.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Mga Pagkaing Inihahain</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {business.foods.map((bf) => (
              <Link
                key={bf.id}
                href={`/foods/${bf.food.id}`}
                className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:bg-card/50"
              >
                <h3 className="font-semibold text-primary hover:underline">{bf.food.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bf.food.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {business.menuItems && business.menuItems.length > 0 && (
        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Menu</h2>
            <Select value={menuSort} onValueChange={(value) => onMenuSortChange(value as MenuSort)}>
              <SelectTrigger className="w-56 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Ayusin ang menu</SelectItem>
                <SelectItem value="price-low">Presyo: mababa hanggang mataas</SelectItem>
                <SelectItem value="price-high">Presyo: mataas hanggang mababa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {visibleMenu.map((item) => (
              <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <p className="font-semibold text-primary">PHP {item.price.toString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

