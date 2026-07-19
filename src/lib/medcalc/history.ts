export type HistoryEntry = {
  id: string;
  calcId: string;
  calcName: string;
  inputs: Record<string, number>;
  result: { value: string; unit?: string; label?: string };
  timestamp: number;
  note?: string;
};

const KEY = "medcalc.history.v1";

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(list: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("medcalc:history"));
}

export const history = {
  list: read,
  add(entry: Omit<HistoryEntry, "id" | "timestamp">) {
    const list = read();
    const item: HistoryEntry = { ...entry, id: crypto.randomUUID(), timestamp: Date.now() };
    list.unshift(item);
    write(list.slice(0, 200));
    return item;
  },
  remove(id: string) {
    write(read().filter((e) => e.id !== id));
  },
  clear() {
    write([]);
  },
};
