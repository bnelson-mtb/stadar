// Helper to build ESPN CDN logo URLs
const espn = (sport, id) => `https://a.espncdn.com/i/teamlogos/${sport}/500/${id}.png`

// Helper for PLL team logo URLs
const pll = (team) => `https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_${team}_primary_color.png`

// ============================================================
//  PRO LEAGUES
// ============================================================

const NBA = {
  'Utah Jazz':                { color: '#002B5C', logo: espn('nba', 'utah'), shortName: 'Jazz' },
  'Denver Nuggets':           { color: '#0E2240', logo: espn('nba', 'den'),  shortName: 'Nuggets' },
  'Phoenix Suns':             { color: '#1D1160', logo: espn('nba', 'phx'),  shortName: 'Suns' },
  'LA Lakers':                { color: '#552583', logo: espn('nba', 'lal'),  shortName: 'Lakers' },
  'Los Angeles Lakers':       { color: '#552583', logo: espn('nba', 'lal'),  shortName: 'Lakers' },
  'LA Clippers':              { color: '#C8102E', logo: espn('nba', 'lac'),  shortName: 'Clippers' },
  'Los Angeles Clippers':     { color: '#C8102E', logo: espn('nba', 'lac'),  shortName: 'Clippers' },
  'Portland Trail Blazers':   { color: '#E03A3E', logo: espn('nba', 'por'),  shortName: 'Blazers' },
  'Sacramento Kings':         { color: '#5A2D81', logo: espn('nba', 'sac'),  shortName: 'Kings' },
  'Golden State Warriors':    { color: '#1D428A', logo: espn('nba', 'gs'),   shortName: 'Warriors' },
  'Oklahoma City Thunder':    { color: '#007AC1', logo: espn('nba', 'okc'),  shortName: 'Thunder' },
  'Minnesota Timberwolves':   { color: '#0C2340', logo: espn('nba', 'min'),  shortName: 'Timberwolves' },
  'Dallas Mavericks':         { color: '#00538C', logo: espn('nba', 'dal'),  shortName: 'Mavericks' },
  'San Antonio Spurs':        { color: '#000000', logo: espn('nba', 'sa'),   shortName: 'Spurs' },
  'Memphis Grizzlies':        { color: '#5D76A9', logo: espn('nba', 'mem'),  shortName: 'Grizzlies' },
  'Houston Rockets':          { color: '#CE1141', logo: espn('nba', 'hou'),  shortName: 'Rockets' },
  'New Orleans Pelicans':     { color: '#0C2340', logo: espn('nba', 'no'),   shortName: 'Pelicans' },
}

const NHL = {
  'Utah Mammoth':             { color: '#131F33', logo: espn('nhl', 'uta'),  shortName: 'Utah Mammoth' },
  'Colorado Avalanche':       { color: '#6F263D', logo: espn('nhl', 'col'),  shortName: 'Avalanche' },
  'Vegas Golden Knights':     { color: '#B4975A', logo: espn('nhl', 'vgk'),  shortName: 'Golden Knights' },
  'Dallas Stars':             { color: '#006847', logo: espn('nhl', 'dal'),  shortName: 'Stars' },
  'Minnesota Wild':           { color: '#154734', logo: espn('nhl', 'min'),  shortName: 'Wild' },
  'St. Louis Blues':          { color: '#002F87', logo: espn('nhl', 'stl'),  shortName: 'Blues' },
  'Nashville Predators':      { color: '#FFB81C', logo: espn('nhl', 'nsh'),  shortName: 'Predators' },
  'Winnipeg Jets':            { color: '#041E42', logo: espn('nhl', 'wpg'),  shortName: 'Jets' },
  'Calgary Flames':           { color: '#D2001C', logo: espn('nhl', 'cgy'),  shortName: 'Flames' },
  'Edmonton Oilers':          { color: '#041E42', logo: espn('nhl', 'edm'),  shortName: 'Oilers' },
  'Vancouver Canucks':        { color: '#00205B', logo: espn('nhl', 'van'),  shortName: 'Canucks' },
  'Seattle Kraken':           { color: '#001628', logo: espn('nhl', 'sea'),  shortName: 'Kraken' },
  'Los Angeles Kings':        { color: '#111111', logo: espn('nhl', 'la'),   shortName: 'Kings' },
  'Anaheim Ducks':            { color: '#F47A38', logo: espn('nhl', 'ana'),  shortName: 'Ducks' },
  'San Jose Sharks':          { color: '#006D75', logo: espn('nhl', 'sj'),   shortName: 'Sharks' },
}

const MLS = {
  'Real Salt Lake':           { color: '#B30838', logo: espn('soccer', '4771'), shortName: 'RSL' },
}

const NLL = {
  'Utah Archers':             { color: '#1C4F3F', logo: null, shortName: 'Mammoth' },
}

const ECHL = {
  'Utah Grizzlies':           { color: '#002244', logo: null, shortName: 'Grizzlies' },
}

const PLL = {
  'Utah Archers':             { color: '#fc5016', logo: pll(archers), shortName: 'Archers' },
  'California Redwoods':      { color: '#fed200', logo: pll(redwoods), shortName: 'Redwoods' },
  'Carolina Chaos':           { color: '#D2001C', logo: pll(chaos), shortName: 'Chaos' },
  'Denver Outlaws':           { color: '#fb5014', logo: pll(outlaws), shortName: 'Outlaws' },
  'Boston Cannons':           { color: '#c61f30', logo: pll(cannons), shortName: 'Cannons' },
  'Maryland Whipsnakes':      { color: '#fd0000', logo: pll(whipsnakes), shortName: 'Whipsnakes' },
  'New York Atlas':           { color: '#00affc', logo: pll(atlas), shortName: 'Atlas' },
  'Philadelphia Waterdogs':   { color: '#6a1ec1', logo: pll(waterdogs), shortName: 'Waterdogs' },
}

const LOVB_TEAMS = {
  'LOVB Salt Lake Volleyball':{ color: '#E91E63', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/LOVB_Salt_Lake_logo.webp', shortName: 'LOVB SLC' },
}

// ============================================================
//  COLLEGE (NCAA)
//  One entry per school — shared across all sports and genders.
//  tmNames lists known Ticketmaster name variations.
// ============================================================

const NCAA = {
  // --- Utah schools ---
  'Utah': {
    color: '#CC0000',
    logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/4YPE-XPl_BOYwEen2dUq6A_96x96.png',
    shortName: 'Utes',
    tmNames: [
      "Utah Men's Basketball", "Utah Women's Basketball",
      'Utah Utes', 'Utah Utes Football',
      "Utah Utes Men's Soccer", "Utah Utes Women's Soccer",
      'Utah Gymnastics',
    ],
  },
  'BYU': {
    color: '#002654',
    logo: espn('ncaa', '252'),
    shortName: 'Cougars',
    tmNames: [
      'BYU Cougars', 'BYU Cougars Football',
      "BYU Cougars Men's Basketball", "BYU Cougars Women's Basketball", "BYU Cougars Baseball",
    ],
  },
  'Utah State': {
    color: '#0F2439',
    logo: espn('ncaa', '328'),
    shortName: 'Aggies',
    tmNames: [
      'Utah State Aggies', 'Utah State Aggies Football',
      "Utah State Aggies Men's Basketball", "Utah State Aggies Women's Basketball",
    ],
  },
  'Weber State': {
    color: '#4B2882',
    logo: espn('ncaa', '2692'),
    shortName: 'Wildcats',
    tmNames: [
      'Weber State Wildcats', 'Weber State Wildcats Football',
      "Weber State Wildcats Men's Basketball", "Weber State Wildcats Women's Basketball",
    ],
  },
  'Southern Utah': {
    color: '#CC0000',
    logo: espn('ncaa', '2572'),
    shortName: 'Thunderbirds',
    tmNames: [
      'Southern Utah Thunderbirds',
      "Southern Utah Thunderbirds Men's Basketball", "Southern Utah Thunderbirds Women's Basketball",
    ],
  },
  'Utah Tech': {
    color: '#BA0C2F',
    logo: espn('ncaa', '3101'),
    shortName: 'Trailblazers',
    tmNames: [
      'Utah Tech Trailblazers',
      "Utah Tech Trailblazers Men's Basketball", "Utah Tech Trailblazers Women's Basketball",
    ],
  },
  'Utah Valley': {
    color: '#275D38',
    logo: null, // not on ESPN CDN
    shortName: 'Wolverines',
    tmNames: [
      'Utah Valley Wolverines',
      "Utah Valley Wolverines Men's Basketball", "Utah Valley Wolverines Women's Basketball",
    ],
  },

  // --- Big 12 opponents (Utah & BYU's conference) ---
  'Arizona': {
    color: '#CC0033',
    logo: espn('ncaa', '12'),
    shortName: 'Wildcats',
    tmNames: [
      'Arizona Wildcats', 'Arizona Wildcats Football',
      "Arizona Wildcats Men's Basketball", "Arizona Wildcats Women's Basketball",
    ],
  },
  'Arizona State': {
    color: '#8C1D40',
    logo: espn('ncaa', '9'),
    shortName: 'Sun Devils',
    tmNames: [
      'Arizona State Sun Devils', 'Arizona State Sun Devils Football',
      "Arizona State Sun Devils Men's Basketball", "Arizona State Sun Devils Women's Basketball",
    ],
  },
  'Colorado': {
    color: '#CFB87C',
    logo: espn('ncaa', '38'),
    shortName: 'Buffaloes',
    tmNames: [
      'Colorado Buffaloes', 'Colorado Buffaloes Football',
      "Colorado Buffaloes Men's Basketball", "Colorado Buffaloes Women's Basketball",
    ],
  },
  'Iowa State': {
    color: '#C8102E',
    logo: espn('ncaa', '66'),
    shortName: 'Cyclones',
    tmNames: [
      'Iowa State Cyclones', 'Iowa State Cyclones Football',
      "Iowa State Cyclones Men's Basketball", "Iowa State Cyclones Women's Basketball",
    ],
  },
  'Kansas': {
    color: '#0051BA',
    logo: espn('ncaa', '2305'),
    shortName: 'Jayhawks',
    tmNames: [
      'Kansas Jayhawks', 'Kansas Jayhawks Football',
      "Kansas Jayhawks Men's Basketball", "Kansas Jayhawks Women's Basketball",
    ],
  },
  'Kansas State': {
    color: '#512888',
    logo: espn('ncaa', '2306'),
    shortName: 'Wildcats',
    tmNames: [
      'Kansas State Wildcats', 'Kansas State Wildcats Football',
      "Kansas State Wildcats Men's Basketball", "Kansas State Wildcats Women's Basketball",
    ],
  },
  'Baylor': {
    color: '#154734',
    logo: espn('ncaa', '239'),
    shortName: 'Bears',
    tmNames: [
      'Baylor Bears', 'Baylor Bears Football',
      "Baylor Bears Men's Basketball", "Baylor Bears Women's Basketball",
    ],
  },
  'UCF': {
    color: '#000000',
    logo: espn('ncaa', '2116'),
    shortName: 'Knights',
    tmNames: [
      'UCF Knights', 'UCF Knights Football',
      "UCF Knights Men's Basketball", "UCF Knights Women's Basketball",
    ],
  },
  'Cincinnati': {
    color: '#E00122',
    logo: espn('ncaa', '2132'),
    shortName: 'Bearcats',
    tmNames: [
      'Cincinnati Bearcats', 'Cincinnati Bearcats Football',
      "Cincinnati Bearcats Men's Basketball", "Cincinnati Bearcats Women's Basketball",
    ],
  },
  'Houston': {
    color: '#C8102E',
    logo: espn('ncaa', '248'),
    shortName: 'Cougars',
    tmNames: [
      'Houston Cougars', 'Houston Cougars Football',
      "Houston Cougars Men's Basketball", "Houston Cougars Women's Basketball",
    ],
  },
  'Oklahoma State': {
    color: '#FF6600',
    logo: espn('ncaa', '197'),
    shortName: 'Cowboys',
    tmNames: [
      'Oklahoma State Cowboys', 'Oklahoma State Cowboys Football',
      "Oklahoma State Cowboys Men's Basketball", "Oklahoma State Cowgirls Women's Basketball",
    ],
  },
  'TCU': {
    color: '#4D1979',
    logo: espn('ncaa', '2628'),
    shortName: 'Horned Frogs',
    tmNames: [
      'TCU Horned Frogs', 'TCU Horned Frogs Football',
      "TCU Horned Frogs Men's Basketball", "TCU Horned Frogs Women's Basketball",
    ],
  },
  'Texas Tech': {
    color: '#CC0000',
    logo: espn('ncaa', '2641'),
    shortName: 'Red Raiders',
    tmNames: [
      'Texas Tech Red Raiders', 'Texas Tech Red Raiders Football',
      "Texas Tech Red Raiders Men's Basketball", "Texas Tech Lady Raiders Women's Basketball",
    ],
  },
  'West Virginia': {
    color: '#002855',
    logo: espn('ncaa', '277'),
    shortName: 'Mountaineers',
    tmNames: [
      'West Virginia Mountaineers', 'West Virginia Mountaineers Football',
      "West Virginia Mountaineers Men's Basketball", "West Virginia Mountaineers Women's Basketball",
    ],
  },
}

// ============================================================
//  BUILD FLAT LOOKUP MAP
//  EventCard uses TEAMS[teamName] — this map lets that work
//  regardless of how the data is organized above.
// ============================================================

const TEAMS = {}

// Pro teams: key is already the Ticketmaster name
for (const league of [NBA, NHL, MLS, NLL, ECHL, PLL, LOVB_TEAMS]) {
  for (const [name, data] of Object.entries(league)) {
    TEAMS[name] = data
  }
}

// College: expand tmNames so each variation maps to the school data
for (const [, school] of Object.entries(NCAA)) {
  const { tmNames, ...teamData } = school
  for (const name of tmNames) {
    TEAMS[name] = teamData
  }
}

export { NCAA, NBA, NHL, MLS, NLL, ECHL, PLL, LOVB_TEAMS }

export const SPORT_ICONS = {
  Basketball: '\u{1F3C0}',
  Soccer: '\u26BD',
  Hockey: '\u{1F3D2}',
  Football: '\u{1F3C8}',
  Lacrosse: '\u{1F94D}',
  Volleyball: '\u{1F3D0}',
}

export const LEAGUE_COLORS = {
  NBA: 'bg-orange-500',
  MLS: 'bg-green-500',
  NHL: 'bg-blue-500',
  NFL: 'bg-red-800',
  College: 'bg-sky-500',
  'Minor League': 'bg-slate-500',
  NLL: 'bg-emerald-600',
}

export default TEAMS
