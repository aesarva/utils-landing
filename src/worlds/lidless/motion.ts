// Табличка ON AIR на странице — демо панели Lidless: нажатие выходит в эфир и обратно, клавиши
// сессий перезапускают отсчёт (как в приложении), ∞ считает время в эфире вверх. Ничего не держит
// Mac бодрым: это только показ. Без JS табличка просто горит с отсчётом 59:58.

/** Длительности клавиш в секундах; null — «До…» (до ближайшего полного часа), Infinity — бессрочно. */
const LENGTHS: (number | null)[] = [15 * 60, 60 * 60, 3 * 60 * 60, null, Infinity];
/** Демо стартует так же, как показывает разметка: час, осталось 59:58. */
const START_LEFT = 59 * 60 + 58;

const pad = (n: number) => String(n).padStart(2, '0');

/** Формат таблички: m:ss до часа, h:mm:ss с часа. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Секунды до ближайшего полного часа (для «До…»), не меньше минуты. */
export function untilNextHour(now: Date): number {
  const left = 3600 - (now.getMinutes() * 60 + now.getSeconds());
  return left < 60 ? left + 3600 : left;
}

export function startSign(root: HTMLElement): void {
  const sign = root.querySelector<HTMLButtonElement>('[data-sign]');
  const time = root.querySelector<HTMLElement>('[data-time]');
  const sessions = [...root.querySelectorAll<HTMLButtonElement>('[data-session]')];
  const closedLid = root.querySelector<HTMLButtonElement>('[data-closed-lid]');
  if (!sign || !time) return;

  let onAir = true;
  let indefinite = false;
  /** Для отсчёта — когда сессия кончится; для ∞ — когда началась (мс). */
  let mark = Date.now() + START_LEFT * 1000;
  let visible = true;

  const render = () => {
    sign.setAttribute('aria-pressed', String(onAir));
    if (!onAir) return;
    const seconds = indefinite ? (Date.now() - mark) / 1000 : (mark - Date.now()) / 1000;
    if (!indefinite && seconds <= 0) {
      onAir = false;
      sign.setAttribute('aria-pressed', 'false');
      time.textContent = formatClock(0);
      return;
    }
    time.textContent = formatClock(seconds);
  };

  const start = (index: number) => {
    const length = LENGTHS[index];
    indefinite = length === Infinity;
    const seconds = length === null ? untilNextHour(new Date()) : (length as number);
    mark = indefinite ? Date.now() : Date.now() + seconds * 1000;
    onAir = true;
    sessions.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    render();
  };

  sign.addEventListener('click', () => {
    if (onAir) {
      onAir = false;
      render();
    } else {
      const active = sessions.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      start(active >= 0 ? active : 1);
    }
  });
  sessions.forEach((b, i) => b.addEventListener('click', () => start(i)));
  closedLid?.addEventListener('click', () => {
    closedLid.setAttribute('aria-pressed', String(closedLid.getAttribute('aria-pressed') !== 'true'));
  });

  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(sign);
  window.setInterval(() => {
    if (visible && !document.hidden) render();
  }, 1000);
}
