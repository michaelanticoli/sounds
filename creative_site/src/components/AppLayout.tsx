import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Github, Linkedin, Mail, Menu, X } from "lucide-react";
import MoonTunerPlayer from "./MoonTunerPlayer";

// Replace these with your own uploads when ready.
const IMAGES = {
  heroAbstract:
    "https://d64gsuwffb70l.cloudfront.net/6947a6dc9aa5199de9319568_1766303499305_64dd5d38.png",
  portrait:
    "https://d64gsuwffb70l.cloudfront.net/6947a6dc9aa5199de9319568_1766303893512_b0250198.jpeg",
  work1:
    "https://d64gsuwffb70l.cloudfront.net/6947a6dc9aa5199de9319568_1766303497087_8e6d43dd.png",
  work2:
    "https://d64gsuwffb70l.cloudfront.net/6947a6dc9aa5199de9319568_1766303488073_2d54e1bb.png",
  work3:
    "https://d64gsuwffb70l.cloudfront.net/6947a6dc9aa5199de9319568_1766303493225_6328cbc5.png",
};

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  status: "Active" | "R&D" | "In Progress" | "Complete";
  image: string;
};

const projects: Project[] = [
  {
    id: "sonic-identity-system",
    title: "Sonic Identity System",
    category: "Audio Strategy",
    description:
      "A scalable approach to defining how a brand sounds across touchpoints—principles, constraints, and behaviors teams can actually use.",
    tags: ["Brand architecture", "Guidelines", "Creative direction"],
    status: "Active",
    image: IMAGES.work1,
  },
  {
    id: "audio-ux-toolkit",
    title: "Audio UX Toolkit",
    category: "Product & Experience",
    description:
      "Design patterns for sound in interfaces: feedback, micro-interactions, accessibility, and restraint—built for modern platforms.",
    tags: ["Web Audio", "Interaction design", "Accessibility"],
    status: "In Progress",
    image: IMAGES.work2,
  },
  {
    id: "sonic-rnd-lab",
    title: "Generative Audio R&D",
    category: "Innovation",
    description:
      "Prototype-driven exploration: systems that generate coherent soundbeds from simple parameters—useful for concepting and rapid iteration.",
    tags: ["Prototyping", "Systems", "Generative"],
    status: "R&D",
    image: IMAGES.work3,
  },
  {
    id: "brand-sound-audit",
    title: "Brand Sound Audit",
    category: "Growth & Clarity",
    description:
      "A diagnostic framework for understanding what audio is already communicating—then aligning it to the brand’s intent and audience reality.",
    tags: ["Audit", "Cultural insight", "Decision support"],
    status: "Active",
    image: IMAGES.work1,
  },
  {
    id: "voice-persona-system",
    title: "Voice Persona System",
    category: "Innovation",
    description:
      "Exploration into how voice, tone, and sonic texture can be systematized—protecting brand integrity while enabling speed.",
    tags: ["AI voice", "Governance", "Brand integrity"],
    status: "R&D",
    image: IMAGES.work2,
  },
  {
    id: "spatial-experience",
    title: "Spatial Experience Sketches",
    category: "Product & Experience",
    description:
      "Concept work for environments where sound guides attention, mood, and movement—designed to feel inevitable, not loud.",
    tags: ["Experience design", "Spatial audio", "Narrative"],
    status: "In Progress",
    image: IMAGES.work3,
  },
];

const fieldNotes = [
  {
    id: "audio-as-orientation",
    title: "Audio as Orientation",
    blurb: "Sound shapes meaning before copy ever arrives. Treat it like infrastructure.",
  },
  {
    id: "coherence-across-touchpoints",
    title: "Coherence Across Touchpoints",
    blurb: "A system beats a collection. The work is deciding what matters, early.",
  },
  {
    id: "restraint-as-signal",
    title: "Restraint as Signal",
    blurb: "The strongest audio choices rarely announce themselves. They hold the room.",
  },
];

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0] ?? "hero");

  useEffect(() => {
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -55% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds.join("|")]);

  return active;
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const AppLayout: React.FC = () => {
  const sectionIds = useMemo(
    () => ["hero", "thesis", "capabilities", "prototype", "work", "notes", "about", "contact"],
    []
  );
  const active = useActiveSection(sectionIds);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    []
  );

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p) => p.category === filter);
  }, [filter]);

  const navItems = [
    { label: "Thesis", id: "thesis" },
    { label: "Work", id: "work" },
    { label: "Prototype", id: "prototype" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Subtle page glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={
          {
            background:
              "radial-gradient(900px 500px at 20% 10%, rgba(212,175,55,0.10), transparent 55%), radial-gradient(900px 500px at 80% 0%, rgba(184,134,11,0.10), transparent 60%), radial-gradient(700px 500px at 50% 90%, rgba(0,0,0,0.06), transparent 55%)",
          } as React.CSSProperties
        }
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between px-4 sm:px-5">
              <button
                onClick={() => {
                  scrollTo("hero");
                  setMobileOpen(false);
                }}
                className="group flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full border border-black/10 bg-gradient-to-br from-black to-black/70" />
                <div className="text-left">
                  <div className="text-[11px] tracking-[0.22em] uppercase text-black/55">Michael Anticoli</div>
                  <div className="text-xs text-black/60 group-hover:text-black transition">Audio Strategy • Brand Systems</div>
                </div>
              </button>

              {/* Desktop */}
              <div className="hidden md:flex items-center gap-7">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollTo(item.id);
                      setMobileOpen(false);
                    }}
                    className={
                      "text-xs tracking-[0.18em] uppercase transition-colors " +
                      (active === item.id ? "text-black" : "text-black/55 hover:text-black")
                    }
                  >
                    {item.label}
                  </button>
                ))}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("contact");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-gradient-to-r from-[#B8860B]/90 to-[#D4AF37]/90 px-4 py-2 text-xs font-medium tracking-[0.12em] text-black hover:brightness-105 transition"
                >
                  Start <ArrowRight size={14} />
                </a>
              </div>

              {/* Mobile */}
              <button
                className="md:hidden h-10 w-10 rounded-full border border-black/10 bg-white/70 flex items-center justify-center text-black/70 hover:text-black transition"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {mobileOpen && (
              <div className="md:hidden border-t border-black/10 px-4 py-3">
                <div className="grid gap-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollTo(item.id);
                        setMobileOpen(false);
                      }}
                      className={
                        "w-full text-left rounded-xl px-3 py-2 text-xs tracking-[0.18em] uppercase " +
                        (active === item.id ? "bg-black/[0.04] text-black" : "text-black/60")
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white">
            {/* Abstract texture */}
            <div className="absolute inset-0">
              <img
                src={IMAGES.heroAbstract}
                alt=""
                className="h-full w-full object-cover opacity-[0.10]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white" />
            </div>

            <div className="relative px-6 py-14 sm:px-10 sm:py-20">
              <div className="flex flex-wrap items-center gap-2">
                {["Director-level", "Audio Strategy", "Brand Systems", "Creative Technology"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-black/60"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                Sound is brand architecture.
              </h1>

              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-black/65">
                I help teams define how a brand feels across platforms, environments, and time—treating audio as an intentional system, not a last-mile asset. Studio-ready, agency-safe.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => scrollTo("work")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black px-6 py-3 text-sm font-medium tracking-wide text-white hover:bg-black/90 transition"
                >
                  View work <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => scrollTo("prototype")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium tracking-wide text-black hover:bg-black/[0.03] transition"
                >
                  Hear a prototype
                </button>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Mode", v: "Strategy + craft" },
                  { k: "Focus", v: "Systems that scale" },
                  { k: "Output", v: "Clarity, direction, prototypes" },
                ].map((item) => (
                  <div key={item.k} className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="text-[11px] tracking-[0.22em] uppercase text-black/45">{item.k}</div>
                    <div className="mt-1 text-sm font-medium text-black">{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thesis */}
      <section id="thesis" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Thesis</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-light tracking-tight">
                Sound reaches people before language does.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-4 text-black/65 leading-relaxed">
              <p>
                Most brands treat audio as a finishing touch. That’s why it often feels inconsistent, over-designed, or disconnected from the brand’s actual intent.
              </p>
              <p>
                I work upstream—where decisions are still fluid—helping teams define what sound is doing, why it matters, and how it behaves across touchpoints.
              </p>
              <p>
                The result is not just better sound. It’s clearer direction, fewer revision loops, and a more coherent brand experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-16 sm:py-24 border-y border-black/10 bg-black/[0.02]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Capabilities</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight">Three pillars, built to travel.</h2>
            </div>
            <div className="text-sm text-black/55 max-w-xl">
              Strategy that respects craft. Systems that respect culture.
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Audio Strategy",
                desc: "Define the role of sound in the brand—principles, constraints, and decision logic that teams can execute.",
              },
              {
                title: "Brand Systems",
                desc: "Make sound coherent across platforms and contexts—so it scales without losing the point.",
              },
              {
                title: "Cultural Resonance",
                desc: "Ground choices in audience reality—so the work feels current, legible, and emotionally true.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-3xl border border-black/10 bg-white p-7">
                <div className="h-10 w-10 rounded-2xl border border-black/10 bg-gradient-to-br from-black to-black/70" />
                <h3 className="mt-5 text-lg font-medium tracking-tight">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/60">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prototype */}
      <section id="prototype" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-4">
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Prototype</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-light tracking-tight">An audio system in miniature.</h2>
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                A small demo to show how constraint + intention can produce an expressive soundbed—useful for concepting, testing, and alignment.
              </p>
            </div>
            <div className="lg:col-span-8">
              <MoonTunerPlayer />
            </div>
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="py-16 sm:py-24 border-y border-black/10 bg-black/[0.02]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Work</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight">Selected modules</h2>
              <p className="mt-3 text-sm text-black/60 max-w-2xl leading-relaxed">
                This is structured work—frameworks and prototypes designed to help teams make better decisions earlier.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={
                  "rounded-full border px-4 py-2 text-xs tracking-[0.14em] uppercase transition " +
                  (filter === c
                    ? "border-black/10 bg-gradient-to-r from-[#B8860B]/90 to-[#D4AF37]/90 text-black"
                    : "border-black/10 bg-white text-black/60 hover:text-black hover:bg-black/[0.03]")
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="group text-left rounded-3xl border border-black/10 bg-white overflow-hidden hover:bg-black/[0.02] transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] tracking-[0.22em] uppercase text-black/50">{p.category}</div>
                    <div className="text-[11px] tracking-[0.18em] uppercase text-black/45">{p.status}</div>
                  </div>
                  <div className="mt-2 text-lg font-medium tracking-tight">{p.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-black/60">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-black/55"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-black/10 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9]">
              <img src={selected.image} alt={selected.title} className="h-full w-full object-cover" />
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 h-10 w-10 rounded-full border border-black/10 bg-white/80 hover:bg-white flex items-center justify-center"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-7 sm:p-9">
              <div className="text-[11px] tracking-[0.22em] uppercase text-black/50">{selected.category}</div>
              <h3 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight">{selected.title}</h3>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-black/65">{selected.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {selected.tags.map((t) => (
                  <span key={t} className="rounded-full border border-black/10 bg-black/[0.02] px-3 py-1 text-xs text-black/60">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90 transition"
                >
                  View detail <ArrowRight size={16} />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-black hover:bg-black/[0.03] transition"
                >
                  External <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Notes */}
      <section id="notes" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-4">
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Field Notes</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-light tracking-tight">Short reads, sharp signal.</h2>
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                Small essays and working notes on sound, systems, and culture—written for leaders who want clarity without fluff.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
                <div className="divide-y divide-black/10">
                  {fieldNotes.map((n) => (
                    <a
                      key={n.id}
                      href="#"
                      className="group block px-6 py-5 hover:bg-black/[0.02] transition"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div>
                          <div className="text-sm font-medium tracking-tight">{n.title}</div>
                          <div className="mt-1 text-sm text-black/60">{n.blurb}</div>
                        </div>
                        <ArrowRight className="text-black/35 group-hover:text-black transition" size={18} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 sm:py-24 border-y border-black/10 bg-black/[0.02]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
                <img src={IMAGES.portrait} alt="Michael Anticoli" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">About</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-light tracking-tight">
                Director-level audio strategy and growth thinking, built on systems.
              </h2>
              <div className="mt-5 space-y-4 text-black/65 leading-relaxed">
                <p>
                  I specialize in audio as brand infrastructure—aligning sonic expression to values, audience emotion, and growth goals.
                </p>
                <p>
                  I’m strongest at the beginning: framing the problem, defining the system, and helping teams move from intuition to intention—before execution hardens assumptions.
                </p>
                <p>
                  The work is intentionally curated. Leaders don’t need volume; they need signal.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90 transition"
                >
                  View resume-style page <ArrowRight size={16} />
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("contact");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-black hover:bg-black/[0.03] transition"
                >
                  Talk about a role
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] tracking-[0.22em] uppercase text-black/50">Contact</p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-light tracking-tight">Let’s build a sonic practice that scales.</h2>
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                If you’re hiring, building a new offering, or need a strategic partner to define audio direction—reach out.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href="mailto:michael@yourdomain.com"
                  className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 hover:bg-black/[0.02] transition"
                >
                  <div className="h-11 w-11 rounded-full border border-black/10 bg-gradient-to-br from-black to-black/70 flex items-center justify-center text-white">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] tracking-[0.22em] uppercase text-black/45">Email</div>
                    <div className="text-sm font-medium">michael@yourdomain.com</div>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 hover:text-black hover:bg-black/[0.02] transition"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href="#"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 hover:text-black hover:bg-black/[0.02] transition"
                    aria-label="GitHub"
                  >
                    <Github size={18} />
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // keep this simple for now; wire to a service later.
                    alert("Message captured locally. Wire this to your form handler next.");
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-[11px] tracking-[0.22em] uppercase text-black/50">Name</label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.22em] uppercase text-black/50">Email</label>
                    <input
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.22em] uppercase text-black/50">Message</label>
                    <textarea
                      className="mt-2 w-full min-h-[140px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25 resize-none"
                      placeholder="What are you building?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-black/10 bg-gradient-to-r from-[#B8860B]/90 to-[#D4AF37]/90 px-6 py-4 text-sm font-medium tracking-wide text-black hover:brightness-105 transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          <footer className="mt-14 border-t border-black/10 pt-8 text-center text-xs tracking-[0.18em] uppercase text-black/45">
            Michael Anticoli • Audio Strategy & Brand Systems
          </footer>
        </div>
      </section>
    </div>
  );
};

export default AppLayout;
