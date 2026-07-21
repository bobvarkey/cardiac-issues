import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  FlaskConical,
  Heart,
  HeartPulse,
  Home,
  Pill,
  Search,
  Shield,
  Stethoscope,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SubItem = { label: string; to: string };
type Section = {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string; // tailwind text color class
  bg: string; // tailwind bg tint class
  items: SubItem[];
  featured?: boolean;
};

const SECTIONS: Section[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    items: [{ label: "Overview", to: "/" }],
  },
  {
    id: "hutt",
    label: "HUTT Test",
    icon: Activity,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-500",
    featured: true,
    items: [{ label: "Run study", to: "/hutt" }],
  },
  {
    id: "treatment",
    label: "Treatment",
    icon: HeartPulse,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    items: [
      { label: "Arrhythmia", to: "/treatment" },
      { label: "Anti-arrhythmic Drugs", to: "/antiarrhythmics" },
      { label: "Stellate Block", to: "/stellate" },
    ],
  },
  {
    id: "anticoag",
    label: "Anticoagulation",
    icon: Droplet,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    items: [
      { label: "Guidelines", to: "/anticoagulation" },
      { label: "Scores", to: "/scores" },
      { label: "Warfarin", to: "/warfarin" },
    ],
  },
  {
    id: "protocols",
    label: "Protocols",
    icon: Shield,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/15",
    items: [
      { label: "Rhythms", to: "/rhythms" },
      { label: "Syncope", to: "/syncope" },
      { label: "Syncope Triage", to: "/syncope-triage" },
      { label: "Goldman Index", to: "/goldman" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: Calculator,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    items: [{ label: "MedCalc", to: "/medcalc" }],
  },
];

const STORAGE_KEYS = {
  collapsed: "sidebar.collapsed.v1",
  open: "sidebar.openSections.v1",
};

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEYS.collapsed) === "1";
}
function readOpen(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.open) || "{}");
  } catch {
    return {};
  }
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-400/40 px-0.5 text-foreground">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setCollapsed(readCollapsed());
    setOpenMap(readOpen());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.collapsed, collapsed ? "1" : "0");
  }, [collapsed, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.open, JSON.stringify(openMap));
  }, [openMap, hydrated]);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(() => {
    if (!searching) return SECTIONS;
    return SECTIONS.map((s) => {
      const sectionMatch = s.label.toLowerCase().includes(q);
      const items = s.items.filter((i) => i.label.toLowerCase().includes(q));
      if (sectionMatch || items.length) {
        return { ...s, items: sectionMatch && !items.length ? s.items : items };
      }
      return null;
    }).filter(Boolean) as Section[];
  }, [q, searching]);

  function toggleSection(id: string) {
    setOpenMap((m) => ({ ...m, [id]: !m[id] }));
  }

  const isSectionOpen = (id: string) => (searching ? true : !!openMap[id]);

  return (
    <>
      {/* Blur overlay when searching */}
      {searching && (
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setQuery("")}
          className="fixed inset-0 z-30 bg-background/40 backdrop-blur-md transition"
        />
      )}

      <aside
        className={`sticky top-0 z-40 h-screen shrink-0 border-r border-border bg-background/95 transition-all duration-200 ${
          collapsed ? "w-14" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-3">
            <Link
              to="/"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md hover:bg-surface/60 -mx-1 px-1 py-0.5 transition"
              title="Home"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white">
                <Activity className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-semibold">CardiacRef</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Clinical
                  </div>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="relative border-b border-border px-3 py-2">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to section…"
                className="w-full rounded-md border border-border bg-surface/60 py-1.5 pl-7 pr-7 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Nav */}
          <nav className={`flex-1 overflow-y-auto py-2 ${searching ? "relative z-40" : ""}`}>
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground">No matches.</div>
            )}
            {filtered.map((section) => {
              const Icon = section.icon;
              const open = isSectionOpen(section.id);
              const isDirect =
                section.items.length === 1 &&
                (section.id === "home" || section.items[0].to === "/");
              if (isDirect) {
                const target = section.items[0].to;
                const active = pathname === target;
                return (
                  <div key={section.id} className="px-2">
                    <Link
                      to={target}
                      onClick={() => collapsed && setCollapsed(false)}
                      className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-surface ${
                        active ? "bg-surface" : ""
                      }`}
                      title={collapsed ? section.label : undefined}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${section.bg} ${section.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate font-medium">
                          <Highlight text={section.label} query={q} />
                        </span>
                      )}
                    </Link>
                  </div>
                );
              }
              return (
                <div key={section.id} className="px-2">
                  <button
                    type="button"
                    onClick={() => (collapsed ? setCollapsed(false) : toggleSection(section.id))}
                    className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-surface ${
                      section.featured
                        ? "my-1 border border-fuchsia-500/30 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/10 to-violet-500/10 shadow-[0_0_0_1px_rgba(217,70,239,0.15)]"
                        : ""
                    }`}
                    title={collapsed ? section.label : undefined}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${section.bg} ${section.color} ${
                        section.featured
                          ? "shadow-lg shadow-fuchsia-500/40 ring-1 ring-white/20 [&>svg]:drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                          : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!collapsed && (
                      <>
                        <span
                          className={`min-w-0 flex-1 truncate ${
                            section.featured ? "font-semibold text-foreground" : ""
                          }`}
                        >
                          <Highlight text={section.label} query={q} />
                        </span>
                        {section.featured && (
                          <span className="rounded-full bg-fuchsia-500/25 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-fuchsia-100 ring-1 ring-fuchsia-400/40">
                            New
                          </span>
                        )}
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ease-out ${
                            open ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && (
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="ml-9 mb-1 space-y-0.5 border-l border-border pl-2">
                          {section.items.map((item) => {
                            const active = pathname === item.to;
                            return (
                              <li key={item.to}>
                                <Link
                                  to={item.to}
                                  className={`block rounded-md px-2 py-1.5 text-xs transition ${
                                    active
                                      ? "bg-surface font-medium text-foreground"
                                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                  }`}
                                >
                                  <Highlight text={item.label} query={q} />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              Educational reference only.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Silence unused-import warnings for icons kept for future sections
export const _iconRegistry = { BookOpen, FlaskConical, Heart, Pill, Stethoscope, Waves };
