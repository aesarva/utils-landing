// Тексты мира Lidless. Факты — из README и README.ru приложения (../lidless, develop); подписи
// таблички, сессий и индикаторов — как в интерфейсе приложения (App/Resources/Localizable.xcstrings).
import type { Lang } from '../../lib/schema';

interface LidlessCopy {
  byline: string;
  lede: string;
  download: string;
  sign: string;
  /** Длины сессий в порядке панели приложения; последняя — бессрочно. */
  sessions: string[];
  sessionsLabel: string;
  closedLid: string;
  battery: string;
  heat: string;
  safety: string;
  caption: string;
  signHint: string;
  safeTitle: string;
  safeLine: string;
  safeBody: string;
  safeItems: { battery: string; heat: string; time: string };
  recoverTitle: string;
  recoverLead: string;
  recoverIf: string;
  recoverThen: string;
  recover: [string, string][];
  securityTitle: string;
  security: { title: string; text: string }[];
  appTitle: string;
  appLead: string;
  shots: { timer: string; indefinite: string; safety: string };
  menubarAlt: string;
  menubarCaption: string;
  installTitle: string;
  steps: string[];
  signed: string;
  source: string;
}

export const LIDLESS_COPY: Record<Lang, LidlessCopy> = {
  ru: {
    byline: 'от CyberTech team',
    lede: 'Закройте крышку: экран погаснет, а сборка, загрузка, рендер или ИИ-агент продолжат работу. Сон всегда вернётся.',
    download: 'Скачать для macOS',
    sign: 'В ЭФИРЕ',
    sessions: ['15 мин', '1 ч', '3 ч', 'До…', '∞'],
    sessionsLabel: 'Длина сессии',
    closedLid: 'Режим крышки',
    battery: 'Батарея',
    heat: 'Нагрев',
    safety: 'Стоп ниже 20% заряда · Пауза при нагреве · С закрытой крышкой от батареи — до 4 ч',
    caption: 'крышка закрыта · всё ещё в эфире',
    signHint: 'Демонстрация таблички из приложения: нажмите, чтобы выйти в эфир или из него',
    safeTitle: 'Защита встроена',
    safeLine: 'Стоп ниже 20% заряда · Пауза при нагреве · С закрытой крышкой от батареи — до 4 ч',
    safeBody: 'Выход, сбой, принудительное завершение или перезагрузка\u00a0— обычный сон всегда возвращается.',
    safeItems: {
      battery: 'Стоп ниже\n20% заряда',
      heat: 'Пауза\nпри нагреве',
      time: 'От батареи\nдо 4 ч',
    },
    recoverTitle: 'Если что-то пошло не так',
    recoverLead: 'Режим крышки держится на живом соединении Lidless с помощником, поэтому у обычного сна всегда есть путь назад.',
    recoverIf: 'Если…',
    recoverThen: 'То…',
    recover: [
      ['Lidless закрылся, упал или закрыт принудительно', 'Помощник сразу возвращает обычный сон.'],
      ['Mac перезагрузился посреди сессии', 'Помощник сбрасывает disablesleep при загрузке.'],
      ['Помощник упал', 'macOS запускает его снова, и Lidless заново включает режим крышки.'],
      ['Вы выключили Lidless в «Объектах входа»', 'macOS закрывает Lidless, обычный сон возвращается.'],
      ['Вы сами выставили disablesleep', 'Lidless его не трогает.'],
    ],
    securityTitle: 'Модель безопасности',
    security: [
      { title: 'Одна команда', text: 'Единственное привилегированное действие помощника — pmset -a disablesleep 0|1. Кроме «вкл/выкл», приложение ничего ему не передаёт.' },
      { title: 'Подпись с обеих сторон', text: 'Помощник принимает соединения только от Lidless той же команды Developer ID, а Lidless говорит только с таким помощником.' },
    ],
    appTitle: 'В приложении',
    appLead: 'Панель под значком в строке меню. Табличка — это и есть кнопка.',
    shots: {
      timer: 'В эфире на час: табличка считает обратно, крышку можно закрыть',
      indefinite: 'Бессрочно: табличка считает время в эфире',
      safety: 'Mac горячий: режим крышки на паузе, сессия идёт',
    },
    menubarAlt: 'Состояния значка в тёмной строке меню',
    menubarCaption: 'Значок в строке меню, слева направо: вне эфира · в эфире · с таймером · режим крышки · нужно внимание',
    installTitle: 'Как установить',
    steps: [
      'Скачайте DMG, откройте его и перетащите Lidless в «Программы».',
      'Запустите. Lidless живёт только в строке меню, без значка в Dock.',
      'При первом включении режима крышки macOS откроет «Объекты входа и расширения»: включите Lidless в «Разрешить в фоновом режиме». Один раз, без пароля.',
    ],
    signed: 'Подписано Developer ID и нотаризовано Apple · Apple Silicon и Intel',
    source: 'Исходный код на GitHub',
  },
  en: {
    byline: 'by CyberTech team',
    lede: 'Close the lid: the screen goes dark while your build, download, render or AI agent keeps running. Normal sleep always comes back.',
    download: 'Download for macOS',
    sign: 'ON AIR',
    sessions: ['15 min', '1 h', '3 h', 'Until…', '∞'],
    sessionsLabel: 'Session length',
    closedLid: 'Closed-lid mode',
    battery: 'Battery',
    heat: 'Heat',
    safety: 'Stops below 20% battery · Pauses when hot · Closed on battery: up to 4 h',
    caption: 'lid closed · still on air',
    signHint: 'A demo of the app’s sign: press it to go on air or off air',
    safeTitle: 'Safe by design',
    safeLine: 'Stops below 20% battery · Pauses when hot · Closed on battery: up to 4 h',
    safeBody: 'Quit, crash, force-quit or reboot: normal sleep always comes back.',
    safeItems: {
      battery: 'Stops below\n20% battery',
      heat: 'Pauses\nwhen hot',
      time: 'Closed on battery:\nup to 4 h',
    },
    recoverTitle: 'When something goes wrong',
    recoverLead: 'Closed-lid mode is tied to Lidless’s live connection to its helper, so normal sleep always has a way back.',
    recoverIf: 'If…',
    recoverThen: 'Then…',
    recover: [
      ['Lidless quits, crashes or is force-quit', 'The helper restores normal sleep at once.'],
      ['The Mac reboots mid-session', 'The helper resets disablesleep at boot.'],
      ['The helper crashes', 'macOS starts it again and Lidless re-applies closed-lid mode.'],
      ['You switch Lidless off in Login Items', 'macOS quits Lidless and normal sleep is restored.'],
      ['You set disablesleep yourself', 'Lidless leaves it alone.'],
    ],
    securityTitle: 'Security model',
    security: [
      { title: 'One command', text: 'The helper’s only privileged action is pmset -a disablesleep 0|1. Beyond that on/off choice, the app passes it nothing.' },
      { title: 'Signatures checked both ways', text: 'The helper accepts only Lidless signed by the same Developer ID team, and Lidless talks only to a helper signed by that team.' },
    ],
    appTitle: 'In the app',
    appLead: 'The panel under the menu-bar icon. The sign is the button.',
    shots: {
      timer: 'On air for an hour: the sign counts down, the lid can close',
      indefinite: 'Indefinitely: the sign counts time on air',
      safety: 'Hot Mac: closed-lid mode pauses, the session goes on',
    },
    menubarAlt: 'Menu-bar icon states in a dark menu bar',
    menubarCaption: 'The menu-bar icon, left to right: off · on air · with a timer · closed-lid mode · needs attention',
    installTitle: 'How to install',
    steps: [
      'Download the DMG, open it and drag Lidless to Applications.',
      'Launch it. Lidless lives in the menu bar only, with no Dock icon.',
      'The first time you turn on closed-lid mode, macOS opens Login Items & Extensions: switch Lidless on under Allow in the Background. Once, with no password.',
    ],
    signed: 'Signed with a Developer ID and notarized by Apple · Apple Silicon and Intel',
    source: 'Source code on GitHub',
  },
};
