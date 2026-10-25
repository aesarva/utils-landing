// Тексты мира Ochre. Факты — из README и README.ru приложения (../ochre, develop); названия вкладок —
// как в панели приложения. Частота «2 с» — значение по умолчанию (AppSettings.defaultInterval).
import type { Lang } from '../../lib/schema';

export type Tab = 'overview' | 'cpu' | 'memory' | 'network' | 'disk';

interface OchreCopy {
  lede: string;
  download: string;
  demo: string;
  demoCaption: string;
  superLabel: string;
  performanceLabel: string;
  gpuLabel: string;
  tempLabel: string;
  showsHead: string;
  showsSub: string;
  tabs: Record<Tab, { name: string; what: string }>;
  every: string;
  refresh: string;
  /** Подпись под табло отправлений: частоты из README. */
  cadence: string;
  facts: { title: string; text: string }[];
  appHead: string;
  appSub: string;
  shots: { panel: Shot; cpu: Shot; sensors: Shot };
  /** Пометка о языке интерфейса (пустая на русской странице). */
  uiNote: string;
  moreHead: string;
  more: { title: string; text: string }[];
  menubarAlt: string;
  installHead: string;
  steps: string[];
  permissions: string;
  platforms: string;
  source: string;
}

interface Shot {
  title: string;
  text: string;
  alt: string;
}

export const OCHRE_COPY: Record<Lang, OchreCopy> = {
  ru: {
    lede: 'Каждое ядро CPU и GPU на живой карте кристалла, которая раскаляется вместе с нагрузкой.',
    download: 'Скачать для macOS',
    demo: 'Демо-данные',
    demoCaption:
      'Демо: карта кристалла M5 Pro — 6 Super-ядер, 12 Performance-ядер и GPU на 20 ядер, окрашенные по загрузке. Ochre показывает ваш собственный чип.',
    superLabel: 'Super 6 ядер',
    performanceLabel: 'Performance 12 ядер',
    gpuLabel: 'GPU 20 ядер',
    tempLabel: 'Температура CPU',
    showsHead: 'Что показывает Ochre',
    showsSub: 'Прямо из строки меню',
    tabs: {
      overview: { name: 'Обзор', what: 'Весь Mac одним взглядом' },
      cpu: { name: 'CPU', what: 'Каждое ядро по кластерам' },
      memory: { name: 'Память', what: 'Давление и занятость' },
      network: { name: 'Сеть', what: 'Загрузка и отдача' },
      disk: { name: 'Диск', what: 'Скорость и свободное место' },
    },
    every: '2 сек',
    refresh: 'Обновляется раз в 2 секунды (по умолчанию; можно 1 или 5)',
    cadence:
      'По умолчанию раз в 2 с, в настройках — 1 или 5 с. Температуры при закрытой панели — раз в 15 с, при открытой — раз в 2 с.',
    facts: [
      { title: 'Лёгкое', text: 'Около 0,5% одного ядра и 14 МБ памяти при закрытой панели.' },
      { title: 'Нативное', text: 'Swift, SwiftUI и AppKit. Без Electron и фоновых демонов.' },
      { title: 'Приватное', text: 'Без аналитики и аккаунтов. Только проверка обновлений раз в сутки.' },
    ],
    appHead: 'В приложении',
    appSub: 'Настоящая панель, не макет',
    shots: {
      panel: {
        title: 'Панель под строкой меню',
        text: 'Обзор: карта кристалла, процессор, память, сеть и диск.',
        alt: 'Панель Ochre под значком в строке меню: на карте кристалла шесть Super-ядер на 100% горят красным, двенадцать Performance-ядер графитовые, ниже графики CPU, памяти, сети и диска',
      },
      cpu: {
        title: 'CPU',
        text: 'Карта кристалла, кластеры и история загрузки.',
        alt: 'Вкладка CPU: карта кристалла и история загрузки всех ядер, Super-ядер и Performance-ядер',
      },
      sensors: {
        title: 'Датчики',
        text: 'Температуры, вентиляторы, мощность и батарея.',
        alt: 'Вкладка «Датчики»: температуры по группам, вентиляторы, загрузка GPU, мощность системы и состояние батареи',
      },
    },
    uiNote: '',
    moreHead: 'Ещё на борту',
    more: [
      {
        title: 'Строка меню',
        text: 'Значок из нужных сегментов: мини-кристалл, график CPU, CPU %, память %, температура, сеть. Ширина фиксирована — строка меню не дёргается.',
      },
      {
        title: 'Оповещения',
        text: 'Температура и загрузка CPU, давление памяти, место на диске. Порог должен продержаться заданное время, например 95\u00a0°C 30 секунд.',
      },
      {
        title: 'Обновления',
        text: 'Раз в сутки Ochre проверяет новую версию. «Установить и перезапустить» скачивает её, проверяет подпись и запускает.',
      },
      {
        title: 'Процессы',
        text: 'Самые активные процессы по CPU или памяти. Клик по строке копирует PID.',
      },
    ],
    menubarAlt: 'Значок в строке меню: мини-кристалл и температура 67°',
    installHead: 'Как установить',
    steps: [
      'Скачайте DMG.',
      'Откройте его и перетащите Ochre в «Программы».',
      'Запустите Ochre: он появится только в строке меню, без значка в Dock.',
    ],
    permissions: 'Других разрешений не нужно — только уведомления, если включить оповещения.',
    platforms: 'Apple Silicon и Intel · подписано и нотаризовано Apple',
    source: 'Исходный код на GitHub',
  },
  en: {
    lede: 'Every CPU core and GPU core on a live die map that heats up with the load.',
    download: 'Download for macOS',
    demo: 'Demo data',
    demoCaption:
      'Demo: the die map of an M5 Pro — 6 Super cores, 12 Performance cores and a 20-core GPU, coloured by load. Ochre shows your own chip.',
    superLabel: 'Super 6 cores',
    performanceLabel: 'Performance 12 cores',
    gpuLabel: 'GPU 20 cores',
    tempLabel: 'CPU temperature',
    showsHead: 'What Ochre shows',
    showsSub: 'Live from your menu bar',
    tabs: {
      overview: { name: 'Overview', what: 'Your Mac at a glance' },
      cpu: { name: 'CPU', what: 'Every core, cluster by cluster' },
      memory: { name: 'Memory', what: 'Pressure and usage' },
      network: { name: 'Network', what: 'Upload and download' },
      disk: { name: 'Disk', what: 'Activity and free space' },
    },
    every: '2 sec',
    refresh: 'Refreshes every 2 seconds (default; 1 or 5 also available)',
    cadence:
      'Every 2 s by default; 1 or 5 s in Settings. Temperatures every 15 s with the panel closed, every 2 s while it is open.',
    facts: [
      { title: 'Lightweight', text: 'About 0.5% of one core and 14 MB of memory with the panel closed.' },
      { title: 'Native', text: 'Swift, SwiftUI and AppKit. No Electron, no helper daemon.' },
      { title: 'Private', text: 'No analytics, no account. Only a daily update check.' },
    ],
    appHead: 'In the app',
    appSub: 'The real panel, not a mock-up',
    shots: {
      panel: {
        title: 'The panel under the menu bar',
        text: 'Overview: the die map, CPU, memory, network and disk.',
        alt: "Ochre's panel open under its menu bar item: the die map shows six Super cores at 100% in hot red and twelve Performance cores in graphite, with CPU, memory, network and disk sparklines below",
      },
      cpu: {
        title: 'CPU',
        text: 'Die map, clusters and load history.',
        alt: 'CPU tab: die map and load history for all cores, Super cores and Performance cores',
      },
      sensors: {
        title: 'Sensors',
        text: 'Temperatures, fans, power and battery.',
        alt: 'Sensors tab: grouped temperatures, fan speeds, GPU load, system power and battery health',
      },
    },
    uiNote: 'The interface is in Russian for now.',
    moreHead: 'Also on board',
    more: [
      {
        title: 'Menu bar',
        text: 'Build the item from the segments you need: mini die map, CPU graph, CPU %, memory %, temperature, network. Fixed widths, so the menu bar never jitters.',
      },
      {
        title: 'Alerts',
        text: 'CPU temperature and load, memory pressure, low disk space. A threshold has to hold as long as you choose, for example 95\u00a0°C for 30 seconds.',
      },
      {
        title: 'Updates',
        text: 'Ochre checks once a day. Install and Relaunch downloads the new version, verifies its signature and starts it.',
      },
      {
        title: 'Processes',
        text: 'The busiest processes by CPU or memory. Click a row to copy its PID.',
      },
    ],
    menubarAlt: 'Menu bar item: a mini die map and the temperature, 67°',
    installHead: 'How to install',
    steps: [
      'Download the DMG.',
      'Open it and drag Ochre to Applications.',
      'Launch Ochre. It lives in the menu bar only, with no Dock icon.',
    ],
    permissions: 'No other permissions needed — only notifications, if you turn alerts on.',
    platforms: 'Apple Silicon and Intel · signed and notarized by Apple',
    source: 'Source code on GitHub',
  },
};
