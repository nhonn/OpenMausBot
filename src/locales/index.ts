import en from "./en.json";
export { en };
export type LocaleKey = keyof typeof en;
export type LocalePack = Partial<Record<LocaleKey, string>>;

type PackLoader = () => Promise<{ default: LocalePack }>;

const loadPtBr: PackLoader = () => import("./pt-br.json");
const loadZhTw: PackLoader = () => import("./zh-tw.json");

export const localeLoaders: Readonly<Record<string, PackLoader>> = {
  de: () => import("./de.json"),
  es: () => import("./es.json"),
  fr: () => import("./fr.json"),
  hi: () => import("./hi.json"),
  ja: () => import("./ja.json"),
  pt: loadPtBr,
  "pt-br": loadPtBr,
  zh: () => import("./zh.json"),
  "zh-hant": loadZhTw,
  "zh-hk": loadZhTw,
  "zh-mo": loadZhTw,
  "zh-tw": loadZhTw,
  uk: () => import("./uk.json"),
  vi: () => import("./vi.json"),
  tr: () => import("./tr.json"),
};

/** Packs that have been loaded so far; every alias of a pack points at the same object. */
export const locales: Record<string, LocalePack> = { en };

const pending = new Map<PackLoader, Promise<void>>();

export function loadLocalePack(code: string): Promise<void> {
  const load = localeLoaders[code];
  if (!load || locales[code]) return Promise.resolve();
  let loading = pending.get(load);
  if (!loading) {
    loading = load()
      .then(({ default: pack }) => {
        for (const [alias, aliasLoader] of Object.entries(localeLoaders)) {
          if (aliasLoader === load) locales[alias] = pack;
        }
      })
      .finally(() => pending.delete(load));
    pending.set(load, loading);
  }
  return loading;
}

export function loadAllLocalePacks(): Promise<void[]> {
  return Promise.all(Object.keys(localeLoaders).map(loadLocalePack));
}

export const localeChoices: ReadonlyArray<{ code: string; label: string }> = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
  { code: "pt-br", label: "Português (Brasil)" },
  { code: "zh", label: "简体中文" },
  { code: "zh-tw", label: "繁體中文（台灣）" },
  { code: "uk", label: "Українська" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "tr", label: "Türkçe" },
];
