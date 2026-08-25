import Image from "next/image";

export function Hero() {
  return (
    <section className="relative flex h-[85vh] min-h-[560px] items-center justify-center overflow-hidden">
      <Image
        src="/images/pho-bo.png"
        alt="Дымящаяся тарелка премиального Фо Бо на тёмном фоне"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

      <div className="ornamental-border relative z-10 flex flex-col items-center bg-surface-container-lowest/60 p-8 text-center backdrop-blur-sm">
        <h1 className="gold-shimmer mb-4 font-display text-4xl uppercase tracking-widest text-primary md:text-6xl">
          Phở Imperial
        </h1>
        <p className="max-w-lg font-display text-xl tracking-wide text-on-surface-variant md:text-2xl">
          Premium Vietnamese Cuisine in the Heart of Russia
        </p>
      </div>
    </section>
  );
}
