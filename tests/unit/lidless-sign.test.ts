import { describe, expect, it } from 'vitest';
import { formatClock, untilNextHour } from '../../src/worlds/lidless/motion';

// Формат таблички Lidless: m:ss до часа, h:mm:ss с часа (как 59:58, 0:02 и 3:00:00 на снимках панели).
describe('formatClock', () => {
  it('до часа — минуты и секунды', () => {
    expect(formatClock(59 * 60 + 58)).toBe('59:58');
    expect(formatClock(2)).toBe('0:02');
  });
  it('с часа — часы, минуты, секунды', () => {
    expect(formatClock(3 * 3600)).toBe('3:00:00');
    expect(formatClock(3600 + 61)).toBe('1:01:01');
  });
  it('отрицательное и дробное не ломают формат', () => {
    expect(formatClock(-5)).toBe('0:00');
    expect(formatClock(9.9)).toBe('0:09');
  });
});

describe('untilNextHour', () => {
  it('секунды до ближайшего полного часа', () => {
    expect(untilNextHour(new Date(2026, 9, 26, 14, 30, 0))).toBe(30 * 60);
  });
  it('меньше минуты до часа — берёт следующий', () => {
    expect(untilNextHour(new Date(2026, 9, 26, 14, 59, 30))).toBe(30 + 3600);
  });
});
