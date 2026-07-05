import { algorithms, arrhythmias } from "@/data/cardiac";

export type SearchItem = {
  id: string;
  label: string;
  category: "Protocol" | "Rhythm" | "Medication" | "Reference";
  detail?: string;
  to: string;
  search?: Record<string, string>;
  hash?: string;
  params?: Record<string, string>;
  keywords: string;
};

// Drugs available in the dosing calculator (preselect via ?drug=)
const calcDrugs = [
  { name: "Diltiazem", detail: "Non-dihydropyridine CCB · rate control in AF" },
  { name: "Metoprolol", detail: "Beta-blocker · rate control" },
  { name: "Esmolol", detail: "Ultra-short beta-blocker · titratable" },
  { name: "Digoxin", detail: "Cardiac glycoside · AF with HF" },
  { name: "Amiodarone", detail: "Class III · AF rhythm control, VT/VF" },
];

// Anti-arrhythmic drugs in the Vaughan-Williams chart (route to /antiarrhythmics)
const vwDrugs: { name: string; detail: string }[] = [
  { name: "Quinidine", detail: "Class Ia · Na+ blocker" },
  { name: "Procainamide", detail: "Class Ia · Na+ blocker" },
  { name: "Disopyramide", detail: "Class Ia · Na+ blocker" },
  { name: "Lidocaine", detail: "Class Ib · Na+ blocker" },
  { name: "Mexiletine", detail: "Class Ib · Na+ blocker" },
  { name: "Flecainide", detail: "Class Ic · Na+ blocker" },
  { name: "Propafenone", detail: "Class Ic · Na+ blocker" },
  { name: "Propranolol", detail: "Class II · Beta blocker" },
  { name: "Atenolol", detail: "Class II · Beta blocker" },
  { name: "Ibutilide", detail: "Class III · K+ blocker" },
  { name: "Dofetilide", detail: "Class III · K+ blocker" },
  { name: "Sotalol", detail: "Class III · K+ blocker" },
  { name: "Verapamil", detail: "Class IV · Ca2+ blocker" },
];

export const searchIndex: SearchItem[] = [
  // Protocols / algorithms
  ...algorithms.map<SearchItem>((a) => ({
    id: `proto:${a.id}`,
    label: a.name,
    category: "Protocol",
    detail: a.summary,
    to: "/protocol/$id",
    params: { id: a.id },
    keywords: `${a.name} ${a.summary} ${a.context ?? ""}`.toLowerCase(),
  })),

  // Rhythms
  ...arrhythmias.map<SearchItem>((r) => ({
    id: `rhythm:${r.id}`,
    label: r.name,
    category: "Rhythm",
    detail: r.category,
    to: "/rhythms",
    hash: r.id,
    keywords: `${r.name} ${r.category} arrhythmia rhythm`.toLowerCase(),
  })),

  // Calculator meds
  ...calcDrugs.map<SearchItem>((d) => ({
    id: `calc:${d.name}`,
    label: d.name,
    category: "Medication",
    detail: `${d.detail} · dosing calculator`,
    to: "/treatment",
    search: { drug: d.name },
    keywords: `${d.name} ${d.detail} dosing`.toLowerCase(),
  })),

  // Vaughan-Williams drugs
  ...vwDrugs.map<SearchItem>((d) => ({
    id: `vw:${d.name}`,
    label: d.name,
    category: "Medication",
    detail: d.detail,
    to: "/antiarrhythmics",
    keywords: `${d.name} ${d.detail} antiarrhythmic`.toLowerCase(),
  })),

  // Reference pages
  {
    id: "ref:antiarrhythmics",
    label: "Anti-arrhythmic drugs",
    category: "Reference",
    detail: "Vaughan-Williams classification + mnemonics",
    to: "/antiarrhythmics",
    keywords: "antiarrhythmic vaughan williams class i ii iii iv mnemonic",
  },
  {
    id: "ref:goldman",
    label: "Goldman Cardiac Risk Index",
    category: "Reference",
    detail: "Pre-operative cardiac risk stratification",
    to: "/goldman",
    keywords: "goldman cardiac risk index preoperative",
  },
  {
    id: "ref:treatment",
    label: "Treatment mini app",
    category: "Reference",
    detail: "AF / VT / VF stability-first recommendations",
    to: "/treatment",
    keywords: "treatment af vt vf dosing calculator",
  },
];

export function searchAll(query: string, limit = 8): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of searchIndex) {
    let score = 0;
    let missed = false;
    for (const t of tokens) {
      if (item.label.toLowerCase().startsWith(t)) score += 10;
      else if (item.label.toLowerCase().includes(t)) score += 5;
      else if (item.keywords.includes(t)) score += 2;
      else {
        missed = true;
        break;
      }
    }
    if (!missed && score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
