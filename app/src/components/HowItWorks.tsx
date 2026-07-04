const steps = [
  {
    emoji: "🍛",
    title: "Pick your meals",
    text: "Browse the menu and add your favourites to the cart.",
  },
  {
    emoji: "📝",
    title: "Checkout",
    text: "Tell us your name, phone number and delivery address.",
  },
  {
    emoji: "💸",
    title: "Pay by transfer",
    text: "Transfer to our account and upload your payment receipt.",
  },
  {
    emoji: "🛵",
    title: "We cook & deliver",
    text: "We confirm your payment, cook it fresh and deliver with a smile.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-forest py-20 text-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-4xl font-black sm:text-5xl">
          How it works
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="rounded-3xl bg-leaf/60 p-6 ring-1 ring-cream/10"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream/10 text-3xl">
                {s.emoji}
              </div>
              <p className="mb-1 text-sm font-bold text-olive-light">
                Step {i + 1}
              </p>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
