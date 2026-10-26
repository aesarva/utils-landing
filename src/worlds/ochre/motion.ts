// Демо-табло оживает, как в приложении: раз в 2 секунды (частота Ochre по умолчанию) часть ядер
// меняет загрузку, плитка перелистывается (половина взмаха — 130 мс, весь флип — 260 мс, как FlapTile)
// и перекрашивается по шкале нагрева. Без JS и при reduce motion табло просто стоит.
import { gpuLit, heatColor, tileInk } from './board';

const TICK_MS = 2000;
const HALF_FLIP_MS = 130;

/** Случайное блуждание загрузки: обычно мелкие шаги вниз-вверх, изредка всплеск. */
function nextLoad(load: number): number {
  const v = Math.random() < 0.07 ? 60 + Math.random() * 40 : load + (Math.random() - 0.55) * 24;
  return Math.round(Math.min(100, Math.max(0, v)));
}

function flip(tile: HTMLElement, text: string, apply?: () => void): void {
  const face = tile.querySelector('span');
  if (!face || face.textContent === text) return;
  tile.classList.add('is-flipping');
  window.setTimeout(() => {
    face.textContent = text;
    apply?.();
    tile.classList.remove('is-flipping');
  }, HALF_FLIP_MS);
}

function setLoad(tile: HTMLElement, load: number): void {
  tile.dataset.load = String(load);
  flip(tile, String(load), () => {
    const heat = heatColor(load);
    if (heat) tile.style.setProperty('--heat', heat);
    else tile.style.removeProperty('--heat');
    const ink = tileInk(load);
    tile.classList.toggle('ink-dark', ink === 'dark');
    tile.classList.toggle('ink-light', ink === 'light');
  });
}

export function startBoard(map: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tiles = [...map.querySelectorAll<HTMLElement>('.oc-tile[data-load]')];
  const bars = map.querySelector<HTMLElement>('.oc-bars');
  const pct = map.querySelector<HTMLElement>('.oc-gpu-pct');
  const tempTiles = [...map.querySelectorAll<HTMLElement>('.oc-temp .oc-tile')].slice(0, 2);
  let gpu = Number(bars?.dataset.load ?? 0);
  let celsius = Number(tempTiles.map((t) => t.textContent?.trim()).join('')) || 67;

  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(map);

  window.setInterval(() => {
    if (!visible || document.hidden) return;
    for (const tile of tiles) if (Math.random() < 0.35) setLoad(tile, nextLoad(Number(tile.dataset.load)));

    if (bars) {
      gpu = Math.round(Math.min(100, Math.max(0, gpu + (Math.random() - 0.5) * 16)));
      const items = [...bars.children] as HTMLElement[];
      const lit = gpuLit(gpu, items.length);
      items.forEach((b, i) => b.classList.toggle('lit', i < lit));
      const heat = heatColor(gpu);
      if (heat) bars.style.setProperty('--heat', heat);
      else bars.style.removeProperty('--heat');
      if (pct) pct.textContent = `${gpu}%`;
    }

    if (Math.random() < 0.3) {
      celsius = Math.min(78, Math.max(58, celsius + Math.round((Math.random() - 0.5) * 4)));
      [...String(celsius)].forEach((digit, i) => tempTiles[i] && flip(tempTiles[i], digit));
    }
  }, TICK_MS);
}
