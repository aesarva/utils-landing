// Табло Ochre на сайте: шкала нагрева и полоса GPU перенесены из приложения
// (../ochre: MetricsCore/Presentation/HeatScale.swift и GPUBars.swift), чтобы демо красило ядра,
// как сам Ochre. Данные демо синтетические и подписаны на странице как демо.

type Rgb = readonly [number, number, number];

const AMBER: Rgb = [227, 191, 92];
const EMBER: Rgb = [204, 143, 37];
const HOT: Rgb = [180, 70, 42];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as unknown as Rgb;
const css = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`;

/** Цвет плитки по загрузке 0…100 %: < 20 — холодная (null), 20→60 янтарь→угли, 60→90 угли→жар, ≥ 90 жар. */
export function heatColor(load: number): string | null {
  if (!Number.isFinite(load)) return null;
  const l = Math.min(Math.max(load, 0), 100);
  if (l < 20) return null;
  if (l < 60) return css(mix(AMBER, EMBER, (l - 20) / 40));
  if (l < 90) return css(mix(EMBER, HOT, (l - 60) / 30));
  return css(HOT);
}

/** Цифры на плитке: на холодной и с 83 % светлые, на янтаре и углях тёмные. */
export function tileInk(load: number): 'light' | 'dark' {
  return Number.isFinite(load) && load >= 20 && load < 83 ? 'dark' : 'light';
}

/** Сколько полосок GPU горит при общей загрузке: доля от числа полосок, хотя бы одна при ненулевой. */
export function gpuLit(utilization: number, total: number): number {
  if (total <= 0 || !Number.isFinite(utilization) || utilization <= 0) return 0;
  return Math.max(1, Math.round((Math.min(utilization, 100) / 100) * total));
}

/** Демо: M5 Pro — 6 Super- и 12 Performance-ядер, GPU на 20 ядер. */
export const DEMO = {
  chip: 'M5 Pro',
  superLoads: [38, 12, 64, 8, 92, 5],
  performanceLoads: [3, 31, 6, 2, 11, 4, 44, 7, 2, 1, 9, 2],
  gpuCores: 20,
  gpuUtilization: 35,
  cpuCelsius: 67,
} as const;
