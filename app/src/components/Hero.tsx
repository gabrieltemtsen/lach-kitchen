export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:pt-20">
        <div className="animate-fade-up">
          <p className="mb-4 inline-block rounded-full bg-olive/15 px-4 py-1.5 text-sm font-semibold tracking-wide text-olive">
            Home kitchen · Lekki Phase 1, Lagos
          </p>
          <h1 className="font-display text-5xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
            Real Naija comfort food,{" "}
            <span className="text-flame">made fresh.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-forest/70">
            Efo Riro that tastes like home. Akara fried to order. Soft, warm
            Masa. Cooked with love — delivered to your door.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#menu"
              className="rounded-full bg-flame px-8 py-4 text-base font-bold text-white shadow-lg shadow-flame/30 transition hover:-translate-y-0.5 hover:bg-flame-dark"
            >
              Order now
            </a>
            <a
              href="#how"
              className="rounded-full border-2 border-forest/20 px-8 py-4 text-base font-bold text-forest transition hover:border-forest"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          <video
            className="animate-floaty col-span-1 aspect-[3/4] w-full rounded-[2rem] object-cover shadow-xl"
            src="/media/efo-riro.mp4"
            poster="/media/efo-riro-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/akara-1.jpg"
            alt="Akara — fresh bean cakes"
            className="animate-floaty col-span-1 mt-10 aspect-[3/4] w-full rounded-[2rem] object-cover shadow-xl [animation-delay:1.5s]"
          />
          <div className="absolute -left-4 top-6 rotate-[-6deg] rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-lg">
            🍲 Efo Riro
          </div>
          <div className="absolute -right-2 bottom-8 rotate-[5deg] rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-lg">
            😋 Fresh Akara
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="border-y-2 border-forest bg-forest py-3 text-cream">
        <div className="flex overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 gap-8 pr-8 font-display text-lg font-semibold tracking-wide">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex gap-8">
                <span>FRESHLY COOKED ✦</span>
                <span>MADE WITH LOVE ✦</span>
                <span>EAT & SMILE ✦</span>
                <span>LEKKI · LAGOS ✦</span>
                <span>ORDER ONLINE ✦</span>
                <span>FRESHLY COOKED ✦</span>
                <span>MADE WITH LOVE ✦</span>
                <span>EAT & SMILE ✦</span>
                <span>LEKKI · LAGOS ✦</span>
                <span>ORDER ONLINE ✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
