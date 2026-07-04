"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Footer() {
  const settings = useQuery(api.settings.getAll) as
    | Record<string, string>
    | undefined;

  const phone = settings?.phone ?? "+234 913 547 1036";
  const whatsapp = (settings?.whatsapp ?? "+2349135471036").replace(/\s/g, "");
  const email = settings?.email ?? "lach.eatnsmilekitchen@gmail.com";
  const address =
    settings?.address ??
    "7B Road C, Oba Adeyinka Oyekan, Lekki Phase I, Lagos State";

  return (
    <footer id="contact" className="bg-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/logo.png"
            alt="Lach Eat & Smile Kitchen"
            className="h-14 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-forest/60">
            Fresh, homemade Nigerian food from our kitchen in Lekki Phase 1 to
            your table. Eat & smile!
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-bold">Find us</h4>
          <p className="mt-3 text-sm leading-relaxed text-forest/70">
            {address}
          </p>
          <p className="mt-2 text-sm text-forest/70">
            {settings?.deliveryNote ??
              "We deliver across Lekki & environs."}
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-bold">Talk to us</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a
              href={`https://wa.me/${whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-leaf hover:text-flame"
            >
              💬 WhatsApp us
            </a>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-flame">
              📞 {phone}
            </a>
            <a href={`mailto:${email}`} className="hover:text-flame">
              ✉️ {email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-forest/10 py-5 text-center text-xs text-forest/50">
        © {new Date().getFullYear()} Lach Eat & Smile Kitchen · Made fresh in
        Lagos 🇳🇬
      </div>
    </footer>
  );
}
