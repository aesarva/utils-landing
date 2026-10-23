import { describe, expect, it } from 'vitest';
import { alternates, otherLang, pagePath } from '../../src/lib/routes';
import { t } from '../../src/i18n';

describe('pagePath', () => {
  it('пути хаба и миров', () => {
    expect(pagePath('ru')).toBe('/');
    expect(pagePath('en')).toBe('/en/');
    expect(pagePath('ru', 'ochre')).toBe('/ochre/');
    expect(pagePath('en', 'ochre')).toBe('/en/ochre/');
  });
});

describe('otherLang', () => {
  it('меняет язык', () => {
    expect(otherLang('ru')).toBe('en');
    expect(otherLang('en')).toBe('ru');
  });
});

describe('alternates', () => {
  it('x-default указывает на русскую версию, URL абсолютные', () => {
    const a = alternates('lidless');
    expect(a.find((x) => x.hreflang === 'x-default')?.href).toBe(
      'https://utils.cyber-tech.online/lidless/',
    );
    expect(a.find((x) => x.hreflang === 'en')?.href).toBe(
      'https://utils.cyber-tech.online/en/lidless/',
    );
  });
});

describe('словари', () => {
  it('ru и en имеют одинаковый набор ключей', () => {
    expect(Object.keys(t('ru')).sort()).toEqual(Object.keys(t('en')).sort());
  });
  it('requires подставляет версию macOS', () => {
    expect(t('ru').requires('14')).toBe('macOS 14 и новее');
    expect(t('en').requires('14')).toBe('macOS 14 or later');
  });
});
