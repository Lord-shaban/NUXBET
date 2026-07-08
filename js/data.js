// ============================================================
// NUXBET - FIFA World Cup 2026 Data
// All 48 teams, 12 groups, group stage + knockout fixtures
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

// ============================================================
// GROUP STAGE MATCHES (Matchdays 1-3)
// All times are in Mecca time (UTC+3)
// ============================================================
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
    { id: 'm2_01', home: 'CZE', away: 'RSA', group: 'A', date: '2026-06-18', time: '19:00', result: null },
    { id: 'm2_02', home: 'SUI', away: 'BIH', group: 'B', date: '2026-06-18', time: '22:00', result: null },
    { id: 'm2_03', home: 'CAN', away: 'QAT', group: 'B', date: '2026-06-19', time: '01:00', result: null },
    { id: 'm2_04', home: 'MEX', away: 'KOR', group: 'A', date: '2026-06-19', time: '04:00', result: null },
    { id: 'm2_05', home: 'USA', away: 'AUS', group: 'D', date: '2026-06-19', time: '22:00', result: null },
    { id: 'm2_06', home: 'SCO', away: 'MAR', group: 'C', date: '2026-06-20', time: '01:00', result: null },
    { id: 'm2_07', home: 'BRA', away: 'HAI', group: 'C', date: '2026-06-20', time: '03:30', result: null },
    { id: 'm2_08', home: 'TUR', away: 'PAR', group: 'D', date: '2026-06-20', time: '06:00', result: null },
    { id: 'm2_09', home: 'NED', away: 'SWE', group: 'F', date: '2026-06-20', time: '20:00', result: null },
    { id: 'm2_10', home: 'GER', away: 'CIV', group: 'E', date: '2026-06-20', time: '23:00', result: null },
    { id: 'm2_11', home: 'ECU', away: 'CUW', group: 'E', date: '2026-06-21', time: '03:00', result: null },
    { id: 'm2_12', home: 'TUN', away: 'JPN', group: 'F', date: '2026-06-21', time: '07:00', result: null },
    { id: 'm2_13', home: 'ESP', away: 'KSA', group: 'H', date: '2026-06-21', time: '19:00', result: null },
    { id: 'm2_14', home: 'BEL', away: 'IRN', group: 'G', date: '2026-06-21', time: '22:00', result: null },
    { id: 'm2_15', home: 'URU', away: 'CPV', group: 'H', date: '2026-06-22', time: '01:00', result: null },
    { id: 'm2_16', home: 'NZL', away: 'EGY', group: 'G', date: '2026-06-22', time: '04:00', result: null },
    { id: 'm2_17', home: 'ARG', away: 'AUT', group: 'J', date: '2026-06-22', time: '20:00', result: null },
    { id: 'm2_18', home: 'FRA', away: 'IRQ', group: 'I', date: '2026-06-23', time: '00:00', result: null },
    { id: 'm2_19', home: 'NOR', away: 'SEN', group: 'I', date: '2026-06-23', time: '03:00', result: null },
    { id: 'm2_20', home: 'JOR', away: 'ALG', group: 'J', date: '2026-06-23', time: '06:00', result: null },
    { id: 'm2_21', home: 'POR', away: 'UZB', group: 'K', date: '2026-06-23', time: '20:00', result: null },
    { id: 'm2_22', home: 'ENG', away: 'GHA', group: 'L', date: '2026-06-23', time: '23:00', result: null },
    { id: 'm2_23', home: 'PAN', away: 'CRO', group: 'L', date: '2026-06-24', time: '02:00', result: null },
    { id: 'm2_24', home: 'COL', away: 'COD', group: 'K', date: '2026-06-24', time: '05:00', result: null },
  ],
  3: [
    { id: 'm3_01', home: 'SUI', away: 'CAN', group: 'B', date: '2026-06-24', time: '22:00', result: null },
    { id: 'm3_02', home: 'BIH', away: 'QAT', group: 'B', date: '2026-06-24', time: '22:00', result: null },
    { id: 'm3_03', home: 'SCO', away: 'BRA', group: 'C', date: '2026-06-25', time: '01:00', result: null },
    { id: 'm3_04', home: 'MAR', away: 'HAI', group: 'C', date: '2026-06-25', time: '01:00', result: null },
    { id: 'm3_05', home: 'CZE', away: 'MEX', group: 'A', date: '2026-06-25', time: '04:00', result: null },
    { id: 'm3_06', home: 'RSA', away: 'KOR', group: 'A', date: '2026-06-25', time: '04:00', result: null },
    { id: 'm3_07', home: 'ECU', away: 'GER', group: 'E', date: '2026-06-25', time: '23:00', result: null },
    { id: 'm3_08', home: 'CUW', away: 'CIV', group: 'E', date: '2026-06-25', time: '23:00', result: null },
    { id: 'm3_09', home: 'TUN', away: 'NED', group: 'F', date: '2026-06-26', time: '02:00', result: null },
    { id: 'm3_10', home: 'JPN', away: 'SWE', group: 'F', date: '2026-06-26', time: '02:00', result: null },
    { id: 'm3_11', home: 'TUR', away: 'USA', group: 'D', date: '2026-06-26', time: '05:00', result: null },
    { id: 'm3_12', home: 'PAR', away: 'AUS', group: 'D', date: '2026-06-26', time: '05:00', result: null },
    { id: 'm3_13', home: 'NOR', away: 'FRA', group: 'I', date: '2026-06-26', time: '22:00', result: null },
    { id: 'm3_14', home: 'SEN', away: 'IRQ', group: 'I', date: '2026-06-26', time: '22:00', result: null },
    { id: 'm3_15', home: 'URU', away: 'ESP', group: 'H', date: '2026-06-27', time: '03:00', result: null },
    { id: 'm3_16', home: 'CPV', away: 'KSA', group: 'H', date: '2026-06-27', time: '03:00', result: null },
    { id: 'm3_17', home: 'NZL', away: 'BEL', group: 'G', date: '2026-06-27', time: '06:00', result: null },
    { id: 'm3_18', home: 'EGY', away: 'IRN', group: 'G', date: '2026-06-27', time: '06:00', result: null },
    { id: 'm3_19', home: 'PAN', away: 'ENG', group: 'L', date: '2026-06-28', time: '00:00', result: null },
    { id: 'm3_20', home: 'CRO', away: 'GHA', group: 'L', date: '2026-06-28', time: '00:00', result: null },
    { id: 'm3_21', home: 'COL', away: 'POR', group: 'K', date: '2026-06-28', time: '02:30', result: null },
    { id: 'm3_22', home: 'COD', away: 'UZB', group: 'K', date: '2026-06-28', time: '02:30', result: null },
    { id: 'm3_23', home: 'JOR', away: 'ARG', group: 'J', date: '2026-06-28', time: '05:00', result: null },
    { id: 'm3_24', home: 'ALG', away: 'AUT', group: 'J', date: '2026-06-28', time: '05:00', result: null },
  ]
};

// ============================================================
// KNOCKOUT STAGE DATA
// ============================================================

// Knockout round definitions
const KNOCKOUT_ROUNDS = {
  R32: { key: 'R32', name: 'دور الـ 32', nameEn: 'Round of 32', short: 'R32', icon: '⚔️', matchCount: 16 },
  R16: { key: 'R16', name: 'دور الـ 16', nameEn: 'Round of 16', short: 'R16', icon: '🔥', matchCount: 8 },
  QF:  { key: 'QF',  name: 'ربع النهائي', nameEn: 'Quarter-finals', short: 'QF', icon: '🏅', matchCount: 4 },
  SF:  { key: 'SF',  name: 'نصف النهائي', nameEn: 'Semi-finals', short: 'SF', icon: '⭐', matchCount: 2 },
  '3RD': { key: '3RD', name: 'المركز الثالث', nameEn: 'Third Place', short: '3rd', icon: '🥉', matchCount: 1 },
  FINAL: { key: 'FINAL', name: 'النهائي', nameEn: 'Final', short: 'F', icon: '🏆', matchCount: 1 },
};

// Points multiplier per knockout round (scales up importance)
const KNOCKOUT_MULTIPLIERS = {
  R32: 1,
  R16: 1,
  QF: 1,
  SF: 1,
  '3RD': 1,
  FINAL: 1
};

// Knockout matches — organized by round key
// home/away can be team codes OR placeholder strings like "1A" (winner group A), "2B" (runner-up group B), "3ABCD" (best third from groups A/B/C/D)
// The admin can update these from the panel as teams are confirmed
const KNOCKOUT_MATCHES = {
  R32: [
    // June 28
    { id: 'r32_01', home: 'RSA', away: 'CAN', round: 'R32', date: '2026-06-28', time: '22:00', venue: 'SoFi Stadium, Los Angeles', result: null },
    // June 29
    { id: 'r32_02', home: 'BRA', away: 'JPN', round: 'R32', date: '2026-06-29', time: '20:00', venue: 'NRG Stadium, Houston', result: null },
    { id: 'r32_03', home: 'GER', away: 'PAR', round: 'R32', date: '2026-06-29', time: '23:30', venue: 'Gillette Stadium, Boston', result: null },
    // June 30
    { id: 'r32_04', home: 'NED', away: 'MAR', round: 'R32', date: '2026-06-30', time: '04:00', venue: 'Estadio BBVA, Monterrey', result: null },
    { id: 'r32_05', home: 'CIV', away: 'NOR', round: 'R32', date: '2026-06-30', time: '20:00', venue: 'AT&T Stadium, Dallas', result: null },
    { id: 'r32_06', home: 'FRA', away: 'SWE', round: 'R32', date: '2026-07-01', time: '00:00', venue: 'Lincoln Financial Field, Philadelphia', result: null },
    // July 1
    { id: 'r32_07', home: 'MEX', away: 'ECU', round: 'R32', date: '2026-07-01', time: '03:00', venue: 'Estadio Azteca, Mexico City', result: null },
    { id: 'r32_08', home: 'ENG', away: 'COD', round: 'R32', date: '2026-07-01', time: '20:00', venue: 'Mercedes-Benz Stadium, Atlanta', result: null },
    { id: 'r32_09', home: 'BEL', away: 'SEN', round: 'R32', date: '2026-07-01', time: '23:00', venue: 'Lumen Field, Seattle', result: null },
    // July 2
    { id: 'r32_10', home: 'USA', away: 'BIH', round: 'R32', date: '2026-07-02', time: '03:00', venue: "Levi's Stadium, Santa Clara", result: null },
    { id: 'r32_11', home: 'ESP', away: 'AUT', round: 'R32', date: '2026-07-02', time: '20:00', venue: 'Hard Rock Stadium, Miami', result: null },
    { id: 'r32_12', home: 'COL', away: 'GHA', round: 'R32', date: '2026-07-02', time: '23:00', venue: 'BMO Field, Toronto', result: null },
    // July 3
    { id: 'r32_13', home: 'SUI', away: 'ALG', round: 'R32', date: '2026-07-03', time: '02:00', venue: 'BC Place, Vancouver', result: null },
    { id: 'r32_14', home: 'AUS', away: 'EGY', round: 'R32', date: '2026-07-03', time: '20:00', venue: 'AT&T Stadium, Dallas', result: null },
    { id: 'r32_15', home: 'ARG', away: 'CPV', round: 'R32', date: '2026-07-03', time: '23:00', venue: 'Hard Rock Stadium, Miami', result: null },
    { id: 'r32_16', home: 'POR', away: 'CRO', round: 'R32', date: '2026-07-03', time: '23:00', venue: 'Arrowhead Stadium, Kansas City', result: null },
  ],
  R16: [
    { id: 'r16_01', home: 'CAN', away: 'MAR', round: 'R16', date: '2026-07-04', time: '20:00', venue: 'هيوستن', result: null, sourceHome: 'r32_01', sourceAway: 'r32_02' },
    { id: 'r16_02', home: 'PAR', away: 'FRA', round: 'R16', date: '2026-07-05', time: '00:00', venue: 'فيلادلفيا', result: null, sourceHome: 'r32_03', sourceAway: 'r32_04' },
    { id: 'r16_03', home: 'BRA', away: 'NOR', round: 'R16', date: '2026-07-05', time: '23:00', venue: 'نيويورك/نيوجيرسي', result: null, sourceHome: 'r32_05', sourceAway: 'r32_06' },
    { id: 'r16_04', home: 'MEX', away: 'ENG', round: 'R16', date: '2026-07-06', time: '03:00', venue: 'مكسيكو سيتي', result: null, sourceHome: 'r32_07', sourceAway: 'r32_08' },
    { id: 'r16_05', home: 'POR', away: 'ESP', round: 'R16', date: '2026-07-06', time: '22:00', venue: 'دالاس', result: null, sourceHome: 'r32_09', sourceAway: 'r32_10' },
    { id: 'r16_06', home: 'USA', away: 'BEL', round: 'R16', date: '2026-07-07', time: '03:00', venue: 'سياتل', result: null, sourceHome: 'r32_11', sourceAway: 'r32_12' },
    { id: 'r16_07', home: 'ARG', away: 'EGY', round: 'R16', date: '2026-07-07', time: '19:00', venue: 'أتلانتا', result: null, sourceHome: 'r32_13', sourceAway: 'r32_14' },
    { id: 'r16_08', home: 'SUI', away: 'COL', round: 'R16', date: '2026-07-07', time: '23:00', venue: 'فانكوفر', result: null, sourceHome: 'r32_15', sourceAway: 'r32_16' },
  ],
  QF: [
    { id: 'qf_01', home: 'MAR', away: 'FRA', round: 'QF', date: '2026-07-09', time: '23:00', venue: 'TBD', result: null, sourceHome: 'r16_01', sourceAway: 'r16_02' },
    { id: 'qf_02', home: 'NOR', away: 'ENG', round: 'QF', date: '2026-07-12', time: '00:00', venue: 'TBD', result: null, sourceHome: 'r16_03', sourceAway: 'r16_04' },
    { id: 'qf_03', home: 'ESP', away: 'BEL', round: 'QF', date: '2026-07-10', time: '22:00', venue: 'TBD', result: null, sourceHome: 'r16_05', sourceAway: 'r16_06' },
    { id: 'qf_04', home: 'EGY', away: 'SUI', round: 'QF', date: '2026-07-12', time: '04:00', venue: 'TBD', result: null, sourceHome: 'r16_07', sourceAway: 'r16_08' },
  ],
  SF: [
    { id: 'sf_01', home: null, away: null, round: 'SF', date: '2026-07-13', time: '22:00', venue: 'TBD', result: null, sourceHome: 'qf_01', sourceAway: 'qf_02' },
    { id: 'sf_02', home: null, away: null, round: 'SF', date: '2026-07-14', time: '22:00', venue: 'TBD', result: null, sourceHome: 'qf_03', sourceAway: 'qf_04' },
  ],
  '3RD': [
    { id: '3rd_01', home: null, away: null, round: '3RD', date: '2026-07-18', time: '22:00', venue: 'Hard Rock Stadium, Miami', result: null, sourceHome: 'sf_01_loser', sourceAway: 'sf_02_loser' },
  ],
  FINAL: [
    { id: 'final_01', home: null, away: null, round: 'FINAL', date: '2026-07-19', time: '21:00', venue: 'MetLife Stadium, New Jersey', result: null, sourceHome: 'sf_01', sourceAway: 'sf_02' },
  ]
};

// All knockout round keys in order
const KNOCKOUT_ROUND_KEYS = ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];

// ============================================================
// MATCHDAY INFO (Groups + Knockout)
// ============================================================
const MATCHDAY_INFO = {
  // Group stage
  1: { name: 'الجولة الأولى', nameEn: 'Matchday 1', dateRange: '11 - 18 يونيو', deadline: '2026-06-11T17:00:00', type: 'group' },
  2: { name: 'الجولة الثانية', nameEn: 'Matchday 2', dateRange: '18 - 24 يونيو', deadline: '2026-06-18T16:00:00', type: 'group' },
  3: { name: 'الجولة الثالثة', nameEn: 'Matchday 3', dateRange: '24 - 28 يونيو', deadline: '2026-06-24T19:00:00', type: 'group' },
  // Knockout stage
  R32:   { name: 'دور الـ 32', nameEn: 'Round of 32', dateRange: '28 يونيو - 3 يوليو', deadline: '2026-06-28T19:00:00', type: 'knockout', icon: '⚔️' },
  R16:   { name: 'دور الـ 16', nameEn: 'Round of 16', dateRange: '4 - 7 يوليو', deadline: '2026-07-04T17:00:00', type: 'knockout', icon: '🔥' },
  QF:    { name: 'ربع النهائي', nameEn: 'Quarter-finals', dateRange: '9 - 11 يوليو', deadline: '2026-07-09T19:00:00', type: 'knockout', icon: '🏅' },
  SF:    { name: 'نصف النهائي', nameEn: 'Semi-finals', dateRange: '13 - 14 يوليو', deadline: '2026-07-13T19:00:00', type: 'knockout', icon: '⭐' },
  '3RD': { name: 'المركز الثالث', nameEn: 'Third Place', dateRange: '18 يوليو', deadline: '2026-07-18T19:00:00', type: 'knockout', icon: '🥉' },
  FINAL: { name: 'النهائي', nameEn: 'Final', dateRange: '19 يوليو', deadline: '2026-07-19T18:00:00', type: 'knockout', icon: '🏆' },
};

// Helper: get all matchday keys (group + knockout) in order
const ALL_MATCHDAY_KEYS = [1, 2, 3, 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];

// Helper: get matches for any matchday key (group or knockout)
function getMatchesForMD(mdKey) {
  if (typeof mdKey === 'number') return MATCHES[mdKey] || [];
  return KNOCKOUT_MATCHES[mdKey] || [];
}

// Helper: check if a matchday key is knockout
function isKnockoutMD(mdKey) {
  return typeof mdKey === 'string';
}

// Helper: get knockout multiplier for a matchday
function getKnockoutMultiplier(mdKey) {
  if (typeof mdKey === 'number') return 1; // group stage = ×1
  return KNOCKOUT_MULTIPLIERS[mdKey] || 1;
}

// Helper: get display label for a knockout match team (handles null/TBD)
function getKnockoutTeamLabel(teamCode, match) {
  if (teamCode && TEAMS[teamCode]) return TEAMS[teamCode].name;
  // For future rounds, show source info
  if (!teamCode) {
    if (match.sourceHome || match.sourceAway) return '—';
    return 'يُحدد لاحقاً';
  }
  return teamCode; // Fallback for placeholder codes
}

// ============================================================
// AVATAR OPTIONS
// ============================================================
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
