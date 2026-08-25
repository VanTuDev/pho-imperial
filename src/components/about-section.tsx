import Image from "next/image";

export function AboutSection() {
  return (
    <section
      id="about"
      className="bamboo-pattern container-imperial px-margin-mobile py-section md:px-section"
    >
      <div className="flex flex-col items-center gap-gutter md:flex-row">
        <div className="w-full md:w-1/2">
          <h2 className="mb-6 font-display text-2xl tracking-wide text-primary">
            The Imperial Legacy
          </h2>
          <p className="mb-4 font-body text-lg leading-relaxed text-on-surface-variant">
            Immerse yourself in the authentic flavors of Vietnam, crafted with
            centuries-old traditional recipes and the finest premium
            ingredients. Our culinary journey brings the opulent dining
            experience of the imperial courts directly to your table.
          </p>
          <button
            type="button"
            className="border border-primary px-8 py-3 font-body text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            Discover Our Story
          </button>
        </div>
        <div className="relative h-96 w-full overflow-hidden rounded-sm border border-outline-variant/30 md:w-1/2">
          <Image
            src="/images/nem-ga.png"
            alt="Хрустящие вьетнамские блинчики, приготовленные с вниманием к деталям"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
