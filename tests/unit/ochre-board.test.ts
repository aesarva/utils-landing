import { describe, expect, it } from 'vitest';
import { gpuLit, heatColor, tileInk } from '../../src/worlds/ochre/board';

// Перенос HeatScale и GPUBars из ../ochre (Sources/MetricsCore/Presentation): табло на сайте
// красит ядра теми же цветами и по тем же порогам, что приложение.
describe('heatColor', () => {
  it('ниже 20% — холодная плитка (null)', () => {
    expect(heatColor(0)).toBeNull();
    expect(heatColor(19.9)).toBeNull();
    expect(heatColor(Number.NaN)).toBeNull();
  });
  it('20 → янтарь, 60 → угли, 90 и выше → жар', () => {
    expect(heatColor(20)).toBe('rgb(227 191 92)');
    expect(heatColor(60)).toBe('rgb(204 143 37)');
    expect(heatColor(90)).toBe('rgb(180 70 42)');
    expect(heatColor(140)).toBe('rgb(180 70 42)');
  });
  it('между ступенями — линейная смесь', () => {
    expect(heatColor(40)).toBe('rgb(216 167 65)');
    expect(heatColor(75)).toBe('rgb(192 107 40)');
  });
});

describe('tileInk', () => {
  it('на холодной плитке и с 83% — светлые цифры, между — тёмные', () => {
    expect(tileInk(12)).toBe('light');
    expect(tileInk(20)).toBe('dark');
    expect(tileInk(82.9)).toBe('dark');
    expect(tileInk(83)).toBe('light');
  });
});

describe('gpuLit', () => {
  it('доля полосок по общей загрузке GPU, хотя бы одна при ненулевой', () => {
    expect(gpuLit(0, 20)).toBe(0);
    expect(gpuLit(1, 20)).toBe(1);
    expect(gpuLit(35, 20)).toBe(7);
    expect(gpuLit(250, 20)).toBe(20);
  });
});
