"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Phone, List, X, CaretDown } from "@phosphor-icons/react";
import { BIZ, SERVICES, BASE_PATH } from "../_lib/site";

const head = "font-[family-name:var(--font-playfair)]";
const body = "font-[family-name:var(--font-inter)]";

/** Sticky header with a Services menu. `base` is "" on the client's own domain. */
export default function Header({ base }: { base: string }) {
  const [open, setOpen] = useState(false);
  const [svc, setSvc] = useState(false);
  const home = base || "/";
  const links = [
    { href: `${base}/gallery`, label: "Our Work" },
    { href: `${home}#about`, label: "About" },
    { href: `${home}#reviews`, label: "Reviews" },
    { href: `${home}#contact`, label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur border-b border-[#234E36]/15 shadow-sm">
      <div className="max-w-6xl mx-auto px-5 h-[70px] flex items-center justify-between gap-4">
        <a href={home} className="flex items-center gap-3 min-w-0">
          <img src={`${BASE_PATH}/logo-128.webp`} alt="Mountain View Landscape & Design logo" width={44} height={44} className="h-11 w-11 object-contain shrink-0" />
          <span className={`${head} font-semibold text-[19px] sm:text-[21px] text-[#20241C] leading-none truncate`}>Mountain&nbsp;View</span>
        </a>
        <nav className={`hidden md:flex items-center gap-6 ${body} text-[16px] font-medium text-[#3E4435]`}>
          <div className="relative" onMouseEnter={() => setSvc(true)} onMouseLeave={() => setSvc(false)}>
            <button
              type="button"
              onClick={() => setSvc(!svc)}
              aria-expanded={svc}
              className="inline-flex items-center gap-1 hover:text-[#2F7D4F] transition-colors"
            >
              Services <CaretDown size={14} weight="bold" />
            </button>
            {svc && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3">
                <div className="w-[440px] grid grid-cols-2 gap-x-2 bg-[#FBF8F1] border border-[#A8A294]/30 rounded-2xl shadow-[0_18px_40px_rgba(32,36,28,0.16)] p-3">
                  {SERVICES.map((s) => (
                    <a key={s.slug} href={`${base}/${s.slug}`} className="px-3 py-2 rounded-lg text-[15px] text-[#20241C] hover:bg-[#EDF3EC] hover:text-[#234E36]">
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-[#2F7D4F] transition-colors">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={BIZ.phoneHref} className={`hidden lg:inline-flex items-center gap-1.5 ${body} text-[16px] font-bold text-[#20241C]`}>
            <Phone size={18} weight="fill" className="text-[#2F7D4F]" /> {BIZ.phone}
          </a>
          <a href={`${home}#contact`} className={`hidden sm:inline-flex bg-[#2F7D4F] hover:bg-[#234E36] text-white px-5 py-2.5 rounded-full ${body} text-[15px] font-semibold transition-colors`}>
            Free Quote
          </a>
          <a href={BIZ.phoneHref} aria-label={`Call ${BIZ.phone}`} className="sm:hidden p-2 rounded-full bg-[#2F7D4F] text-white">
            <Phone size={20} weight="fill" />
          </a>
          <button onClick={() => setOpen(!open)} className="md:hidden p-1 text-[#20241C]" aria-label="Menu" aria-expanded={open}>
            {open ? <X size={28} /> : <List size={28} />}
          </button>
        </div>
      </div>
      {open && (
        <div className={`md:hidden border-t border-[#234E36]/15 bg-[#F5F1E8] px-5 py-4 max-h-[80vh] overflow-y-auto ${body}`}>
          <p className="text-[13px] tracking-[0.14em] uppercase font-bold text-[#2F7D4F] mb-1">Services</p>
          <div className="grid grid-cols-2 gap-x-3">
            {SERVICES.map((s) => (
              <a key={s.slug} href={`${base}/${s.slug}`} className="block py-2 text-[16px] text-[#20241C]">{s.name}</a>
            ))}
          </div>
          <div className="border-t border-[#234E36]/15 mt-3 pt-3">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-[17px] font-medium text-[#20241C]">{l.label}</a>
            ))}
          </div>
          <a href={BIZ.phoneHref} className="mt-2 inline-flex items-center gap-2 text-[17px] font-bold text-[#2F7D4F]">
            <Phone size={19} weight="fill" /> {BIZ.phone}
          </a>
        </div>
      )}
    </header>
  );
}
