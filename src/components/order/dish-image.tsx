import Image from "next/image";
import type { Dish } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import { pick } from "@/i18n/localized";

interface Props {
  dish: Dish;
  locale: Locale;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * Dish photo, or a gold monogram placeholder for dishes that have no photo
 * (drinks, seasonal items). Always fills its positioned parent.
 */
export function DishImage({ dish, locale, sizes, className = "", priority }: Props) {
  if (dish.image) {
    return (
      <Image
        src={dish.image}
        alt={dish.imageAlt ? pick(dish.imageAlt, locale) : pick(dish.name, locale)}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  const monogram = pick(dish.name, locale).trim().charAt(0).toUpperCase();
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-container ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 40%, rgba(242,202,80,0.14), transparent 62%)",
      }}
      aria-hidden="true"
    >
      <span className="font-display text-5xl text-primary/50">{monogram}</span>
      <span className="absolute inset-3 rounded-lg border border-primary/15" />
    </div>
  );
}
