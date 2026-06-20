// ============================================================
// NUXBET - FIFA World Cup 2026 Data
// All 48 teams, 12 groups, and group stage fixtures
// ============================================================

// Flag URL helper — circle flags CDN
function flagUrl(iso) {
  return `https://hatscripts.github.io/circle-flags/flags/${iso}.svg`;
}

const TEAMS = {
  MEX: { code: 'MEX', name: 'المكسيك', nameEn: 'Mexico', iso: 'mx', group: 'A' },
  RSA: { code: 'RSA', name: 'جنوب أفريقيا', nameEn: 'South Africa', iso: 'za', group: 'A' },
  KOR: { code: 'KOR', name: 'كوريا الجنوبية', nameEn: 'South Korea', iso: 'kr', group: 'A' },
  CZE: { code: 'CZE', name: 'التشيك', nameEn: 'Czechia', iso: 'cz', group: 'A' },

  CAN: { code: 'CAN', name: 'كندا', nameEn: 'Canada', iso: 'ca', group: 'B' },
  BIH: { code: 'BIH', name: 'البوسنة والهرسك', nameEn: 'Bosnia & Herzegovina', iso: 'ba', group: 'B' },
  QAT: { code: 'QAT', name: 'قطر', nameEn: 'Qatar', iso: 'qa', group: 'B' },
  SUI: { code: 'SUI', name: 'سويسرا', nameEn: 'Switzerland', iso: 'ch', group: 'B' },

  BRA: { code: 'BRA', name: 'البرازيل', nameEn: 'Brazil', iso: 'br', group: 'C' },
  MAR: { code: 'MAR', name: 'المغرب', nameEn: 'Morocco', iso: 'ma', group: 'C' },
  HAI: { code: 'HAI', name: 'هايتي', nameEn: 'Haiti', iso: 'ht', group: 'C' },
  SCO: { code: 'SCO', name: 'اسكتلندا', nameEn: 'Scotland', iso: 'gb-sct', group: 'C' },

  USA: { code: 'USA', name: 'الولايات المتحدة', nameEn: 'USA', iso: 'us', group: 'D' },
  PAR: { code: 'PAR', name: 'باراغواي', nameEn: 'Paraguay', iso: 'py', group: 'D' },
  AUS: { code: 'AUS', name: 'أستراليا', nameEn: 'Australia', iso: 'au', group: 'D' },
  TUR: { code: 'TUR', name: 'تركيا', nameEn: 'Türkiye', iso: 'tr', group: 'D' },

  GER: { code: 'GER', name: 'ألمانيا', nameEn: 'Germany', iso: 'de', group: 'E' },
  CUW: { code: 'CUW', name: 'كوراساو', nameEn: 'Curaçao', iso: 'cw', group: 'E' },
  CIV: { code: 'CIV', name: 'ساحل العاج', nameEn: 'Ivory Coast', iso: 'ci', group: 'E' },
  ECU: { code: 'ECU', name: 'الإكوادور', nameEn: 'Ecuador', iso: 'ec', group: 'E' },

  NED: { code: 'NED', name: 'هولندا', nameEn: 'Netherlands', iso: 'nl', group: 'F' },
  JPN: { code: 'JPN', name: 'اليابان', nameEn: 'Japan', iso: 'jp', group: 'F' },
  SWE: { code: 'SWE', name: 'السويد', nameEn: 'Sweden', iso: 'se', group: 'F' },
  TUN: { code: 'TUN', name: 'تونس', nameEn: 'Tunisia', iso: 'tn', group: 'F' },

  BEL: { code: 'BEL', name: 'بلجيكا', nameEn: 'Belgium', iso: 'be', group: 'G' },
  EGY: { code: 'EGY', name: 'مصر', nameEn: 'Egypt', iso: 'eg', group: 'G' },
  IRN: { code: 'IRN', name: 'إيران', nameEn: 'Iran', iso: 'ir', group: 'G' },
  NZL: { code: 'NZL', name: 'نيوزيلندا', nameEn: 'New Zealand', iso: 'nz', group: 'G' },

  ESP: { code: 'ESP', name: 'إسبانيا', nameEn: 'Spain', iso: 'es', group: 'H' },
  CPV: { code: 'CPV', name: 'الرأس الأخضر', nameEn: 'Cape Verde', iso: 'cv', group: 'H' },
  KSA: { code: 'KSA', name: 'السعودية', nameEn: 'Saudi Arabia', iso: 'sa', group: 'H' },
  URU: { code: 'URU', name: 'أوروغواي', nameEn: 'Uruguay', iso: 'uy', group: 'H' },

  FRA: { code: 'FRA', name: 'فرنسا', nameEn: 'France', iso: 'fr', group: 'I' },
  SEN: { code: 'SEN', name: 'السنغال', nameEn: 'Senegal', iso: 'sn', group: 'I' },
  IRQ: { code: 'IRQ', name: 'العراق', nameEn: 'Iraq', iso: 'iq', group: 'I' },
  NOR: { code: 'NOR', name: 'النرويج', nameEn: 'Norway', iso: 'no', group: 'I' },

  ARG: { code: 'ARG', name: 'الأرجنتين', nameEn: 'Argentina', iso: 'ar', group: 'J' },
  ALG: { code: 'ALG', name: 'الجزائر', nameEn: 'Algeria', iso: 'dz', group: 'J' },
  AUT: { code: 'AUT', name: 'النمسا', nameEn: 'Austria', iso: 'at', group: 'J' },
  JOR: { code: 'JOR', name: 'الأردن', nameEn: 'Jordan', iso: 'jo', group: 'J' },

  POR: { code: 'POR', name: 'البرتغال', nameEn: 'Portugal', iso: 'pt', group: 'K' },
  COD: { code: 'COD', name: 'جمهورية الكونغو الديمقراطية', nameEn: 'DR Congo', iso: 'cd', group: 'K' },
  UZB: { code: 'UZB', name: 'أوزبكستان', nameEn: 'Uzbekistan', iso: 'uz', group: 'K' },
  COL: { code: 'COL', name: 'كولومبيا', nameEn: 'Colombia', iso: 'co', group: 'K' },

  ENG: { code: 'ENG', name: 'إنجلترا', nameEn: 'England', iso: 'gb-eng', group: 'L' },
  CRO: { code: 'CRO', name: 'كرواتيا', nameEn: 'Croatia', iso: 'hr', group: 'L' },
  GHA: { code: 'GHA', name: 'غانا', nameEn: 'Ghana', iso: 'gh', group: 'L' },
  PAN: { code: 'PAN', name: 'بنما', nameEn: 'Panama', iso: 'pa', group: 'L' },
};

const GROUPS = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'CPV', 'KSA', 'URU'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
};

// Matchday 1: June 11-18 (Mecca time UTC+3)
// Matchday 2: June 18-24
// Matchday 3: June 24-28
// All times are in Mecca time (UTC+3) — verified from beIN Sports / yallakora / alarabiya
const MATCHES = {
  1: [
    { id: 'm1_01', home: 'MEX', away: 'RSA', group: 'A', date: '2026-06-11', time: '22:00', result: { home: 2, away: 0 } },
    { id: 'm1_02', home: 'KOR', away: 'CZE', group: 'A', date: '2026-06-12', time: '05:00', result: { home: 2, away: 1 } },
    { id: 'm1_03', home: 'CAN', away: 'BIH', group: 'B', date: '2026-06-12', time: '22:00', result: { home: 1, away: 1 } },
    { id: 'm1_04', home: 'USA', away: 'PAR', group: 'D', date: '2026-06-13', time: '04:00', result: { home: 4, away: 1 } },
    { id: 'm1_05', home: 'QAT', away: 'SUI', group: 'B', date: '2026-06-13', time: '22:00', result: null },
    { id: 'm1_06', home: 'BRA', away: 'MAR', group: 'C', date: '2026-06-14', time: '01:00', result: null },
    { id: 'm1_07', home: 'HAI', away: 'SCO', group: 'C', date: '2026-06-14', time: '04:00', result: null },
    { id: 'm1_08', home: 'AUS', away: 'TUR', group: 'D', date: '2026-06-14', time: '07:00', result: null },
    { id: 'm1_09', home: 'GER', away: 'CUW', group: 'E', date: '2026-06-14', time: '20:00', result: null },
    { id: 'm1_10', home: 'CIV', away: 'ECU', group: 'E', date: '2026-06-15', time: '02:00', result: null },
    { id: 'm1_11', home: 'NED', away: 'JPN', group: 'F', date: '2026-06-14', time: '23:00', result: null },
    { id: 'm1_12', home: 'TUN', away: 'SWE', group: 'F', date: '2026-06-15', time: '05:00', result: null },
    { id: 'm1_13', home: 'ESP', away: 'CPV', group: 'H', date: '2026-06-15', time: '19:00', result: null },
    { id: 'm1_14', home: 'BEL', away: 'EGY', group: 'G', date: '2026-06-15', time: '22:00', result: null },
    { id: 'm1_15', home: 'KSA', away: 'URU', group: 'H', date: '2026-06-16', time: '01:00', result: null },
    { id: 'm1_16', home: 'IRN', away: 'NZL', group: 'G', date: '2026-06-16', time: '04:00', result: null },
    { id: 'm1_17', home: 'FRA', away: 'SEN', group: 'I', date: '2026-06-16', time: '22:00', result: null },
    { id: 'm1_18', home: 'IRQ', away: 'NOR', group: 'I', date: '2026-06-17', time: '01:00', result: null },
    { id: 'm1_19', home: 'ARG', away: 'ALG', group: 'J', date: '2026-06-17', time: '04:00', result: null },
    { id: 'm1_20', home: 'AUT', away: 'JOR', group: 'J', date: '2026-06-17', time: '07:00', result: null },
    { id: 'm1_21', home: 'POR', away: 'COD', group: 'K', date: '2026-06-17', time: '20:00', result: null },
    { id: 'm1_22', home: 'UZB', away: 'COL', group: 'K', date: '2026-06-18', time: '05:00', result: null },
    { id: 'm1_23', home: 'ENG', away: 'CRO', group: 'L', date: '2026-06-17', time: '23:00', result: null },
    { id: 'm1_24', home: 'GHA', away: 'PAN', group: 'L', date: '2026-06-18', time: '02:00', result: null },
  ],
  2: [
    // السبت 2026/06/20 - الجولة 2
    { id: 'm2_01', home: 'SCO', away: 'MAR', group: 'C', date: '2026-06-20', time: '13:00', result: null },
    { id: 'm2_02', home: 'BRA', away: 'HAI', group: 'C', date: '2026-06-20', time: '13:00', result: null },
    { id: 'm2_03', home: 'TUR', away: 'PAR', group: 'D', date: '2026-06-20', time: '13:00', result: null },
    { id: 'm2_04', home: 'NED', away: 'SWE', group: 'F', date: '2026-06-20', time: '20:00', result: null },
    { id: 'm2_05', home: 'GER', away: 'CIV', group: 'E', date: '2026-06-20', time: '23:00', result: null },
    // الأحد 2026/06/21
    { id: 'm2_06', home: 'ECU', away: 'CUW', group: 'E', date: '2026-06-21', time: '03:00', result: null },
    { id: 'm2_07', home: 'TUN', away: 'JPN', group: 'F', date: '2026-06-21', time: '07:00', result: null },
    { id: 'm2_08', home: 'ESP', away: 'KSA', group: 'H', date: '2026-06-21', time: '19:00', result: null },
    { id: 'm2_09', home: 'BEL', away: 'IRN', group: 'G', date: '2026-06-21', time: '22:00', result: null },
    // الإثنين 2026/06/22
    { id: 'm2_10', home: 'URU', away: 'CPV', group: 'H', date: '2026-06-22', time: '01:00', result: null },
    { id: 'm2_11', home: 'NZL', away: 'EGY', group: 'G', date: '2026-06-22', time: '04:00', result: null },
    { id: 'm2_12', home: 'ARG', away: 'AUT', group: 'J', date: '2026-06-22', time: '20:00', result: null },
    // الثلاثاء 2026/06/23
    { id: 'm2_13', home: 'FRA', away: 'IRQ', group: 'I', date: '2026-06-23', time: '00:00', result: null },
    { id: 'm2_14', home: 'NOR', away: 'SEN', group: 'I', date: '2026-06-23', time: '03:00', result: null },
    { id: 'm2_15', home: 'JOR', away: 'ALG', group: 'J', date: '2026-06-23', time: '06:00', result: null },
    { id: 'm2_16', home: 'POR', away: 'UZB', group: 'K', date: '2026-06-23', time: '20:00', result: null },
    { id: 'm2_17', home: 'ENG', away: 'GHA', group: 'L', date: '2026-06-23', time: '23:00', result: null },
    // الأربعاء 2026/06/24
    { id: 'm2_18', home: 'PAN', away: 'CRO', group: 'L', date: '2026-06-24', time: '02:00', result: null },
    { id: 'm2_19', home: 'COL', away: 'COD', group: 'K', date: '2026-06-24', time: '05:00', result: null },
    { id: 'm2_20', home: 'SUI', away: 'CAN', group: 'B', date: '2026-06-24', time: '22:00', result: null },
    { id: 'm2_21', home: 'BIH', away: 'QAT', group: 'B', date: '2026-06-24', time: '22:00', result: null },
  ],
  3: [
    // الخميس 2026/06/25
    { id: 'm3_01', home: 'SCO', away: 'BRA', group: 'C', date: '2026-06-25', time: '01:00', result: null },
    { id: 'm3_02', home: 'MAR', away: 'HAI', group: 'C', date: '2026-06-25', time: '01:00', result: null },
    { id: 'm3_03', home: 'CZE', away: 'MEX', group: 'A', date: '2026-06-25', time: '04:00', result: null },
    { id: 'm3_04', home: 'RSA', away: 'KOR', group: 'A', date: '2026-06-25', time: '04:00', result: null },
    { id: 'm3_05', home: 'ECU', away: 'GER', group: 'E', date: '2026-06-25', time: '23:00', result: null },
    { id: 'm3_06', home: 'CUW', away: 'CIV', group: 'E', date: '2026-06-25', time: '23:00', result: null },
    // الجمعة 2026/06/26
    { id: 'm3_07', home: 'TUN', away: 'NED', group: 'F', date: '2026-06-26', time: '02:00', result: null },
    { id: 'm3_08', home: 'JPN', away: 'SWE', group: 'F', date: '2026-06-26', time: '02:00', result: null },
    { id: 'm3_09', home: 'TUR', away: 'USA', group: 'D', date: '2026-06-26', time: '05:00', result: null },
    { id: 'm3_10', home: 'PAR', away: 'AUS', group: 'D', date: '2026-06-26', time: '05:00', result: null },
    { id: 'm3_11', home: 'NOR', away: 'FRA', group: 'I', date: '2026-06-26', time: '22:00', result: null },
    { id: 'm3_12', home: 'SEN', away: 'IRQ', group: 'I', date: '2026-06-26', time: '22:00', result: null },
    // السبت 2026/06/27
    { id: 'm3_13', home: 'URU', away: 'ESP', group: 'H', date: '2026-06-27', time: '03:00', result: null },
    { id: 'm3_14', home: 'CPV', away: 'KSA', group: 'H', date: '2026-06-27', time: '03:00', result: null },
    { id: 'm3_15', home: 'NZL', away: 'BEL', group: 'G', date: '2026-06-27', time: '06:00', result: null },
    { id: 'm3_16', home: 'EGY', away: 'IRN', group: 'G', date: '2026-06-27', time: '06:00', result: null },
    // الأحد 2026/06/28
    { id: 'm3_17', home: 'PAN', away: 'ENG', group: 'L', date: '2026-06-28', time: '00:00', result: null },
    { id: 'm3_18', home: 'CRO', away: 'GHA', group: 'L', date: '2026-06-28', time: '00:00', result: null },
    { id: 'm3_19', home: 'COL', away: 'POR', group: 'K', date: '2026-06-28', time: '02:30', result: null },
    { id: 'm3_20', home: 'COD', away: 'UZB', group: 'K', date: '2026-06-28', time: '02:30', result: null },
    { id: 'm3_21', home: 'JOR', away: 'ARG', group: 'J', date: '2026-06-28', time: '05:00', result: null },
    { id: 'm3_22', home: 'ALG', away: 'AUT', group: 'J', date: '2026-06-28', time: '05:00', result: null },
  ]
};

const MATCHDAY_INFO = {
  1: { name: 'الجولة الأولى', nameEn: 'Matchday 1', dateRange: '11 - 18 يونيو', deadline: '2026-06-11T17:00:00' },
  2: { name: 'الجولة الثانية', nameEn: 'Matchday 2', dateRange: '20 - 24 يونيو', deadline: '2026-06-20T10:00:00' },
  3: { name: 'الجولة الثالثة', nameEn: 'Matchday 3', dateRange: '25 - 28 يونيو', deadline: '2026-06-25T00:00:00' },
};

// Avatar options — local player images (add your own to img/avatars/)
// Name files: 1.jpeg, 2.jpeg, 3.jpeg, etc.
const AVATARS = [
  'img/avatars/1.jpeg',
  'img/avatars/2.jpeg',
  'img/avatars/3.jpeg',
  'img/avatars/4.jpeg',
  'img/avatars/5.jpeg',
  'img/avatars/6.jpeg',
  'img/avatars/7.jpeg',
  'img/avatars/8.jpeg',
  'img/avatars/9.jpeg',
  'img/avatars/10.jpeg',
  'img/avatars/11.jpeg',
  'img/avatars/12.jpeg',
  'img/avatars/13.jpeg',
  'img/avatars/14.jpeg',
  'img/avatars/15.jpeg',
  'img/avatars/16.jpeg',
];

// Format date for display
function formatMatchDate(dateStr) {
  const date = new Date(dateStr);
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function getMatchStatus(match) {
  if (match.result !== null) return 'played';
  const now = new Date();
  const matchDate = new Date(`${match.date}T${match.time}:00+03:00`);
  const matchEndApprox = new Date(matchDate.getTime() + 3 * 60 * 60 * 1000); // ~3 hours after kickoff
  if (now >= matchEndApprox) return 'ended'; // match likely finished but no result entered yet
  if (now >= matchDate) return 'live';
  return 'upcoming';
}
