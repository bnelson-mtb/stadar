// Logo URL helpers
const espnLogo = (sport, id) => `https://a.espncdn.com/i/teamlogos/${sport}/500/${id}.png`
const espnScoreboard = (sport, id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sport}/500/scoreboard/${id}.png`
const espnCombiner = (sport, id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sport}/500/${id}.png`
const echlLogo = (id) => `https://assets.leaguestat.com/echl/logos/${id}.png`
const pllLogo = (team) => `https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_${team}_primary_color.png`

// ============================================================
//  PRO LEAGUES
// ============================================================

const NBA = {
  'Utah Jazz':                { color: '#002B5C', logo: espnLogo('nba', 'utah'), shortName: 'Jazz' },
  'Denver Nuggets':           { color: '#0E2240', logo: espnLogo('nba', 'den'),  shortName: 'Nuggets' },
  'Phoenix Suns':             { color: '#1D1160', logo: espnLogo('nba', 'phx'),  shortName: 'Suns' },
  'Los Angeles Lakers':       { color: '#552583', logo: espnLogo('nba', 'lal'),  shortName: 'Lakers' },
  'LA Clippers':              { color: '#C8102E', logo: espnLogo('nba', 'lac'),  shortName: 'Clippers' },
  'Los Angeles Clippers':     { color: '#C8102E', logo: espnLogo('nba', 'lac'),  shortName: 'Clippers' },
  'Portland Trail Blazers':   { color: '#E03A3E', logo: espnLogo('nba', 'por'),  shortName: 'Blazers' },
  'Sacramento Kings':         { color: '#5A2D81', logo: espnLogo('nba', 'sac'),  shortName: 'Kings' },
  'Golden State Warriors':    { color: '#1D428A', logo: espnLogo('nba', 'gs'),   shortName: 'Warriors' },
  'Oklahoma City Thunder':    { color: '#007AC1', logo: espnLogo('nba', 'okc'),  shortName: 'Thunder' },
  'Minnesota Timberwolves':   { color: '#0C2340', logo: espnLogo('nba', 'min'),  shortName: 'Timberwolves' },
  'Dallas Mavericks':         { color: '#00538C', logo: espnLogo('nba', 'dal'),  shortName: 'Mavericks' },
  'San Antonio Spurs':        { color: '#000000', logo: espnLogo('nba', 'sa'),   shortName: 'Spurs' },
  'Memphis Grizzlies':        { color: '#5D76A9', logo: espnLogo('nba', 'mem'),  shortName: 'Grizzlies' },
  'Houston Rockets':          { color: '#CE1141', logo: espnLogo('nba', 'hou'),  shortName: 'Rockets' },
  'New Orleans Pelicans':     { color: '#0C2340', logo: espnLogo('nba', 'no'),   shortName: 'Pelicans' },
  'New York Knicks':         { color: '#006BB6', logo: espnLogo('nba', 'ny'),   shortName: 'Knicks' },
  'Miami Heat':              { color: '#98002E', logo: espnLogo('nba', 'mia'),  shortName: 'Heat' },
  'Atlanta Hawks':           { color: '#E03A3E', logo: espnLogo('nba', 'atl'),  shortName: 'Hawks' },
  'Chicago Bulls':           { color: '#CE1141', logo: espnLogo('nba', 'chi'),  shortName: 'Bulls' },
  'Cleveland Cavaliers':     { color: '#6F263D', logo: espnLogo('nba', 'cle'),  shortName: 'Cavaliers' },
  'Indiana Pacers':         { color: '#002D62', logo: espnLogo('nba', 'ind'),  shortName: 'Pacers' },
  'Orlando Magic':          { color: '#0077C0', logo: espnLogo('nba', 'orl'),  shortName: 'Magic' },
  'Toronto Raptors':        { color: '#CE1141', logo: espnLogo('nba', 'tor'),  shortName: 'Raptors' },
  'Washington Wizards':     { color: '#002B5C', logo: espnLogo('nba', 'wsh'),  shortName: 'Wizards' },
  'Boston Celtics':         { color: '#007A33', logo: espnLogo('nba', 'bos'),  shortName: 'Celtics' },
  'Philadelphia 76ers':     { color: '#006BB6', logo: espnLogo('nba', 'phi'),  shortName: '76ers' },
  'Milwaukee Bucks':        { color: '#00471B', logo: espnLogo('nba', 'mil'),  shortName: 'Bucks' },
  'Charlotte Hornets':      { color: '#1D1160', logo: espnLogo('nba', 'cha'),  shortName: 'Hornets' },
  'Detroit Pistons':        { color: '#C8102E', logo: espnLogo('nba', 'det'),  shortName: 'Pistons' },
}

const NHL = {
  'Utah Mammoth':             { color: '#131F33', logo: espnLogo('nhl', 'uta'),  shortName: 'Utah Mammoth' },
  'Colorado Avalanche':       { color: '#6F263D', logo: espnLogo('nhl', 'col'),  shortName: 'Avalanche' },
  'Vegas Golden Knights':     { color: '#B4975A', logo: espnLogo('nhl', 'vgk'),  shortName: 'Golden Knights' },
  'Dallas Stars':             { color: '#006847', logo: espnLogo('nhl', 'dal'),  shortName: 'Stars' },
  'Minnesota Wild':           { color: '#154734', logo: espnLogo('nhl', 'min'),  shortName: 'Wild' },
  'St. Louis Blues':          { color: '#002F87', logo: espnLogo('nhl', 'stl'),  shortName: 'Blues' },
  'Nashville Predators':      { color: '#FFB81C', logo: espnLogo('nhl', 'nsh'),  shortName: 'Predators' },
  'Winnipeg Jets':            { color: '#041E42', logo: espnLogo('nhl', 'wpg'),  shortName: 'Jets' },
  'Calgary Flames':           { color: '#D2001C', logo: espnLogo('nhl', 'cgy'),  shortName: 'Flames' },
  'Edmonton Oilers':          { color: '#041E42', logo: espnLogo('nhl', 'edm'),  shortName: 'Oilers' },
  'Vancouver Canucks':        { color: '#00205B', logo: espnLogo('nhl', 'van'),  shortName: 'Canucks' },
  'Seattle Kraken':           { color: '#001628', logo: espnLogo('nhl', 'sea'),  shortName: 'Kraken' },
  'Los Angeles Kings':        { color: '#111111', logo: espnLogo('nhl', 'la'),   shortName: 'Kings' },
  'Anaheim Ducks':            { color: '#F47A38', logo: espnLogo('nhl', 'ana'),  shortName: 'Ducks' },
  'San Jose Sharks':          { color: '#006D75', logo: espnLogo('nhl', 'sj'),   shortName: 'Sharks' },
  'Florida Panthers':          { color: '#041E42', logo: espnLogo('nhl', 'fla'),  shortName: 'Panthers' },
  'Columbus Blue Jackets':    { color: '#002654', logo: espnLogo('nhl', 'cbj'),  shortName: 'Blue Jackets' },
  'Pittsburgh Penguins':      { color: '#000000', logo: espnLogo('nhl', 'pit'),  shortName: 'Penguins' },
  'New York Rangers':        { color: '#0038A8', logo: espnLogo('nhl', 'nyr'),  shortName: 'Rangers' },
  'New Jersey Devils':       { color: '#E03A3E', logo: espnLogo('nhl', 'nj'),   shortName: 'Devils' },
  'Boston Bruins':           { color: '#FFB612', logo: espnLogo('nhl', 'bos'),  shortName: 'Bruins' },
  'Buffalo Sabres':         { color: '#002654', logo: espnLogo('nhl', 'buf'),  shortName: 'Sabres' },
  'Ottawa Senators':        { color: '#E03A3E', logo: espnLogo('nhl', 'ott'),  shortName: 'Senators' },
  'Carolina Hurricanes':     { color: '#E03A3E', logo: espnLogo('nhl', 'car'),  shortName: 'Hurricanes' },
  'Washington Capitals':     { color: '#E03A3E', logo: espnLogo('nhl', 'wsh'),  shortName: 'Capitals' },
  'Toronto Maple Leafs':     { color: '#002654', logo: espnLogo('nhl', 'tor'),  shortName: 'Maple Leafs' },
  'Montreal Canadiens':      { color: '#AF1E2D', logo: espnLogo('nhl', 'mtl'),  shortName: 'Canadiens' },
  'Tampa Bay Lightning':     { color: '#002654', logo: espnLogo('nhl', 'tb'),   shortName: 'Lightning' },
  'New York Islanders':      { color: '#00539B', logo: espnLogo('nhl', 'nyi'),  shortName: 'Islanders' },
  'Chicago Blackhawks':       { color: '#CF0A2C', logo: espnLogo('nhl', 'chi'),  shortName: 'Blackhawks' },
  'Detroit Red Wings':        { color: '#CE1126', logo: espnLogo('nhl', 'det'),  shortName: 'Red Wings' },
  'Philadelphia Flyers':        { color: '#E03A3E', logo: espnLogo('nhl', 'phi'),  shortName: 'Flyers' },
}

const NFL = {
  'Denver Broncos':           { color: '#FB4F14', logo: espnScoreboard('nfl', 'den'),  shortName: 'Broncos' },
  'Las Vegas Raiders':        { color: '#000000', logo: espnScoreboard('nfl', 'lv'),   shortName: 'Raiders' },
  'Arizona Cardinals':        { color: '#97233F', logo: espnScoreboard('nfl', 'ari'),  shortName: 'Cardinals' },
  'Los Angeles Rams':        { color: '#003594', logo: espnScoreboard('nfl', 'lar'),   shortName: 'Rams' },
  'Kansas City Chiefs':      { color: '#E31837', logo: espnScoreboard('nfl', 'kc'),   shortName: 'Chiefs' },
  'San Francisco 49ers':     { color: '#B3995D', logo: espnScoreboard('nfl', 'sf'),   shortName: '49ers' },
  'Seattle Seahawks':        { color: '#69BE28', logo: espnScoreboard('nfl', 'sea'),  shortName: 'Seahawks' },
  'Minnesota Vikings':       { color: '#4F2683', logo: espnScoreboard('nfl', 'min'),  shortName: 'Vikings' },
  'Green Bay Packers':       { color: '#203731', logo: espnScoreboard('nfl', 'gb'),   shortName: 'Packers' },
  'Los Angeles Chargers':    { color: '#002A5E', logo: espnScoreboard('nfl', 'lac'),  shortName: 'Chargers' },
  'New Orleans Saints':     { color: '#D3BC8D', logo: espnScoreboard('nfl', 'no'),   shortName: 'Saints' },
  'Tampa Bay Buccaneers':   { color: '#D50A0A', logo: espnScoreboard('nfl', 'tb'),   shortName: 'Buccaneers' },
  'Atlanta Falcons':        { color: '#A71930', logo: espnScoreboard('nfl', 'atl'),  shortName: 'Falcons' },
  'New York Giants':        { color: '#0B2265', logo: espnScoreboard('nfl', 'nyg'),  shortName: 'Giants' },
  'Philadelphia Eagles':    { color: '#004C54', logo: espnScoreboard('nfl', 'phi'),  shortName: 'Eagles' },
  'Pittsburgh Steelers':    { color: '#FFB612', logo: espnScoreboard('nfl', 'pit'),  shortName: 'Steelers' },
  'Cleveland Browns':       { color: '#311D00', logo: espnScoreboard('nfl', 'cle'),  shortName: 'Browns' },
  'Baltimore Ravens':       { color: '#241773', logo: espnScoreboard('nfl', 'bal'),  shortName: 'Ravens' },
  'New England Patriots':   { color: '#002244', logo: espnScoreboard('nfl', 'ne'),   shortName: 'Patriots' },
  'Miami Dolphins':         { color: '#008E97', logo: espnScoreboard('nfl', 'mia'),  shortName: 'Dolphins' },
  'Buffalo Bills':          { color: '#00338D', logo: espnScoreboard('nfl', 'buf'),  shortName: 'Bills' },
  'Carolina Panthers':      { color: '#0085CA', logo: espnScoreboard('nfl', 'car'),  shortName: 'Panthers' },
  'Washington Commanders':  { color: '#5A1414', logo: espnScoreboard('nfl', 'wsh'),  shortName: 'Commanders' },
  'New York Jets':         { color: '#125740', logo: espnScoreboard('nfl', 'nyj'),  shortName: 'Jets' },
  'Cincinnati Bengals':     { color: '#FB4F14', logo: espnScoreboard('nfl', 'cin'),  shortName: 'Bengals' },
  'Indianapolis Colts':     { color: '#002C5F', logo: espnScoreboard('nfl', 'ind'),  shortName: 'Colts' },
  'Tennessee Titans':       { color: '#4B92DB', logo: espnScoreboard('nfl', 'ten'),  shortName: 'Titans' },
  'Jacksonville Jaguars':   { color: '#006778', logo: espnScoreboard('nfl', 'jax'),  shortName: 'Jaguars' },
  'Dallas Cowboys':         { color: '#003594', logo: espnScoreboard('nfl', 'dal'),  shortName: 'Cowboys' },
  'Chicago Bears':           { color: '#0B162A', logo: espnScoreboard('nfl', 'chi'),  shortName: 'Bears' },
  'Detroit Lions':          { color: '#0076B6', logo: espnScoreboard('nfl', 'det'),  shortName: 'Lions' },
  'Houston Texans':         { color: '#03202F', logo: espnScoreboard('nfl', 'hou'),  shortName: 'Texans' },
}

const MLS = {
  'Real Salt Lake':           { color: '#B30838', logo: espnCombiner('soccer', '4771'), shortName: 'Salt Lake' },
  'Atlanta United':           { color: '#a02336', logo: espnCombiner('soccer', '3089'), shortName: 'Atlanta' },
  'Austin FC':                { color: '#00ba43', logo: espnCombiner('soccer', '20906'), shortName: 'Austin' },
  'Chicago Fire FC':          { color: '#ff0000', logo: espnCombiner('soccer', '3088'), shortName: 'Chicago' },
  'FC Cincinnati':            { color: '#003087', logo: espnCombiner('soccer', '3090'), shortName: 'Cincinnati' },
  'FC Dallas':                { color: '#c5083b', logo: espnCombiner('soccer', '3091'), shortName: 'Dallas' },
  'Houston Dynamo FC':        { color: '#bf5408', logo: espnCombiner('soccer', '3092'), shortName: 'Houston' },
  'Sporting Kansas City':     { color: '#aac9f1', logo: espnCombiner('soccer', '3093'), shortName: 'Kansas City' },
  'LA Galaxy':                { color: '#13294b', logo: espnCombiner('soccer', '3094'), shortName: 'LA Galaxy' },
  'Los Angeles FC':           { color: '#c19f6c', logo: espnCombiner('soccer', '3095'), shortName: 'LAFC' },
  'Inter Miami CF':           { color: '#ff7eb9', logo: espnCombiner('soccer', '3096'), shortName: 'Miami' },
  'Minnesota United FC':      { color: '#58595B', logo: espnCombiner('soccer', '3097'), shortName: 'Minnesota' },
  'CF Montréal':              { color: '#0A1E8B', logo: espnCombiner('soccer', '3098'), shortName: 'Montréal' },
  'Nashville SC':             { color: '#FFB81C', logo: espnCombiner('soccer', '3099'), shortName: 'Nashville' },
  'New England Revolution':   { color: '#002244', logo: espnCombiner('soccer', '3100'), shortName: 'New England' },
  'New York City FC':         { color: '#6CADDF', logo: espnCombiner('soccer', '3102'), shortName: 'NYCFC' },
  'Red Bull New York':        { color: '#DB0320', logo: espnCombiner('soccer', '3103'), shortName: 'Red Bulls' },
  'Orlando City':             { color: '#660099', logo: espnCombiner('soccer', '3104'), shortName: 'Orlando' },
  'Philadelphia Union':       { color: '#002654', logo: espnCombiner('soccer', '3105'), shortName: 'Philadelphia' },
  'Portland Timbers':         { color: '#154734', logo: espnCombiner('soccer', '3106'), shortName: 'Portland' },
  'San Jose Earthquakes':     { color: '#006D75', logo: espnCombiner('soccer', '3107'), shortName: 'San Jose' },
  'San Diego FC':             { color: '#002654', logo: espnCombiner('soccer', '3108'), shortName: 'San Diego' },
  'Seattle Sounders FC':      { color: '#4eb64e', logo: espnCombiner('soccer', '9726'), shortName: 'Seattle' },
  'Toronto FC':               { color: '#bd394d', logo: espnCombiner('soccer', '3110'), shortName: 'Toronto' },
  'Vancouver Whitecaps FC':   { color: '#ffffff', logo: espnCombiner('soccer', '3111'), shortName: 'Vancouver' },
  'St. Louis City SC':        { color: '#f31358', logo: espnCombiner('soccer', '3112'), shortName: 'St. Louis' },
}

const NWSL = {
  'Utah Royals FC':           { color: '#0b1f8a', logo: 'https://upload.wikimedia.org/wikipedia/en/7/72/Utah_Royals_FC_logo.svg', shortName: 'Royals' },
}

const ECHL = {
  'Utah Grizzlies':           { color: '#002244', logo: echlLogo('23'), shortName: 'Grizzlies' },
  'Adirondack Thunder':       { color: '#c91f2c', logo: echlLogo('74'), shortName: 'Thunder' },
  'Allen Americans':          { color: '#a81e2e', logo: echlLogo('66'), shortName: 'Americans' },
  'Atlanta Gladiators':       { color: '#fab418', logo: echlLogo('10'), shortName: 'Gladiators' },
  'Bloomington Bison':       { color: '#69cff3', logo: echlLogo('107'), shortName: 'Bisons' },
  'Cincinnati Cyclones':      { color: '#e21836', logo: echlLogo('5'), shortName: 'Cyclones' },
  'Florida Everblades':       { color: '#004687', logo: echlLogo('8'), shortName: 'Everblades' },
  'Fort Wayne Komets':        { color: '#fdb827', logo: echlLogo('60'), shortName: 'Komets' },
  'Greensboro Gargolyes':     { color: '#482a73', logo: echlLogo('108'), shortName: 'Gargoyles' },
  'Greenville Swamp Rabbits': { color: '#cb5d26', logo: echlLogo('52'), shortName: 'Swamp Rabbits' },
  'Idaho Steelheads':         { color: '#bac5c5', logo: echlLogo('11'), shortName: 'Steelheads' },
  'Jacksonville Icemen':      { color: '#a4a4bc', logo: echlLogo('79'), shortName: 'Icemen' },
  'Indy Fuel':                { color: '#cd1f2d', logo: echlLogo('65'), shortName: 'Fuel' },
  'Iowa Heartlanders':        { color: '#debb11', logo: echlLogo('98'), shortName: 'Heartlanders' },
  'Kalamazoo Wings':          { color: '#e03a3e', logo: echlLogo('50'), shortName: 'Wings' },
  'Kansas City Mavericks':    { color: '#ec5e21', logo: echlLogo('68'), shortName: 'Mavericks' },
  'Maine Mariners':           { color: '#002654', logo: echlLogo('82'), shortName: 'Mariners' },
  'Norfolk Admirals':         { color: '#002654', logo: echlLogo('76'), shortName: 'Admirals' },
  'Orlando Solar Bears':      { color: '#f4791f', logo: echlLogo('61'), shortName: 'Solar Bears' },
  'Rapid City Rush':          { color: '#e03a3e', logo: echlLogo('70'), shortName: 'Rush' },
  'Reading Royals':           { color: '#5b3793', logo: echlLogo('17'), shortName: 'Royals' },
  'Savannah Ghost Pirates':   { color: '#5db64a', logo: echlLogo('102'), shortName: 'Ghost Pirates' },
  'South Carolina Stingrays': { color: '#002654', logo: echlLogo('18'), shortName: 'Stingrays' },
  'Tahoe Knight Monsters':    { color: '#007282', logo: echlLogo('106'), shortName: 'Knight Monsters' },
  'Toledo Walleye':           { color: '#0079c2', logo: echlLogo('21'), shortName: 'Walleye' },
  'Trois-Rivières Lions':     { color: '#234586', logo: echlLogo('99'), shortName: 'Lions' },
  'Tulsa Oilers':             { color: '#7b212d', logo: echlLogo('71'), shortName: 'Oilers' },
  'Wheeling Nailers':         { color: '#f5b31b', logo: echlLogo('25_73'), shortName: 'Nailers' },
  'Witchita Thunder':         { color: '#005da6', logo: echlLogo('72'), shortName: 'Thunder' },
  'Worcester Railers':        { color: '#0f2c52', logo: echlLogo('77'), shortName: 'Railers' },
}

const AHL = {
}

const WNBA = {
}

const PLL = {
  'Utah Archers':             { color: '#fc5016', logo: pllLogo('archers'), shortName: 'Archers' },
  'California Redwoods':      { color: '#fed200', logo: pllLogo('redwoods'), shortName: 'Redwoods' },
  'Carolina Chaos':           { color: '#D2001C', logo: pllLogo('chaos'), shortName: 'Chaos' },
  'Denver Outlaws':           { color: '#fb5014', logo: pllLogo('outlaws'), shortName: 'Outlaws' },
  'Boston Cannons':           { color: '#c61f30', logo: pllLogo('cannons'), shortName: 'Cannons' },
  'Maryland Whipsnakes':      { color: '#fd0000', logo: pllLogo('whipsnakes'), shortName: 'Whipsnakes' },
  'New York Atlas':           { color: '#00affc', logo: pllLogo('atlas'), shortName: 'Atlas' },
  'Philadelphia Waterdogs':   { color: '#6a1ec1', logo: pllLogo('waterdogs'), shortName: 'Waterdogs' },
}

const LOVB_TEAMS = {
  'LOVB Salt Lake Volleyball': { color: '#fff84d', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/LOVB_Salt_Lake_logo.webp', shortName: 'SLC', displayName: 'LOVB Salt Lake' },
  'LOVB Houston':              { color: '#5b9af9', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/LOVB_Houston_logo.webp', shortName: 'Houston' },
  'LOVB Austin':               { color: '#9e8aff', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/LOVB_Austin_logo.webp', shortName: 'Austin' },
  'LOVB Atlanta':              { color: '#ff73c7', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/LOVB_Atlanta_logo.webp', shortName: 'Atlanta' },
  'LOVB Nebraska':             { color: '#33f08a', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/LOVB_Omaha_logo.webp/513px-LOVB_Omaha_logo.webp.png', shortName: 'Nebraska' },
  'LOVB Madison':              { color: '#4de7fd', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/LOVB_Madison_logo.webp', shortName: 'Madison' },
}

// ============================================================
//  COLLEGE (NCAA)
//  One entry per school — shared across all sports and genders.
//  tmNames lists known Ticketmaster name variations.
//  Optional displayName forces one canonical label for all variants.
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
    logo: espnLogo('ncaa', '252'),
    shortName: 'Cougars',
    tmNames: [
      'BYU Cougars', 'BYU Cougars Football',
      "BYU Cougars Men's Basketball", "BYU Cougars Women's Basketball", "BYU Cougars Baseball", "BYU Cougars Mens Volleyball",
    ],
  },
  'Utah State': {
    color: '#0F2439',
    logo: espnLogo('ncaa', '328'),
    shortName: 'Aggies',
    tmNames: [
      'Utah State Aggies', 'Utah State Aggies Football',
      "Utah State Aggies Men's Basketball", "Utah State Aggies Women's Basketball",
    ],
  },
  'Weber State': {
    color: '#4B2882',
    logo: espnLogo('ncaa', '2692'),
    shortName: 'Wildcats',
    tmNames: [
      'Weber State Wildcats', 'Weber State Wildcats Football',
      "Weber State Wildcats Men's Basketball", "Weber State Wildcats Women's Basketball",
    ],
  },
  'Southern Utah': {
    color: '#CC0000',
    logo: espnLogo('ncaa', '2572'),
    shortName: 'Thunderbirds',
    tmNames: [
      'Southern Utah Thunderbirds',
      "Southern Utah Thunderbirds Men's Basketball", "Southern Utah Thunderbirds Women's Basketball",
    ],
  },
  'Utah Tech': {
    color: '#BA0C2F',
    logo: espnLogo('ncaa', '3101'),
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
    logo: espnLogo('ncaa', '12'),
    shortName: 'Wildcats',
    tmNames: [
      'Arizona Wildcats', 'Arizona Wildcats Football',
      "Arizona Wildcats Men's Basketball", "Arizona Wildcats Women's Basketball",
    ],
  },
  'Arizona State': {
    color: '#8C1D40',
    logo: espnLogo('ncaa', '9'),
    shortName: 'Sun Devils',
    tmNames: [
      'Arizona State Sun Devils', 'Arizona State Sun Devils Football',
      "Arizona State Sun Devils Men's Basketball", "Arizona State Sun Devils Women's Basketball",
    ],
  },
  'Colorado': {
    color: '#CFB87C',
    logo: espnLogo('ncaa', '38'),
    shortName: 'Buffaloes',
    tmNames: [
      'University of Colorado Buffaloes', 'Colorado Buffaloes Football',
      "Colorado Buffaloes Men's Basketball", "Colorado Buffaloes Women's Basketball",
    ],
  },
  'Iowa State': {
    color: '#C8102E',
    logo: espnLogo('ncaa', '66'),
    shortName: 'Cyclones',
    tmNames: [
      'Iowa State Cyclones', 'Iowa State Cyclones Football',
      "Iowa State Cyclones Men's Basketball", "Iowa State Cyclones Women's Basketball",
    ],
  },
  'Kansas': {
    color: '#0051BA',
    logo: espnLogo('ncaa', '2305'),
    shortName: 'Jayhawks',
    tmNames: [
      'Kansas Jayhawks', 'Kansas Jayhawks Football',
      "Kansas Jayhawks Men's Basketball", "Kansas Jayhawks Women's Basketball",
    ],
  },
  'Kansas State': {
    color: '#512888',
    logo: espnLogo('ncaa', '2306'),
    shortName: 'Wildcats',
    tmNames: [
      'Kansas State Wildcats', 'Kansas State Wildcats Football',
      "Kansas State Wildcats Men's Basketball", "Kansas State Wildcats Women's Basketball",
    ],
  },
  'Baylor': {
    color: '#154734',
    logo: espnLogo('ncaa', '239'),
    shortName: 'Bears',
    tmNames: [
      'Baylor Bears', 'Baylor Bears Football',
      "Baylor Bears Men's Basketball", "Baylor Bears Women's Basketball",
    ],
  },
  'UCF': {
    color: '#000000',
    logo: espnLogo('ncaa', '2116'),
    shortName: 'Knights',
    tmNames: [
      'UCF Knights', 'UCF Knights Football',
      "UCF Knights Mens Basketball", "UCF Knights Women's Basketball", "UCF Knights Baseball",
    ],
  },
  'Cincinnati': {
    color: '#E00122',
    logo: espnLogo('ncaa', '2132'),
    shortName: 'Bearcats',
    tmNames: [
      'Cincinnati Bearcats', 'Cincinnati Bearcats Football',
      "Cincinnati Bearcats Mens", "Cincinnati Bearcats Women's Basketball",
    ],
  },
  'Houston': {
    color: '#C8102E',
    logo: espnLogo('ncaa', '248'),
    shortName: 'Cougars',
    tmNames: [
      'Houston Cougars', 'Houston Cougars Football',
      "Houston Cougars Men's Basketball", "Houston Cougars Women's Basketball",
    ],
  },
  'Oklahoma State': {
    color: '#FF6600',
    logo: espnLogo('ncaa', '197'),
    shortName: 'Cowboys',
    tmNames: [
      'Oklahoma State Cowboys', 'Oklahoma State Cowboys Football',
      "Oklahoma State Cowboys Men's Basketball", "Oklahoma State Cowgirls Women's Basketball",
    ],
  },
  'TCU': {
    color: '#4D1979',
    logo: espnLogo('ncaa', '2628'),
    shortName: 'Horned Frogs',
    tmNames: [
      'TCU Horned Frogs', 'TCU Horned Frogs Football',
      "TCU Horned Frogs Men's Basketball", "TCU Horned Frogs Women's Basketball",
    ],
  },
  'Texas Tech': {
    color: '#CC0000',
    logo: espnLogo('ncaa', '2641'),
    shortName: 'Red Raiders',
    tmNames: [
      'Texas Tech Red Raiders', 'Texas Tech Red Raiders Football',
      "Texas Tech Red Raiders Men's Basketball", "Texas Tech Lady Raiders Women's Basketball",
    ],
  },
  'West Virginia': {
    color: '#002855',
    logo: espnLogo('ncaa', '277'),
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
for (const league of [NBA, NHL, MLS, NWSL, ECHL, PLL, LOVB_TEAMS]) {
  for (const [name, data] of Object.entries(league)) {
    TEAMS[name] = data
    if (data?.displayName) TEAMS[data.displayName] = data
  }
}

// College: expand tmNames so each variation maps to the school data
for (const [schoolName, school] of Object.entries(NCAA)) {
  const { tmNames, displayName, ...baseData } = school
  const canonicalName = displayName || `${schoolName} ${school.shortName}`
  const teamData = { ...baseData, displayName: canonicalName, canonicalKey: schoolName }

  TEAMS[schoolName] = teamData
  TEAMS[canonicalName] = teamData
  for (const name of tmNames) {
    TEAMS[name] = teamData
  }
}

function normalizeLookupName(name) {
  if (!name) return ''
  return name
    .replace(/^University of\s+/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function getTeamData(name) {
  if (!name) return null
  return TEAMS[name] || TEAMS[normalizeLookupName(name)] || null
}

export function getCanonicalTeamName(name) {
  if (!name) return ''
  const data = getTeamData(name)
  return data?.displayName || name
}

export { NCAA, NBA, NHL, MLS, NWSL, ECHL, PLL, LOVB_TEAMS }

export const SPORT_ICONS = {
  Basketball: '\u{1F3C0}',
  Soccer: '\u26BD',
  Hockey: '\u{1F3D2}',
  Football: '\u{1F3C8}',
  Baseball: '\u26BE',
  Softball: '\u{1F94E}',
  Lacrosse: '\u{1F94D}',
  Volleyball: '\u{1F3D0}',
  Misc: '\u{1F3AF}',
}

export const LEAGUE_COLORS = {
  NBA: 'bg-orange-600',
  MLB: 'bg-blue-700',
  MLS: 'bg-red-800',
  NWSL: 'bg-pink-600',
  "Women's Soccer": 'bg-pink-600',
  "Men's Soccer": 'bg-cyan-700',
  NHL: 'bg-black',
  NFL: 'bg-blue-900',
  NCAAM: 'bg-sky-600',
  NCAAW: 'bg-indigo-700',
  NCAAF: 'bg-emerald-700',
  "NCAA Baseball": 'bg-lime-700',
  "NCAA Softball": 'bg-teal-700',
  "Men's VB": 'bg-amber-600',
  "Women's VB": 'bg-fuchsia-700',
  LOVB: 'bg-rose-600',
  'Minor League': 'bg-slate-500',
  PLL: 'bg-yellow-500',
  Misc: 'bg-gray-500',
}

export default TEAMS
