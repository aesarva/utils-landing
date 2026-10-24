// Словарь оболочки (ru). Рабочие тексты, финальный тон задаёт дизайн хаба.
export const ru = {
  download: 'Скачать',
  comingSoon: 'Скоро',
  source: 'Исходный код',
  requires: (macos: string) => `macOS ${macos} и новее`,
  universal: 'Универсальная сборка',
  appleSilicon: 'Apple Silicon',
  hub: 'Все утилиты',
  langLabel: 'English',
  langName: 'Русский',
  footerOrg: 'CyberTech team',
  footerGithub: 'GitHub',
  license: 'Лицензия',
  notFoundTitle: 'Страница не найдена',
  notFoundBody: 'Такой страницы нет. Вернитесь к списку утилит.',
  hubTitle: 'Утилиты CyberTech для macOS',
  hubDescription: 'Небольшие утилиты для macOS от CyberTech team с открытым исходным кодом.',
};
export type Dict = typeof ru;
