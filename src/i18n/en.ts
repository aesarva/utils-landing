// Словарь оболочки (en). Ключи совпадают с ru.
import type { Dict } from './ru';

export const en: Dict = {
  download: 'Download',
  comingSoon: 'Coming soon',
  source: 'Source code',
  requires: (macos: string) => `macOS ${macos} or later`,
  universal: 'Universal build',
  appleSilicon: 'Apple Silicon',
  hub: 'All utilities',
  langLabel: 'Русский',
  langName: 'English',
  footerOrg: 'CyberTech team',
  footerGithub: 'GitHub',
  license: 'License',
  notFoundTitle: 'Page not found',
  notFoundBody: 'There is no such page. Go back to the list of utilities.',
  hubTitle: 'CyberTech utilities for macOS',
  hubDescription: 'Small open-source macOS utilities from the CyberTech team.',
};
