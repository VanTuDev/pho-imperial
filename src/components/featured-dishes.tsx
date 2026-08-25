import Image from "next/image";
import { featuredDishes } from "@/data/menu";

export function FeaturedDishes() {
  return (
    <section className="bamboo-pattern relative px-margin-mobile py-section md:px-section">
      <div className="container-imperial">
        <div className="mb-12 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-primary/50 md:w-24" />
          <h3 className="text-center font-display text-2xl uppercase tracking-widest text-primary">
            Featured Dishes
          </h3>
          <div className="h-px w-16 bg-primary/50 md:w-24" />
        </div>

        <div className="grid grid-cols-1 gap-x-gutter gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDishes.map((dish) => (
            <div key={dish.slug} className="flex items-start gap-6">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-sm border border-primary/50 shadow-[0_0_15px_rgba(242,202,80,0.15)]">
                <Image
                  src={dish.image}
                  alt={dish.imageAlt}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-primary/20" />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <h4 className="font-display text-2xl text-primary">
                    {dish.name}
                  </h4>
                  <span className="whitespace-nowrap font-display text-2xl text-primary">
                    {dish.priceLabel}
                  </span>
                </div>
                <p className="border-b border-outline-variant/30 pb-4 font-body text-sm text-on-surface-variant">
                  {dish.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
