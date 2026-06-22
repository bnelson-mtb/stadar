import logoManifest from './logoManifest.json' with { type: 'json' }

// Logo URL helpers
const espnLogo = (sport, id) => `https://a.espncdn.com/i/teamlogos/${sport}/500/${id}.png`
const espnScoreboard = (sport, id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sport}/500/scoreboard/${id}.png`
const espnCombiner = (sport, id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sport}/500/${id}.png`
const echlLogo = (id) => `https://assets.leaguestat.com/echl/logos/${id}.png`
const pllLogo = (team) => `https://img.premierlacrosseleague.com/Teams/2024/Logo/2024_${team}_primary_color.png`
const nwslLogo = (version, slug) => `https://images.nwslsoccer.com/image/private/t_q-best/${version}/prd/assets/teams/${slug}.svg`
const nwslLogoPng = (version, slug) => `https://www.nwslsoccer.com/_next/image?url=https%3A%2F%2Fimages.nwslsoccer.com%2Fimage%2Fprivate%2Ft_q-best%2F${version}%2Fprd%2Fassets%2Fteams%2F${slug}.png&w=48&q=75`
const mlbLogo = (id) => `https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/${id}.png&h=200&w=200`
const milbLogo = (id) => `https://www.mlbstatic.com/team-logos/${id}.svg`
const pwhlLogo = (id) => `https://a.espncdn.com/i/teamlogos/pwhl/500/${id}.png`

// ============================================================
//  PRO MEN'S LEAGUES
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
  'New York Knicks':          { color: '#006BB6', logo: espnLogo('nba', 'ny'),   shortName: 'Knicks' },
  'Miami Heat':               { color: '#98002E', logo: espnLogo('nba', 'mia'),  shortName: 'Heat' },
  'Atlanta Hawks':            { color: '#E03A3E', logo: espnLogo('nba', 'atl'),  shortName: 'Hawks' },
  'Chicago Bulls':            { color: '#CE1141', logo: espnLogo('nba', 'chi'),  shortName: 'Bulls' },
  'Cleveland Cavaliers':      { color: '#6F263D', logo: espnLogo('nba', 'cle'),  shortName: 'Cavaliers' },
  'Indiana Pacers':           { color: '#002D62', logo: espnLogo('nba', 'ind'),  shortName: 'Pacers' },
  'Orlando Magic':            { color: '#0077C0', logo: espnLogo('nba', 'orl'),  shortName: 'Magic' },
  'Toronto Raptors':          { color: '#CE1141', logo: espnLogo('nba', 'tor'),  shortName: 'Raptors' },
  'Washington Wizards':       { color: '#002B5C', logo: espnLogo('nba', 'wsh'),  shortName: 'Wizards' },
  'Boston Celtics':           { color: '#007A33', logo: espnLogo('nba', 'bos'),  shortName: 'Celtics' },
  'Philadelphia 76ers':       { color: '#006BB6', logo: espnLogo('nba', 'phi'),  shortName: '76ers' },
  'Milwaukee Bucks':          { color: '#00471B', logo: espnLogo('nba', 'mil'),  shortName: 'Bucks' },
  'Charlotte Hornets':        { color: '#1D1160', logo: espnLogo('nba', 'cha'),  shortName: 'Hornets' },
  'Detroit Pistons':          { color: '#C8102E', logo: espnLogo('nba', 'det'),  shortName: 'Pistons' },
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

const MLB = {
  'New York Yankees':         { color: '#003087', logo: mlbLogo('nyy'),  shortName: 'Yankees' },
  'Chicago White Sox':        { color: '#BD3039', logo: mlbLogo('chw'),  shortName: 'White Sox' },
  'Cleveland Guardians':      { color: '#E31937', logo: mlbLogo('cle'),  shortName: 'Guardians' },
  'Kansas City Royals':       { color: '#004687', logo: mlbLogo('kc'),   shortName: 'Royals' },
  'Minnesota Twins':          { color: '#002654', logo: mlbLogo('min'),  shortName: 'Twins' },
  'Chicago Cubs':             { color: '#0E3386', logo: mlbLogo('chc'),  shortName: 'Cubs' },
  'Cincinnati Reds':          { color: '#C6011F', logo: mlbLogo('cin'),  shortName: 'Reds' },
  'Milwaukee Brewers':        { color: '#12284B', logo: mlbLogo('mil'),  shortName: 'Brewers' },
  'Pittsburgh Pirates':       { color: '#000000', logo: mlbLogo('pit'),  shortName: 'Pirates' },
  'St. Louis Cardinals':      { color: '#C41E3A', logo: mlbLogo('stl'),  shortName: 'Cardinals' },
  'Baltimore Orioles':        { color: '#DF4601', logo: mlbLogo('bal'),  shortName: 'Orioles' },
  'Boston Red Sox':           { color: '#BD3039', logo: mlbLogo('bos'),  shortName: 'Red Sox' },
  'Tampa Bay Rays':           { color: '#092C5C', logo: mlbLogo('tb'),   shortName: 'Rays' },
  'Toronto Blue Jays':        { color: '#134A8E', logo: mlbLogo('tor'),  shortName: 'Blue Jays' },
  'Atlanta Braves':           { color: '#13274F', logo: mlbLogo('atl'),  shortName: 'Braves' },
  'Miami Marlins':            { color: '#00A3E0', logo: mlbLogo('mia'),  shortName: 'Marlins' },
  'New York Mets':            { color: '#002654', logo: mlbLogo('nym'),  shortName: 'Mets' },
  'Philadelphia Phillies':    { color: '#E81828', logo: mlbLogo('phi'),  shortName: 'Phillies' },
  'Washington Nationals':     { color: '#AB0003', logo: mlbLogo('wsh'),  shortName: 'Nationals' },
  'Athletics':                { color: '#003831', logo: mlbLogo('ath'),  shortName: 'Athletics' },
  'Houston Astros':           { color: '#002D62', logo: mlbLogo('hou'),  shortName: 'Astros' },
  'Los Angeles Angels':       { color: '#BA0021', logo: mlbLogo('laa'),  shortName: 'Angels' },
  'Seattle Mariners':         { color: '#0C2C56', logo: mlbLogo('sea'),  shortName: 'Mariners' },
  'Texas Rangers':            { color: '#003594', logo: mlbLogo('tex'),  shortName: 'Rangers' },
  'Arizona Diamondbacks':     { color: '#A71930', logo: mlbLogo('ari'),  shortName: 'Diamondbacks' },
  'Colorado Rockies':         { color: '#333366', logo: mlbLogo('col'),  shortName: 'Rockies' },
  'Los Angeles Dodgers':      { color: '#005A9C', logo: mlbLogo('la'),   shortName: 'Dodgers' },
  'San Diego Padres':         { color: '#002654', logo: mlbLogo('sd'),   shortName: 'Padres' },
  'San Francisco Giants':     { color: '#FD5A1E', logo: mlbLogo('sf'),   shortName: 'Giants' },
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
  'Minnesota United FC':      { color: '#58595B', logo: espnCombiner('soccer', '17362'), shortName: 'Minnesota' },
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

// ============================================================
//  PRO WOMEN'S LEAGUES
// ============================================================

const NWSL = {
  'Utah Royals FC':           { color: '#0b1f8a', logo: nwslLogo('v1710436109', 'utah-royals-fc'),    shortName: 'Royals' },
  'Washington Spirit':        { color: '#ff0000', logo: nwslLogo('v1712866158', 'washington-spirit'), shortName: 'Spirit' },
  'Seattle Reign':            { color: '#6dbbd1', logo: nwslLogo('v1710436107', 'seattle-reign'),     shortName: 'Reign' },
  'San Diego Wave FC':        { color: '#002654', logo: nwslLogo('v1710436109', 'san-diego-wave-fc'), shortName: 'Wave' },
  'Racing Louisville FC':     { color: '#000000', logo: nwslLogo('v1710436103', 'racing-louisville-fc'), shortName: 'Louisville' },
  'Portland Thorns FC':       { color: '#ff0000', logo: nwslLogo('v1710436101', 'portland-thorns-fc'), shortName: 'Thorns', aliases: ['Portland Thorns'] },
  'Orlando Pride':            { color: '#660099', logo: nwslLogo('v1710436099', 'orlando-pride'), shortName: 'Pride' },
  'North Carolina Courage':   { color: '#002654', logo: nwslLogo('v1712866345', 'north-carolina-courage'), shortName: 'Courage' },
  'Gotham FC':                { color: '#000000', logo: nwslLogoPng('v1768567024', 'nj-ny-gotham-fc'),  shortName: 'Gotham', aliases: ['NJ/NY Gotham FC'] },
  'Kansas City Current':      { color: '#000000', logo: nwslLogo('v1710436094', 'kansas-city-current'), shortName: 'Current' },
  'Houston Dash':             { color: '#bf5408', logo: nwslLogo('v1710436093', 'houston-dash'), shortName: 'Dash' },
  'Denver Summit FC':         { color: '#fb4f14', logo: nwslLogoPng('v1757004382', 'denver-summit-fc'), shortName: 'Summit' },
  'Chicago Stars FC':         { color: '#ff0000', logo: nwslLogoPng('v1768567406', 'chicago-stars'),   shortName: 'Stars' },
  'Boston Legacy FC':         { color: '#002244', logo: nwslLogoPng('v1749431607', 'bos-nation-fc'),   shortName: 'Legacy' },
  'Bay FC':                   { color: '#000000', logo: nwslLogo('v1710436090', 'bay-fc'), shortName: 'Bay FC' },
  'Angel City FC':            { color: '#000000', logo: nwslLogo('v1710436088', 'angel-city-fc'), shortName: 'Angel City' },
}

const LOVB_TEAMS = {
  'LOVB Salt Lake Volleyball': { color: '#fff84d', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/LOVB_Salt_Lake_logo.webp', shortName: 'SLC', displayName: 'LOVB Salt Lake' },
  'LOVB Houston':              { color: '#5b9af9', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/LOVB_Houston_logo.webp', shortName: 'Houston' },
  'LOVB Austin':               { color: '#9e8aff', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/34/LOVB_Austin_logo.webp', shortName: 'Austin' },
  'LOVB Atlanta':              { color: '#ff73c7', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/LOVB_Atlanta_logo.webp', shortName: 'Atlanta' },
  'LOVB Nebraska':             { color: '#33f08a', logo: 'https://www.oursportscentral.com/graphics/teams/resized/lovb_nebraska26-200.png', shortName: 'Nebraska' },
  'LOVB Madison':              { color: '#4de7fd', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/LOVB_Madison_logo.webp', shortName: 'Madison' },
}

const WNBA = {
  'Atlanta Dream':           { color: '#C8102E', logo: espnLogo('wnba', 'atl'), shortName: 'Dream' },
  'Chicago Sky':             { color: '#418FDE', logo: espnLogo('wnba', 'chi'), shortName: 'Sky' },
  'Connecticut Sun':         { color: '#F05023', logo: espnLogo('wnba', 'con'), shortName: 'Sun' },
  'Dallas Wings':            { color: '#002B5C', logo: espnLogo('wnba', 'dal'), shortName: 'Wings' },
  'Golden State Valkyries':  { color: '#006BB6', logo: espnLogo('wnba', 'gs'),  shortName: 'Valkyries' },
  'Indiana Fever':           { color: '#041E42', logo: espnLogo('wnba', 'ind'), shortName: 'Fever' },
  'Las Vegas Aces':          { color: '#000000', logo: espnLogo('wnba', 'lv'),  shortName: 'Aces' },
  'Los Angeles Sparks':      { color: '#702F8A', logo: espnLogo('wnba', 'la'),  shortName: 'Sparks' },
  'Minnesota Lynx':          { color: '#236192', logo: espnLogo('wnba', 'min'), shortName: 'Lynx' },
  'New York Liberty':        { color: '#006241', logo: espnLogo('wnba', 'ny'),  shortName: 'Liberty' },
  'Phoenix Mercury':         { color: '#CB6015', logo: espnLogo('wnba', 'phx'), shortName: 'Mercury' },
  'Portland Fire':           { color: '#8B1A1A', logo: espnLogo('wnba', 'por'), shortName: 'Fire' },
  'Seattle Storm':           { color: '#2C5234', logo: espnLogo('wnba', 'sea'), shortName: 'Storm' },
  'Toronto Tempo':           { color: '#7B2D8B', logo: espnLogo('wnba', 'tor'), shortName: 'Tempo' },
  'Washington Mystics':      { color: '#0C2340', logo: espnLogo('wnba', 'wsh'), shortName: 'Mystics' },
}

const PWHL = {
  'Boston Fleet':             { color: '#021F5B', logo: pwhlLogo('bos'),  shortName: 'Fleet' },
  'Minnesota Frost':          { color: '#154734', logo: pwhlLogo('min'),  shortName: 'Frost' },
  'Montréal Victoire':        { color: '#AF1E2D', logo: pwhlLogo('mtl'),  shortName: 'Victoire' },
  'New York Sirens':          { color: '#C8102E', logo: pwhlLogo('ny'),   shortName: 'Sirens' },
  'Ottawa Charge':            { color: '#D4121B', logo: pwhlLogo('ott'),  shortName: 'Charge' },
  'Toronto Sceptres':         { color: '#002654', logo: pwhlLogo('tor'),  shortName: 'Sceptres' },
}

const IAL = {
  'Arizona Juggernauts':      { color: '#E03A3E', logo: null, shortName: 'Juggernauts' },
  'Cincinnati Slingers':      { color: '#CF102D', logo: null, shortName: 'Slingers' },
  'Las Vegas Rockers':        { color: '#16C8FF', logo: null, shortName: 'Rockers' },
  'Pennsylvania Benjamins':   { color: '#64B84F', logo: null, shortName: 'Benjamins' },
  'Utah Great 8\'s':           { color: '#557FBE', logo: null, shortName: 'Great8s', aliases: ['Utah Great 8s', 'Utah Great8s', 'Utah Gr8s'] },
}

// ============================================================
//  MINOR LEAGUES
// ============================================================

const ECHL = {
  'Utah Grizzlies':           { color: '#002244', logo: echlLogo('23'), shortName: 'Grizzlies' },
  'Adirondack Thunder':       { color: '#c91f2c', logo: echlLogo('74'), shortName: 'Thunder' },
  'Allen Americans':          { color: '#a81e2e', logo: echlLogo('66'), shortName: 'Americans' },
  'Atlanta Gladiators':       { color: '#fab418', logo: echlLogo('10'), shortName: 'Gladiators' },
  'Bloomington Bison':       { color: '#69cff3', logo: echlLogo('107'), shortName: 'Bisons' },
  'Cincinnati Cyclones':      { color: '#e21836', logo: echlLogo('5'), shortName: 'Cyclones' },
  'Florida Everblades':       { color: '#004687', logo: echlLogo('8'), shortName: 'Everblades' },
  'Fort Wayne Komets':        { color: '#fdb827', logo: echlLogo('60'), shortName: 'Komets' },
  'Greensboro Gargoyles':     { color: '#482a73', logo: echlLogo('108'), shortName: 'Gargoyles' },
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
  'TROIS-RIVIERES LIONS':     { color: '#234586', logo: echlLogo('99'), shortName: 'Lions' },
  'Tulsa Oilers':             { color: '#7b212d', logo: echlLogo('71'), shortName: 'Oilers' },
  'Wheeling Nailers':         { color: '#f5b31b', logo: echlLogo('25_73'), shortName: 'Nailers' },
  'Wichita Thunder':         { color: '#005da6', logo: echlLogo('72'), shortName: 'Thunder' },
  'Worcester Railers':        { color: '#0f2c52', logo: echlLogo('77'), shortName: 'Railers' },
}

const AHL = {
  // Eastern — Atlantic
  'Bridgeport Islanders':           { color: '#00539B', logo: null, shortName: 'Islanders' },
  'Charlotte Checkers':             { color: '#CC0000', logo: null, shortName: 'Checkers' },
  'Hartford Wolf Pack':             { color: '#0038A8', logo: null, shortName: 'Wolf Pack' },
  'Hershey Bears':                  { color: '#041E42', logo: null, shortName: 'Bears' },
  'Lehigh Valley Phantoms':         { color: '#F74902', logo: null, shortName: 'Phantoms' },
  'Providence Bruins':              { color: '#FCB514', logo: null, shortName: 'Bruins' },
  'Springfield Thunderbirds':       { color: '#002F87', logo: null, shortName: 'Thunderbirds' },
  'Utica Comets':                   { color: '#CE1126', logo: null, shortName: 'Comets' },
  'Wilkes-Barre/Scranton Penguins': { color: '#000000', logo: null, shortName: 'Penguins' },
  // Eastern — North
  'Belleville Senators':            { color: '#C52032', logo: null, shortName: 'Senators' },
  'Cleveland Monsters':             { color: '#002654', logo: null, shortName: 'Monsters' },
  'Grand Rapids Griffins':          { color: '#CE1126', logo: null, shortName: 'Griffins' },
  'Laval Rocket':                   { color: '#AF1E2D', logo: null, shortName: 'Rocket' },
  'Manitoba Moose':                 { color: '#004C97', logo: null, shortName: 'Moose' },
  'Milwaukee Admirals':             { color: '#FFB81C', logo: null, shortName: 'Admirals' },
  'Rochester Americans':            { color: '#002654', logo: null, shortName: 'Americans' },
  'Syracuse Crunch':                { color: '#002868', logo: null, shortName: 'Crunch' },
  'Toronto Marlies':                { color: '#003E7E', logo: null, shortName: 'Marlies' },
  // Western — Central
  'Chicago Wolves':                 { color: '#CC0000', logo: null, shortName: 'Wolves' },
  'Colorado Eagles':                { color: '#6F263D', logo: null, shortName: 'Eagles' },
  'Iowa Wild':                      { color: '#154734', logo: null, shortName: 'Wild' },
  'Rockford IceHogs':               { color: '#CF0A2C', logo: null, shortName: 'IceHogs' },
  'Texas Stars':                    { color: '#006847', logo: null, shortName: 'Stars' },
  // Western — Pacific
  'Abbotsford Canucks':             { color: '#00843D', logo: null, shortName: 'Canucks' },
  'Bakersfield Condors':            { color: '#041E42', logo: null, shortName: 'Condors' },
  'Calgary Wranglers':              { color: '#C8102E', logo: null, shortName: 'Wranglers' },
  'Coachella Valley Firebirds':     { color: '#355464', logo: null, shortName: 'Firebirds' },
  'Henderson Silver Knights':       { color: '#B4975A', logo: null, shortName: 'Silver Knights' },
  'Ontario Reign':                  { color: '#111111', logo: null, shortName: 'Reign' },
  'San Diego Gulls':                { color: '#FC4C02', logo: null, shortName: 'Gulls' },
  'San Jose Barracuda':             { color: '#006D75', logo: null, shortName: 'Barracuda' },
  'Tucson Roadrunners':             { color: '#8C2633', logo: null, shortName: 'Roadrunners' },
}

const AAA = {
  // Pacific Coast League (west)
  'Salt Lake Bees':             { color: '#BA0C2F', logo: milbLogo('561'),  shortName: 'Bees' },
  'Sacramento River Cats':      { color: '#FDB827', logo: milbLogo('sac'),  shortName: 'River Cats' },
  'Las Vegas Aviators':         { color: '#003087', logo: milbLogo('lv'),   shortName: 'Aviators' },
  'Reno Aces':                  { color: '#1C3F7A', logo: milbLogo('rno'),  shortName: 'Aces' },
  'El Paso Chihuahuas':         { color: '#002654', logo: milbLogo('elp'),  shortName: 'Chihuahuas' },
  'Albuquerque Isotopes':       { color: '#003087', logo: milbLogo('abq'),  shortName: 'Isotopes' },
  'Round Rock Express':         { color: '#003087', logo: milbLogo('rr'),   shortName: 'Express' },
  'Oklahoma City Comets':       { color: '#005A9C', logo: milbLogo('okc'),  shortName: 'OKC' },
  'Sugar Land Space Cowboys':   { color: '#FF6600', logo: milbLogo('slsc'), shortName: 'Space Cowboys' },
  'Tacoma Rainiers':            { color: '#003087', logo: milbLogo('tac'),  shortName: 'Rainiers' },
  'Iowa Cubs':                  { color: '#003087', logo: milbLogo('iob'),  shortName: 'I-Cubs' },
  'Omaha Storm Chasers':        { color: '#003087', logo: milbLogo('oma'),  shortName: 'Storm Chasers' },
  // International League (east)
  'Durham Bulls':               { color: '#002B5C', logo: milbLogo('dur'),  shortName: 'Bulls' },
  'Nashville Sounds':           { color: '#002B5C', logo: milbLogo('nas'),  shortName: 'Sounds' },
  'Memphis Redbirds':           { color: '#C41E3A', logo: milbLogo('mem'),  shortName: 'Redbirds' },
  'St. Paul Saints':            { color: '#002B5C', logo: milbLogo('stp'),  shortName: 'Saints' },
  'Indianapolis Indians':       { color: '#000000', logo: milbLogo('ind'),  shortName: 'Indians' },
  'Toledo Mud Hens':            { color: '#003087', logo: milbLogo('tol'),  shortName: 'Mud Hens' },
  'Louisville Bats':            { color: '#C6011F', logo: milbLogo('lou'),  shortName: 'Bats' },
  'Buffalo Bisons':             { color: '#003087', logo: milbLogo('buf'),  shortName: 'Bisons' },
  'Syracuse Mets':              { color: '#002654', logo: milbLogo('syr'),  shortName: 'Mets' },
  'Rochester Red Wings':        { color: '#AB0003', logo: milbLogo('roc'),  shortName: 'Red Wings' },
  'Scranton/WB RailRiders':     { color: '#003087', logo: milbLogo('swb'),  shortName: 'RailRiders' },
  'Lehigh Valley IronPigs':     { color: '#E81828', logo: milbLogo('lhv'),  shortName: 'IronPigs' },
  'Norfolk Tides':              { color: '#DF4601', logo: milbLogo('nor'),  shortName: 'Tides' },
  'Charlotte Knights':          { color: '#BD3039', logo: milbLogo('clt'),  shortName: 'Knights' },
  'Gwinnett Stripers':          { color: '#13274F', logo: milbLogo('gwn'),  shortName: 'Stripers' },
  'Jacksonville Jumbo Shrimp':  { color: '#00A3E0', logo: milbLogo('jax'),  shortName: 'Jumbo Shrimp' },
  'Worcester Red Sox':          { color: '#BD3039', logo: milbLogo('wor'),  shortName: 'WooSox' },
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


  // --- ASUN Conference ---
  'Austin Peay': {
    color: '#8e0b0b',
    logo: espnLogo('ncaa', '2046'),
    shortName: 'Governors',
    tmNames: [
      'Austin Peay Governors',
      "Austin Peay Governors Men's Basketball", "Austin Peay Governors Women's Basketball",
    ],
  },
  'Bellarmine': {
    color: '#000000',
    logo: espnLogo('ncaa', '91'),
    shortName: 'Knights',
    tmNames: [
      'Bellarmine University Knights',
      "Bellarmine University Knights Men's Basketball", "Bellarmine University Knights Women's Basketball",
    ],
  },
  'C Arkansas': {
    color: '#a7a9ac',
    logo: espnLogo('ncaa', '2110'),
    shortName: 'Bears',
    tmNames: [
      'C Arkansas Bears',
      "C Arkansas Bears Men's Basketball", "C Arkansas Bears Women's Basketball",
    ],
  },
  'E Kentucky': {
    color: '#660819',
    logo: espnLogo('ncaa', '2198'),
    shortName: 'Colonels',
    tmNames: [
      'E Kentucky Colonels',
      "E Kentucky Colonels Men's Basketball", "E Kentucky Colonels Women's Basketball",
    ],
  },
  'FGCU': {
    color: '#00885a',
    logo: espnLogo('ncaa', '526'),
    shortName: 'Eagles',
    tmNames: [
      'FGCU Eagles',
      "FGCU Eagles Men's Basketball", "FGCU Eagles Women's Basketball",
    ],
  },
  'Jacksonville': {
    color: '#00523e',
    logo: espnLogo('ncaa', '294'),
    shortName: 'Dolphins',
    tmNames: [
      'Jacksonville Dolphins',
      "Jacksonville Dolphins Men's Basketball", "Jacksonville Dolphins Women's Basketball",
    ],
  },
  'Lipscomb': {
    color: '#20366C',
    logo: espnLogo('ncaa', '288'),
    shortName: 'Bisons',
    tmNames: [
      'Lipscomb Bisons',
      "Lipscomb Bisons Men's Basketball", "Lipscomb Bisons Women's Basketball",
    ],
  },
  'North Alabama': {
    color: '#000000',
    logo: espnLogo('ncaa', '2453'),
    shortName: 'Lions',
    tmNames: [
      'North Alabama Lions',
      "North Alabama Lions Men's Basketball", "North Alabama Lions Women's Basketball",
    ],
  },
  'North Florida': {
    color: '#004B8D',
    logo: espnLogo('ncaa', '2454'),
    shortName: 'Ospreys',
    tmNames: [
      'North Florida Ospreys',
      "North Florida Ospreys Men's Basketball", "North Florida Ospreys Women's Basketball",
    ],
  },
  'Stetson': {
    color: '#0a5640',
    logo: espnLogo('ncaa', '56'),
    shortName: 'Hatters',
    tmNames: [
      'Stetson Hatters',
      "Stetson Hatters Men's Basketball", "Stetson Hatters Women's Basketball",
    ],
  },
  'West Georgia': {
    color: '#0033a1',
    logo: espnLogo('ncaa', '2698'),
    shortName: 'Wolves',
    tmNames: [
      'West Georgia Wolves',
      "West Georgia Wolves Men's Basketball", "West Georgia Wolves Women's Basketball",
    ],
  },

  // --- America East Conference ---
  'Binghamton': {
    color: '#00614A',
    logo: espnLogo('ncaa', '2066'),
    shortName: 'Bearcats',
    tmNames: [
      'Binghamton Bearcats',
      "Binghamton Bearcats Men's Basketball", "Binghamton Bearcats Women's Basketball",
    ],
  },
  'Bryant': {
    color: '#000000',
    logo: espnLogo('ncaa', '2803'),
    shortName: 'Bulldogs',
    tmNames: [
      'Bryant Bulldogs',
      "Bryant Bulldogs Men's Basketball", "Bryant Bulldogs Women's Basketball",
    ],
  },
  'Maine': {
    color: '#127dbe',
    logo: espnLogo('ncaa', '311'),
    shortName: 'Black Bears',
    tmNames: [
      'Maine Black Bears',
      "Maine Black Bears Men's Basketball", "Maine Black Bears Women's Basketball",
    ],
  },
  'New Hampshire': {
    color: '#004990',
    logo: espnLogo('ncaa', '160'),
    shortName: 'Wildcats',
    tmNames: [
      'New Hampshire Wildcats',
      "New Hampshire Wildcats Men's Basketball", "New Hampshire Wildcats Women's Basketball",
    ],
  },
  'NJIT': {
    color: '#EE3024',
    logo: espnLogo('ncaa', '2885'),
    shortName: 'Highlanders',
    tmNames: [
      'NJIT Highlanders',
      "NJIT Highlanders Men's Basketball", "NJIT Highlanders Women's Basketball",
    ],
  },
  'UAlbany': {
    color: '#3D2777',
    logo: espnLogo('ncaa', '399'),
    shortName: 'Great Danes',
    tmNames: [
      'UAlbany Great Danes',
      "UAlbany Great Danes Men's Basketball", "UAlbany Great Danes Women's Basketball",
    ],
  },
  'UMass Lowell': {
    color: '#00529C',
    logo: espnLogo('ncaa', '2349'),
    shortName: 'River Hawks',
    tmNames: [
      'UMass Lowell River Hawks',
      "UMass Lowell River Hawks Men's Basketball", "UMass Lowell River Hawks Women's Basketball",
    ],
  },
  'UMBC': {
    color: '#000000',
    logo: espnLogo('ncaa', '2378'),
    shortName: 'Retrievers',
    tmNames: [
      'UMBC Retrievers',
      "UMBC Retrievers Men's Basketball", "UMBC Retrievers Women's Basketball",
    ],
  },
  'Vermont': {
    color: '#154734',
    logo: espnLogo('ncaa', '261'),
    shortName: 'Catamounts',
    tmNames: [
      'Vermont Catamounts',
      "Vermont Catamounts Men's Basketball", "Vermont Catamounts Women's Basketball",
    ],
  },

  // --- American Conference ---
  'Army': {
    color: '#000000',
    logo: espnLogo('ncaa', '349'),
    shortName: 'Black Knights',
    tmNames: [
      'Army Black Knights',
      "Army Black Knights Men's Basketball", "Army Black Knights Women's Basketball",
    ],
  },
  'Charlotte': {
    color: '#005035',
    logo: espnLogo('ncaa', '2429'),
    shortName: '49ers',
    tmNames: [
      'Charlotte 49ers',
      "Charlotte 49ers Men's Basketball", "Charlotte 49ers Women's Basketball",
    ],
  },
  'East Carolina': {
    color: '#582c83',
    logo: espnLogo('ncaa', '151'),
    shortName: 'Pirates',
    tmNames: [
      'East Carolina Pirates',
      "East Carolina Pirates Men's Basketball", "East Carolina Pirates Women's Basketball",
    ],
  },
  'FAU': {
    color: '#003366',
    logo: espnLogo('ncaa', '2226'),
    shortName: 'Owls',
    tmNames: [
      'FAU Owls',
      "FAU Owls Men's Basketball", "FAU Owls Women's Basketball",
    ],
  },
  'Memphis': {
    color: '#004991',
    logo: espnLogo('ncaa', '235'),
    shortName: 'Tigers',
    tmNames: [
      'Memphis Tigers',
      "Memphis Tigers Men's Basketball", "Memphis Tigers Women's Basketball",
    ],
  },
  'Navy': {
    color: '#00225b',
    logo: espnLogo('ncaa', '2426'),
    shortName: 'Midshipmen',
    tmNames: [
      'Navy Midshipmen',
      "Navy Midshipmen Men's Basketball", "Navy Midshipmen Women's Basketball",
    ],
  },
  'North Texas': {
    color: '#068f33',
    logo: espnLogo('ncaa', '249'),
    shortName: 'Mean Green',
    tmNames: [
      'North Texas Mean Green',
      "North Texas Mean Green Men's Basketball", "North Texas Mean Green Women's Basketball",
    ],
  },
  'Rice': {
    color: '#00205b',
    logo: espnLogo('ncaa', '242'),
    shortName: 'Owls',
    tmNames: [
      'Rice Owls',
      "Rice Owls Men's Basketball", "Rice Owls Women's Basketball",
    ],
  },
  'South Florida': {
    color: '#006747',
    logo: espnLogo('ncaa', '58'),
    shortName: 'Bulls',
    tmNames: [
      'South Florida Bulls',
      "South Florida Bulls Men's Basketball", "South Florida Bulls Women's Basketball",
    ],
  },
  'Temple': {
    color: '#a41e35',
    logo: espnLogo('ncaa', '218'),
    shortName: 'Owls',
    tmNames: [
      'Temple Owls',
      "Temple Owls Men's Basketball", "Temple Owls Women's Basketball",
    ],
  },
  'Tulane': {
    color: '#006747',
    logo: espnLogo('ncaa', '2655'),
    shortName: 'Green Wave',
    tmNames: [
      'Tulane Green Wave',
      "Tulane Green Wave Men's Basketball", "Tulane Green Wave Women's Basketball",
    ],
  },
  'Tulsa': {
    color: '#003595',
    logo: espnLogo('ncaa', '202'),
    shortName: 'Golden Hurricane',
    tmNames: [
      'Tulsa Golden Hurricane',
      "Tulsa Golden Hurricane Men's Basketball", "Tulsa Golden Hurricane Women's Basketball",
    ],
  },
  'UAB': {
    color: '#1a5632',
    logo: espnLogo('ncaa', '5'),
    shortName: 'Blazers',
    tmNames: [
      'UAB Blazers',
      "UAB Blazers Men's Basketball", "UAB Blazers Women's Basketball",
    ],
  },
  'UTSA': {
    color: '#0c2340',
    logo: espnLogo('ncaa', '2636'),
    shortName: 'Roadrunners',
    tmNames: [
      'UTSA Roadrunners',
      "UTSA Roadrunners Men's Basketball", "UTSA Roadrunners Women's Basketball",
    ],
  },
  'Wichita State': {
    color: '#0d0a03',
    logo: espnLogo('ncaa', '2724'),
    shortName: 'Shockers',
    tmNames: [
      'Wichita State Shockers',
      "Wichita State Shockers Men's Basketball", "Wichita State Shockers Women's Basketball",
    ],
  },

  // --- Atlantic 10 Conference ---
  'Davidson': {
    color: '#000000',
    logo: espnLogo('ncaa', '2166'),
    shortName: 'Wildcats',
    tmNames: [
      'Davidson Wildcats',
      "Davidson Wildcats Men's Basketball", "Davidson Wildcats Women's Basketball",
    ],
  },
  'Dayton': {
    color: '#004B8D',
    logo: espnLogo('ncaa', '2168'),
    shortName: 'Flyers',
    tmNames: [
      'Dayton Flyers',
      "Dayton Flyers Men's Basketball", "Dayton Flyers Women's Basketball",
    ],
  },
  'Duquesne': {
    color: '#002D62',
    logo: espnLogo('ncaa', '2184'),
    shortName: 'Dukes',
    tmNames: [
      'Duquesne Dukes',
      "Duquesne Dukes Men's Basketball", "Duquesne Dukes Women's Basketball",
    ],
  },
  'Fordham': {
    color: '#830032',
    logo: espnLogo('ncaa', '2230'),
    shortName: 'Rams',
    tmNames: [
      'Fordham Rams',
      "Fordham Rams Men's Basketball", "Fordham Rams Women's Basketball",
    ],
  },
  'G Washington': {
    color: '#002843',
    logo: espnLogo('ncaa', '45'),
    shortName: 'Revolutionaries',
    tmNames: [
      'G Washington Revolutionaries',
      "G Washington Revolutionaries Men's Basketball", "G Washington Revolutionaries Women's Basketball",
    ],
  },
  'George Mason': {
    color: '#016600',
    logo: espnLogo('ncaa', '2244'),
    shortName: 'Patriots',
    tmNames: [
      'George Mason Patriots',
      "George Mason Patriots Men's Basketball", "George Mason Patriots Women's Basketball",
    ],
  },
  'La Salle': {
    color: '#003356',
    logo: espnLogo('ncaa', '2325'),
    shortName: 'Explorers',
    tmNames: [
      'La Salle Explorers',
      "La Salle Explorers Men's Basketball", "La Salle Explorers Women's Basketball",
    ],
  },
  'Loyola Chicago': {
    color: '#9d1244',
    logo: espnLogo('ncaa', '2350'),
    shortName: 'Ramblers',
    tmNames: [
      'Loyola Chicago Ramblers',
      "Loyola Chicago Ramblers Men's Basketball", "Loyola Chicago Ramblers Women's Basketball",
    ],
  },
  'Rhode Island': {
    color: '#091f3f',
    logo: espnLogo('ncaa', '227'),
    shortName: 'Rams',
    tmNames: [
      'Rhode Island Rams',
      "Rhode Island Rams Men's Basketball", "Rhode Island Rams Women's Basketball",
    ],
  },
  'Richmond': {
    color: '#9e0712',
    logo: espnLogo('ncaa', '257'),
    shortName: 'Spiders',
    tmNames: [
      'Richmond Spiders',
      "Richmond Spiders Men's Basketball", "Richmond Spiders Women's Basketball",
    ],
  },
  'Saint Joseph\'s': {
    color: '#9e1b32',
    logo: espnLogo('ncaa', '2603'),
    shortName: 'Hawks',
    tmNames: [
      'Saint Joseph\'s Hawks',
      "Saint Joseph's Hawks Men's Basketball", "Saint Joseph's Hawks Women's Basketball",
    ],
  },
  'Saint Louis': {
    color: '#00539C',
    logo: espnLogo('ncaa', '139'),
    shortName: 'Billikens',
    tmNames: [
      'Saint Louis Billikens',
      "Saint Louis Billikens Men's Basketball", "Saint Louis Billikens Women's Basketball",
    ],
  },
  'St Bonaventure': {
    color: '#70261D',
    logo: espnLogo('ncaa', '179'),
    shortName: 'Bonnies',
    tmNames: [
      'St Bonaventure Bonnies',
      "St Bonaventure Bonnies Men's Basketball", "St Bonaventure Bonnies Women's Basketball",
    ],
  },
  'VCU': {
    color: '#ffaf00',
    logo: espnLogo('ncaa', '2670'),
    shortName: 'Rams',
    tmNames: [
      'VCU Rams',
      "VCU Rams Men's Basketball", "VCU Rams Women's Basketball",
    ],
  },

  // --- Atlantic Coast Conference ---
  'Boston College': {
    color: '#8c2232',
    logo: espnLogo('ncaa', '103'),
    shortName: 'Eagles',
    tmNames: [
      'Boston College Eagles',
      "Boston College Eagles Men's Basketball", "Boston College Eagles Women's Basketball",
    ],
  },
  'California': {
    color: '#041e42',
    logo: espnLogo('ncaa', '25'),
    shortName: 'Golden Bears',
    tmNames: [
      'California Golden Bears',
      "California Golden Bears Men's Basketball", "California Golden Bears Women's Basketball",
    ],
  },
  'Clemson': {
    color: '#f56600',
    logo: espnLogo('ncaa', '228'),
    shortName: 'Tigers',
    tmNames: [
      'Clemson Tigers',
      "Clemson Tigers Men's Basketball", "Clemson Tigers Women's Basketball",
    ],
  },
  'Duke': {
    color: '#00539b',
    logo: espnLogo('ncaa', '150'),
    shortName: 'Blue Devils',
    tmNames: [
      'Duke Blue Devils',
      "Duke Blue Devils Men's Basketball", "Duke Blue Devils Women's Basketball",
    ],
  },
  'Florida State': {
    color: '#782f40',
    logo: espnLogo('ncaa', '52'),
    shortName: 'Seminoles',
    tmNames: [
      'Florida State Seminoles',
      "Florida State Seminoles Men's Basketball", "Florida State Seminoles Women's Basketball",
    ],
  },
  'Georgia Tech': {
    color: '#b3a369',
    logo: espnLogo('ncaa', '59'),
    shortName: 'Yellow Jackets',
    tmNames: [
      'Georgia Tech Yellow Jackets',
      "Georgia Tech Yellow Jackets Men's Basketball", "Georgia Tech Yellow Jackets Women's Basketball",
    ],
  },
  'Louisville': {
    color: '#c9001f',
    logo: espnLogo('ncaa', '97'),
    shortName: 'Cardinals',
    tmNames: [
      'Louisville Cardinals',
      "Louisville Cardinals Men's Basketball", "Louisville Cardinals Women's Basketball",
    ],
  },
  'Miami': {
    color: '#f47423',
    logo: espnLogo('ncaa', '2390'),
    shortName: 'Hurricanes',
    tmNames: [
      'Miami Hurricanes',
      "Miami Hurricanes Men's Basketball", "Miami Hurricanes Women's Basketball",
    ],
  },
  'NC State': {
    color: '#cc0000',
    logo: espnLogo('ncaa', '152'),
    shortName: 'Wolfpack',
    tmNames: [
      'NC State Wolfpack',
      "NC State Wolfpack Men's Basketball", "NC State Wolfpack Women's Basketball",
    ],
  },
  'North Carolina': {
    color: '#7bafd4',
    logo: espnLogo('ncaa', '153'),
    shortName: 'Tar Heels',
    tmNames: [
      'North Carolina Tar Heels',
      "North Carolina Tar Heels Men's Basketball", "North Carolina Tar Heels Women's Basketball",
    ],
  },
  'Pitt': {
    color: '#003594',
    logo: espnLogo('ncaa', '221'),
    shortName: 'Panthers',
    tmNames: [
      'Pittsburgh Panthers',
      "Pittsburgh Panthers Men's Basketball", "Pittsburgh Panthers Women's Basketball",
    ],
  },
  'SMU': {
    color: '#a80000',
    logo: espnLogo('ncaa', '2567'),
    shortName: 'Mustangs',
    tmNames: [
      'SMU Mustangs',
      "SMU Mustangs Men's Basketball", "SMU Mustangs Women's Basketball",
    ],
  },
  'Stanford': {
    color: '#8c1515',
    logo: espnLogo('ncaa', '24'),
    shortName: 'Cardinal',
    tmNames: [
      'Stanford Cardinal',
      "Stanford Cardinal Men's Basketball", "Stanford Cardinal Women's Basketball",
    ],
  },
  'Syracuse': {
    color: '#000e54',
    logo: espnLogo('ncaa', '183'),
    shortName: 'Orange',
    tmNames: [
      'Syracuse Orange',
      "Syracuse Orange Men's Basketball", "Syracuse Orange Women's Basketball",
    ],
  },
  'Virginia': {
    color: '#f84c1e',
    logo: espnLogo('ncaa', '258'),
    shortName: 'Cavaliers',
    tmNames: [
      'Virginia Cavaliers',
      "Virginia Cavaliers Men's Basketball", "Virginia Cavaliers Women's Basketball",
    ],
  },
  'Virginia Tech': {
    color: '#6a2c3e',
    logo: espnLogo('ncaa', '259'),
    shortName: 'Hokies',
    tmNames: [
      'Virginia Tech Hokies',
      "Virginia Tech Hokies Men's Basketball", "Virginia Tech Hokies Women's Basketball",
    ],
  },
  'Wake Forest': {
    color: '#ceb888',
    logo: espnLogo('ncaa', '154'),
    shortName: 'Demon Deacons',
    tmNames: [
      'Wake Forest Demon Deacons',
      "Wake Forest Demon Deacons Men's Basketball", "Wake Forest Demon Deacons Women's Basketball",
    ],
  },

  // --- Big 12 Conference ---
  'Arizona State': {
    color: '#ffc627',
    logo: espnLogo('ncaa', '9'),
    shortName: 'Sun Devils',
    tmNames: [
      'Arizona State Sun Devils',
      "Arizona State Sun Devils Men's Basketball", "Arizona State Sun Devils Women's Basketball",
    ],
  },
  'Kansas State': {
    color: '#330a57',
    logo: espnLogo('ncaa', '2306'),
    shortName: 'Wildcats',
    tmNames: [
      'Kansas State Wildcats',
      "Kansas State Wildcats Men's Basketball", "Kansas State Wildcats Women's Basketball",
    ],
  },
  'Oklahoma State': {
    color: '#fe5c00',
    logo: espnLogo('ncaa', '197'),
    shortName: 'Cowboys',
    tmNames: [
      'Oklahoma State Cowboys',
      "Oklahoma State Cowboys Men's Basketball", "Oklahoma State Cowboys Women's Basketball",
    ],
  },

  // --- Big East Conference ---
  'Butler': {
    color: '#0d1361',
    logo: espnLogo('ncaa', '2086'),
    shortName: 'Bulldogs',
    tmNames: [
      'Butler Bulldogs',
      "Butler Bulldogs Men's Basketball", "Butler Bulldogs Women's Basketball",
    ],
  },
  'Creighton': {
    color: '#005ca9',
    logo: espnLogo('ncaa', '156'),
    shortName: 'Bluejays',
    tmNames: [
      'Creighton Bluejays',
      "Creighton Bluejays Men's Basketball", "Creighton Bluejays Women's Basketball",
    ],
  },
  'DePaul': {
    color: '#2d649c',
    logo: espnLogo('ncaa', '305'),
    shortName: 'Blue Demons',
    tmNames: [
      'DePaul Blue Demons',
      "DePaul Blue Demons Men's Basketball", "DePaul Blue Demons Women's Basketball",
    ],
  },
  'Georgetown': {
    color: '#110E42',
    logo: espnLogo('ncaa', '46'),
    shortName: 'Hoyas',
    tmNames: [
      'Georgetown Hoyas',
      "Georgetown Hoyas Men's Basketball", "Georgetown Hoyas Women's Basketball",
    ],
  },
  'Marquette': {
    color: '#003366',
    logo: espnLogo('ncaa', '269'),
    shortName: 'Golden Eagles',
    tmNames: [
      'Marquette Golden Eagles',
      "Marquette Golden Eagles Men's Basketball", "Marquette Golden Eagles Women's Basketball",
    ],
  },
  'Providence': {
    color: '#000000',
    logo: espnLogo('ncaa', '2507'),
    shortName: 'Friars',
    tmNames: [
      'Providence Friars',
      "Providence Friars Men's Basketball", "Providence Friars Women's Basketball",
    ],
  },
  'Seton Hall': {
    color: '#0857B1',
    logo: espnLogo('ncaa', '2550'),
    shortName: 'Pirates',
    tmNames: [
      'Seton Hall Pirates',
      "Seton Hall Pirates Men's Basketball", "Seton Hall Pirates Women's Basketball",
    ],
  },
  'St John\'s': {
    color: '#d10000',
    logo: espnLogo('ncaa', '2599'),
    shortName: 'Red Storm',
    tmNames: [
      'St John\'s Red Storm',
      "St John's Red Storm Men's Basketball", "St John's Red Storm Women's Basketball",
    ],
  },
  'Villanova': {
    color: '#00205b',
    logo: espnLogo('ncaa', '222'),
    shortName: 'Wildcats',
    tmNames: [
      'Villanova Wildcats',
      "Villanova Wildcats Men's Basketball", "Villanova Wildcats Women's Basketball",
    ],
  },
  'Xavier': {
    color: '#21304e',
    logo: espnLogo('ncaa', '2752'),
    shortName: 'Musketeers',
    tmNames: [
      'Xavier Musketeers',
      "Xavier Musketeers Men's Basketball", "Xavier Musketeers Women's Basketball",
    ],
  },

  // --- Big Sky Conference ---
  'E Washington': {
    color: '#a10022',
    logo: espnLogo('ncaa', '331'),
    shortName: 'Eagles',
    tmNames: [
      'E Washington Eagles',
      "E Washington Eagles Men's Basketball", "E Washington Eagles Women's Basketball",
    ],
  },
  'Idaho': {
    color: '#000000',
    logo: espnLogo('ncaa', '70'),
    shortName: 'Vandals',
    tmNames: [
      'Idaho Vandals',
      "Idaho Vandals Men's Basketball", "Idaho Vandals Women's Basketball",
    ],
  },
  'Idaho State': {
    color: '#ef8c00',
    logo: espnLogo('ncaa', '304'),
    shortName: 'Bengals',
    tmNames: [
      'Idaho State Bengals',
      "Idaho State Bengals Men's Basketball", "Idaho State Bengals Women's Basketball",
    ],
  },
  'Montana': {
    color: '#751D4A',
    logo: espnLogo('ncaa', '149'),
    shortName: 'Grizzlies',
    tmNames: [
      'Montana Grizzlies',
      "Montana Grizzlies Men's Basketball", "Montana Grizzlies Women's Basketball",
    ],
  },
  'Montana State': {
    color: '#00205c',
    logo: espnLogo('ncaa', '147'),
    shortName: 'Bobcats',
    tmNames: [
      'Montana State Bobcats',
      "Montana State Bobcats Men's Basketball", "Montana State Bobcats Women's Basketball",
    ],
  },
  'N Arizona': {
    color: '#003976',
    logo: espnLogo('ncaa', '2464'),
    shortName: 'Lumberjacks',
    tmNames: [
      'N Arizona Lumberjacks',
      "N Arizona Lumberjacks Men's Basketball", "N Arizona Lumberjacks Women's Basketball",
    ],
  },
  'N Colorado': {
    color: '#13558D',
    logo: espnLogo('ncaa', '2458'),
    shortName: 'Bears',
    tmNames: [
      'N Colorado Bears',
      "N Colorado Bears Men's Basketball", "N Colorado Bears Women's Basketball",
    ],
  },
  'Portland State': {
    color: '#00311e',
    logo: espnLogo('ncaa', '2502'),
    shortName: 'Vikings',
    tmNames: [
      'Portland State Vikings',
      "Portland State Vikings Men's Basketball", "Portland State Vikings Women's Basketball",
    ],
  },
  'Sacramento State': {
    color: '#00573C',
    logo: espnLogo('ncaa', '16'),
    shortName: 'Hornets',
    tmNames: [
      'Sacramento State Hornets',
      "Sacramento State Hornets Men's Basketball", "Sacramento State Hornets Women's Basketball",
    ],
  },
  'Weber State': {
    color: '#18005a',
    logo: espnLogo('ncaa', '2692'),
    shortName: 'Wildcats',
    tmNames: [
      'Weber State Wildcats',
      "Weber State Wildcats Men's Basketball", "Weber State Wildcats Women's Basketball",
    ],
  },

  // --- Big South Conference ---
  'Charleston So': {
    color: '#2e3192',
    logo: espnLogo('ncaa', '2127'),
    shortName: 'Buccaneers',
    tmNames: [
      'Charleston So Buccaneers',
      "Charleston So Buccaneers Men's Basketball", "Charleston So Buccaneers Women's Basketball",
    ],
  },
  'Gardner-Webb': {
    color: '#c12535',
    logo: espnLogo('ncaa', '2241'),
    shortName: 'Runnin\' Bulldogs',
    tmNames: [
      'Gardner-Webb Runnin\' Bulldogs',
      "Gardner-Webb Runnin' Bulldogs Men's Basketball", "Gardner-Webb Runnin' Bulldogs Women's Basketball",
    ],
  },
  'High Point': {
    color: '#b0b7bc',
    logo: espnLogo('ncaa', '2272'),
    shortName: 'Panthers',
    tmNames: [
      'High Point Panthers',
      "High Point Panthers Men's Basketball", "High Point Panthers Women's Basketball",
    ],
  },
  'Longwood': {
    color: '#003273',
    logo: espnLogo('ncaa', '2344'),
    shortName: 'Lancers',
    tmNames: [
      'Longwood Lancers',
      "Longwood Lancers Men's Basketball", "Longwood Lancers Women's Basketball",
    ],
  },
  'Presbyterian': {
    color: '#194896',
    logo: espnLogo('ncaa', '2506'),
    shortName: 'Blue Hose',
    tmNames: [
      'Presbyterian Blue Hose',
      "Presbyterian Blue Hose Men's Basketball", "Presbyterian Blue Hose Women's Basketball",
    ],
  },
  'Radford': {
    color: '#BC1515',
    logo: espnLogo('ncaa', '2515'),
    shortName: 'Highlanders',
    tmNames: [
      'Radford Highlanders',
      "Radford Highlanders Men's Basketball", "Radford Highlanders Women's Basketball",
    ],
  },
  'SC Upstate': {
    color: '#008545',
    logo: espnLogo('ncaa', '2908'),
    shortName: 'Spartans',
    tmNames: [
      'SC Upstate Spartans',
      "SC Upstate Spartans Men's Basketball", "SC Upstate Spartans Women's Basketball",
    ],
  },
  'UNC Asheville': {
    color: '#003da5',
    logo: espnLogo('ncaa', '2427'),
    shortName: 'Bulldogs',
    tmNames: [
      'UNC Asheville Bulldogs',
      "UNC Asheville Bulldogs Men's Basketball", "UNC Asheville Bulldogs Women's Basketball",
    ],
  },
  'Winthrop': {
    color: '#9e0b0e',
    logo: espnLogo('ncaa', '2737'),
    shortName: 'Eagles',
    tmNames: [
      'Winthrop Eagles',
      "Winthrop Eagles Men's Basketball", "Winthrop Eagles Women's Basketball",
    ],
  },

  // --- Big Ten Conference ---
  'Illinois': {
    color: '#ff5f05',
    logo: espnLogo('ncaa', '356'),
    shortName: 'Fighting Illini',
    tmNames: [
      'Illinois Fighting Illini',
      "Illinois Fighting Illini Men's Basketball", "Illinois Fighting Illini Women's Basketball",
    ],
  },
  'Indiana': {
    color: '#970310',
    logo: espnLogo('ncaa', '84'),
    shortName: 'Hoosiers',
    tmNames: [
      'Indiana Hoosiers',
      "Indiana Hoosiers Men's Basketball", "Indiana Hoosiers Women's Basketball",
    ],
  },
  'Iowa': {
    color: '#231f20',
    logo: espnLogo('ncaa', '2294'),
    shortName: 'Hawkeyes',
    tmNames: [
      'Iowa Hawkeyes',
      "Iowa Hawkeyes Men's Basketball", "Iowa Hawkeyes Women's Basketball",
    ],
  },
  'Maryland': {
    color: '#ce1126',
    logo: espnLogo('ncaa', '120'),
    shortName: 'Terrapins',
    tmNames: [
      'Maryland Terrapins',
      "Maryland Terrapins Men's Basketball", "Maryland Terrapins Women's Basketball",
    ],
  },
  'Michigan': {
    color: '#00274c',
    logo: espnLogo('ncaa', '130'),
    shortName: 'Wolverines',
    tmNames: [
      'Michigan Wolverines',
      "Michigan Wolverines Men's Basketball", "Michigan Wolverines Women's Basketball",
    ],
  },
  'Michigan State': {
    color: '#173f35',
    logo: espnLogo('ncaa', '127'),
    shortName: 'Spartans',
    tmNames: [
      'Michigan State Spartans',
      "Michigan State Spartans Men's Basketball", "Michigan State Spartans Women's Basketball",
    ],
  },
  'Minnesota': {
    color: '#5e0a2f',
    logo: espnLogo('ncaa', '135'),
    shortName: 'Golden Gophers',
    tmNames: [
      'Minnesota Golden Gophers',
      "Minnesota Golden Gophers Men's Basketball", "Minnesota Golden Gophers Women's Basketball",
    ],
  },
  'Nebraska': {
    color: '#e31937',
    logo: espnLogo('ncaa', '158'),
    shortName: 'Cornhuskers',
    tmNames: [
      'Nebraska Cornhuskers',
      "Nebraska Cornhuskers Men's Basketball", "Nebraska Cornhuskers Women's Basketball",
    ],
  },
  'Northwestern': {
    color: '#492f92',
    logo: espnLogo('ncaa', '77'),
    shortName: 'Wildcats',
    tmNames: [
      'Northwestern Wildcats',
      "Northwestern Wildcats Men's Basketball", "Northwestern Wildcats Women's Basketball",
    ],
  },
  'Ohio State': {
    color: '#ba0c2f',
    logo: espnLogo('ncaa', '194'),
    shortName: 'Buckeyes',
    tmNames: [
      'Ohio State Buckeyes',
      "Ohio State Buckeyes Men's Basketball", "Ohio State Buckeyes Women's Basketball",
    ],
  },
  'Oregon': {
    color: '#00934b',
    logo: espnLogo('ncaa', '2483'),
    shortName: 'Ducks',
    tmNames: [
      'Oregon Ducks',
      "Oregon Ducks Men's Basketball", "Oregon Ducks Women's Basketball",
    ],
  },
  'Penn State': {
    color: '#061440',
    logo: espnLogo('ncaa', '213'),
    shortName: 'Nittany Lions',
    tmNames: [
      'Penn State Nittany Lions',
      "Penn State Nittany Lions Men's Basketball", "Penn State Nittany Lions Women's Basketball",
    ],
  },
  'Purdue': {
    color: '#ceb888',
    logo: espnLogo('ncaa', '2509'),
    shortName: 'Boilermakers',
    tmNames: [
      'Purdue Boilermakers',
      "Purdue Boilermakers Men's Basketball", "Purdue Boilermakers Women's Basketball",
    ],
  },
  'Rutgers': {
    color: '#ce0e2d',
    logo: espnLogo('ncaa', '164'),
    shortName: 'Scarlet Knights',
    tmNames: [
      'Rutgers Scarlet Knights',
      "Rutgers Scarlet Knights Men's Basketball", "Rutgers Scarlet Knights Women's Basketball",
    ],
  },
  'UCLA': {
    color: '#2774ae',
    logo: espnLogo('ncaa', '26'),
    shortName: 'Bruins',
    tmNames: [
      'UCLA Bruins',
      "UCLA Bruins Men's Basketball", "UCLA Bruins Women's Basketball",
    ],
  },
  'USC': {
    color: '#9d2235',
    logo: espnLogo('ncaa', '30'),
    shortName: 'Trojans',
    tmNames: [
      'USC Trojans',
      "USC Trojans Men's Basketball", "USC Trojans Women's Basketball",
    ],
  },
  'Washington': {
    color: '#33006f',
    logo: espnLogo('ncaa', '264'),
    shortName: 'Huskies',
    tmNames: [
      'Washington Huskies',
      "Washington Huskies Men's Basketball", "Washington Huskies Women's Basketball",
    ],
  },
  'Wisconsin': {
    color: '#a00000',
    logo: espnLogo('ncaa', '275'),
    shortName: 'Badgers',
    tmNames: [
      'Wisconsin Badgers',
      "Wisconsin Badgers Men's Basketball", "Wisconsin Badgers Women's Basketball",
    ],
  },

  // --- Big West Conference ---
  'Bakersfield': {
    color: '#003BAB',
    logo: espnLogo('ncaa', '2934'),
    shortName: 'Roadrunners',
    tmNames: [
      'Bakersfield Roadrunners',
      "Bakersfield Roadrunners Men's Basketball", "Bakersfield Roadrunners Women's Basketball",
    ],
  },
  'Cal Poly': {
    color: '#1E4D2B',
    logo: espnLogo('ncaa', '13'),
    shortName: 'Mustangs',
    tmNames: [
      'Cal Poly Mustangs',
      "Cal Poly Mustangs Men's Basketball", "Cal Poly Mustangs Women's Basketball",
    ],
  },
  'CSU Northridge': {
    color: '#b50000',
    logo: espnLogo('ncaa', '2463'),
    shortName: 'Matadors',
    tmNames: [
      'CSU Northridge Matadors',
      "CSU Northridge Matadors Men's Basketball", "CSU Northridge Matadors Women's Basketball",
    ],
  },
  'Fullerton': {
    color: '#003767',
    logo: espnLogo('ncaa', '2239'),
    shortName: 'Titans',
    tmNames: [
      'Fullerton Titans',
      "Fullerton Titans Men's Basketball", "Fullerton Titans Women's Basketball",
    ],
  },
  'Long Beach State': {
    color: '#000000',
    logo: espnLogo('ncaa', '299'),
    shortName: 'Beach',
    tmNames: [
      'Long Beach State Beach',
      "Long Beach State Beach Men's Basketball", "Long Beach State Beach Women's Basketball",
    ],
  },
  'Santa Barbara': {
    color: '#1e1840',
    logo: espnLogo('ncaa', '2540'),
    shortName: 'Gauchos',
    tmNames: [
      'Santa Barbara Gauchos',
      "Santa Barbara Gauchos Men's Basketball", "Santa Barbara Gauchos Women's Basketball",
    ],
  },
  'UC Davis': {
    color: '#002855',
    logo: espnLogo('ncaa', '302'),
    shortName: 'Aggies',
    tmNames: [
      'UC Davis Aggies',
      "UC Davis Aggies Men's Basketball", "UC Davis Aggies Women's Basketball",
    ],
  },
  'UC Irvine': {
    color: '#002B5C',
    logo: espnLogo('ncaa', '300'),
    shortName: 'Anteaters',
    tmNames: [
      'UC Irvine Anteaters',
      "UC Irvine Anteaters Men's Basketball", "UC Irvine Anteaters Women's Basketball",
    ],
  },
  'UC Riverside': {
    color: '#14234F',
    logo: espnLogo('ncaa', '27'),
    shortName: 'Highlanders',
    tmNames: [
      'UC Riverside Highlanders',
      "UC Riverside Highlanders Men's Basketball", "UC Riverside Highlanders Women's Basketball",
    ],
  },
  'UC San Diego': {
    color: '#000000',
    logo: espnLogo('ncaa', '28'),
    shortName: 'Tritons',
    tmNames: [
      'UC San Diego Tritons',
      "UC San Diego Tritons Men's Basketball", "UC San Diego Tritons Women's Basketball",
    ],
  },

  // --- Coastal Athletic Association ---
  'Campbell': {
    color: '#000000',
    logo: espnLogo('ncaa', '2097'),
    shortName: 'Fighting Camels',
    tmNames: [
      'Campbell Fighting Camels',
      "Campbell Fighting Camels Men's Basketball", "Campbell Fighting Camels Women's Basketball",
    ],
  },
  'Charleston': {
    color: '#7a2531',
    logo: espnLogo('ncaa', '232'),
    shortName: 'Cougars',
    tmNames: [
      'Charleston Cougars',
      "Charleston Cougars Men's Basketball", "Charleston Cougars Women's Basketball",
    ],
  },
  'Drexel': {
    color: '#020260',
    logo: espnLogo('ncaa', '2182'),
    shortName: 'Dragons',
    tmNames: [
      'Drexel Dragons',
      "Drexel Dragons Men's Basketball", "Drexel Dragons Women's Basketball",
    ],
  },
  'Elon': {
    color: '#020303',
    logo: espnLogo('ncaa', '2210'),
    shortName: 'Phoenix',
    tmNames: [
      'Elon Phoenix',
      "Elon Phoenix Men's Basketball", "Elon Phoenix Women's Basketball",
    ],
  },
  'Hampton': {
    color: '#0067AC',
    logo: espnLogo('ncaa', '2261'),
    shortName: 'Pirates',
    tmNames: [
      'Hampton Pirates',
      "Hampton Pirates Men's Basketball", "Hampton Pirates Women's Basketball",
    ],
  },
  'Hofstra': {
    color: '#003594',
    logo: espnLogo('ncaa', '2275'),
    shortName: 'Pride',
    tmNames: [
      'Hofstra Pride',
      "Hofstra Pride Men's Basketball", "Hofstra Pride Women's Basketball",
    ],
  },
  'Monmouth': {
    color: '#051844',
    logo: espnLogo('ncaa', '2405'),
    shortName: 'Hawks',
    tmNames: [
      'Monmouth Hawks',
      "Monmouth Hawks Men's Basketball", "Monmouth Hawks Women's Basketball",
    ],
  },
  'NC A&T': {
    color: '#0505aa',
    logo: espnLogo('ncaa', '2448'),
    shortName: 'Aggies',
    tmNames: [
      'NC A&T Aggies',
      "NC A&T Aggies Men's Basketball", "NC A&T Aggies Women's Basketball",
    ],
  },
  'Northeastern': {
    color: '#CC0001',
    logo: espnLogo('ncaa', '111'),
    shortName: 'Huskies',
    tmNames: [
      'Northeastern Huskies',
      "Northeastern Huskies Men's Basketball", "Northeastern Huskies Women's Basketball",
    ],
  },
  'Stony Brook': {
    color: '#990000',
    logo: espnLogo('ncaa', '2619'),
    shortName: 'Seawolves',
    tmNames: [
      'Stony Brook Seawolves',
      "Stony Brook Seawolves Men's Basketball", "Stony Brook Seawolves Women's Basketball",
    ],
  },
  'Towson': {
    color: '#FFC229',
    logo: espnLogo('ncaa', '119'),
    shortName: 'Tigers',
    tmNames: [
      'Towson Tigers',
      "Towson Tigers Men's Basketball", "Towson Tigers Women's Basketball",
    ],
  },
  'UNC Wilmington': {
    color: '#00665e',
    logo: espnLogo('ncaa', '350'),
    shortName: 'Seahawks',
    tmNames: [
      'UNC Wilmington Seahawks',
      "UNC Wilmington Seahawks Men's Basketball", "UNC Wilmington Seahawks Women's Basketball",
    ],
  },
  'William & Mary': {
    color: '#115740',
    logo: espnLogo('ncaa', '2729'),
    shortName: 'Tribe',
    tmNames: [
      'William & Mary Tribe',
      "William & Mary Tribe Men's Basketball", "William & Mary Tribe Women's Basketball",
    ],
  },

  // --- Conference USA ---
  'Delaware': {
    color: '#00539f',
    logo: espnLogo('ncaa', '48'),
    shortName: 'Blue Hens',
    tmNames: [
      'Delaware Blue Hens',
      "Delaware Blue Hens Men's Basketball", "Delaware Blue Hens Women's Basketball",
    ],
  },
  'FIU': {
    color: '#091f3f',
    logo: espnLogo('ncaa', '2229'),
    shortName: 'Panthers',
    tmNames: [
      'FIU Panthers',
      "FIU Panthers Men's Basketball", "FIU Panthers Women's Basketball",
    ],
  },
  'Jax State': {
    color: '#cc0000',
    logo: espnLogo('ncaa', '55'),
    shortName: 'Gamecocks',
    tmNames: [
      'Jax State Gamecocks',
      "Jax State Gamecocks Men's Basketball", "Jax State Gamecocks Women's Basketball",
    ],
  },
  'Kennesaw State': {
    color: '#fdbb30',
    logo: espnLogo('ncaa', '338'),
    shortName: 'Owls',
    tmNames: [
      'Kennesaw State Owls',
      "Kennesaw State Owls Men's Basketball", "Kennesaw State Owls Women's Basketball",
    ],
  },
  'Liberty': {
    color: '#0a254e',
    logo: espnLogo('ncaa', '2335'),
    shortName: 'Flames',
    tmNames: [
      'Liberty Flames',
      "Liberty Flames Men's Basketball", "Liberty Flames Women's Basketball",
    ],
  },
  'Louisiana Tech': {
    color: '#003087',
    logo: espnLogo('ncaa', '2348'),
    shortName: 'Bulldogs',
    tmNames: [
      'Louisiana Tech Bulldogs',
      "Louisiana Tech Bulldogs Men's Basketball", "Louisiana Tech Bulldogs Women's Basketball",
    ],
  },
  'Missouri State': {
    color: '#5e0009',
    logo: espnLogo('ncaa', '2623'),
    shortName: 'Bears',
    tmNames: [
      'Missouri State Bears',
      "Missouri State Bears Men's Basketball", "Missouri State Bears Women's Basketball",
    ],
  },
  'MTSU': {
    color: '#036eb7',
    logo: espnLogo('ncaa', '2393'),
    shortName: 'Blue Raiders',
    tmNames: [
      'MTSU Blue Raiders',
      "MTSU Blue Raiders Men's Basketball", "MTSU Blue Raiders Women's Basketball",
    ],
  },
  'New Mexico State': {
    color: '#7e141b',
    logo: espnLogo('ncaa', '166'),
    shortName: 'Aggies',
    tmNames: [
      'New Mexico State Aggies',
      "New Mexico State Aggies Men's Basketball", "New Mexico State Aggies Women's Basketball",
    ],
  },
  'Sam Houston': {
    color: '#f56423',
    logo: espnLogo('ncaa', '2534'),
    shortName: 'Bearkats',
    tmNames: [
      'Sam Houston Bearkats',
      "Sam Houston Bearkats Men's Basketball", "Sam Houston Bearkats Women's Basketball",
    ],
  },
  'UTEP': {
    color: '#ff8200',
    logo: espnLogo('ncaa', '2638'),
    shortName: 'Miners',
    tmNames: [
      'UTEP Miners',
      "UTEP Miners Men's Basketball", "UTEP Miners Women's Basketball",
    ],
  },
  'Western KY': {
    color: '#e13a3e',
    logo: espnLogo('ncaa', '98'),
    shortName: 'Hilltoppers',
    tmNames: [
      'Western KY Hilltoppers',
      "Western KY Hilltoppers Men's Basketball", "Western KY Hilltoppers Women's Basketball",
    ],
  },

  // --- FBS Independents ---
  'Notre Dame': {
    color: '#062340',
    logo: espnLogo('ncaa', '87'),
    shortName: 'Fighting Irish',
    tmNames: [
      'Notre Dame University Fighting Irish',
      "Notre Dame University Fighting Irish Men's Basketball", "Notre Dame University Fighting Irish Women's Basketball",
    ],
  },
  'UConn': {
    color: '#0c2340',
    logo: espnLogo('ncaa', '41'),
    shortName: 'Huskies',
    tmNames: [
      'UConn Huskies',
      "UConn Huskies Men's Basketball", "UConn Huskies Women's Basketball",
    ],
  },

  // --- Horizon League ---
  'Cleveland State': {
    color: '#006633',
    logo: espnLogo('ncaa', '325'),
    shortName: 'Vikings',
    tmNames: [
      'Cleveland State Vikings',
      "Cleveland State Vikings Men's Basketball", "Cleveland State Vikings Women's Basketball",
    ],
  },
  'Detroit Mercy': {
    color: '#165b9e',
    logo: espnLogo('ncaa', '2174'),
    shortName: 'Titans',
    tmNames: [
      'Detroit Mercy Titans',
      "Detroit Mercy Titans Men's Basketball", "Detroit Mercy Titans Women's Basketball",
    ],
  },
  'Green Bay': {
    color: '#006633',
    logo: espnLogo('ncaa', '2739'),
    shortName: 'Phoenix',
    tmNames: [
      'Green Bay Phoenix',
      "Green Bay Phoenix Men's Basketball", "Green Bay Phoenix Women's Basketball",
    ],
  },
  'IU Indy': {
    color: '#A81F30',
    logo: espnLogo('ncaa', '85'),
    shortName: 'Jaguars',
    tmNames: [
      'IU Indy Jaguars',
      "IU Indy Jaguars Men's Basketball", "IU Indy Jaguars Women's Basketball",
    ],
  },
  'Milwaukee': {
    color: '#000000',
    logo: espnLogo('ncaa', '270'),
    shortName: 'Panthers',
    tmNames: [
      'Milwaukee Panthers',
      "Milwaukee Panthers Men's Basketball", "Milwaukee Panthers Women's Basketball",
    ],
  },
  'N Kentucky': {
    color: '#ffc82e',
    logo: espnLogo('ncaa', '94'),
    shortName: 'Norse',
    tmNames: [
      'N Kentucky Norse',
      "N Kentucky Norse Men's Basketball", "N Kentucky Norse Women's Basketball",
    ],
  },
  'Oakland': {
    color: '#04091c',
    logo: espnLogo('ncaa', '2473'),
    shortName: 'Golden Grizzlies',
    tmNames: [
      'Oakland Golden Grizzlies',
      "Oakland Golden Grizzlies Men's Basketball", "Oakland Golden Grizzlies Women's Basketball",
    ],
  },
  'Purdue FW': {
    color: '#cfb991',
    logo: espnLogo('ncaa', '2870'),
    shortName: 'Mastodons',
    tmNames: [
      'Purdue FW Mastodons',
      "Purdue FW Mastodons Men's Basketball", "Purdue FW Mastodons Women's Basketball",
    ],
  },
  'Robert Morris': {
    color: '#00214D',
    logo: espnLogo('ncaa', '2523'),
    shortName: 'Colonials',
    tmNames: [
      'Robert Morris Colonials',
      "Robert Morris Colonials Men's Basketball", "Robert Morris Colonials Women's Basketball",
    ],
  },
  'Wright State': {
    color: '#cba052',
    logo: espnLogo('ncaa', '2750'),
    shortName: 'Raiders',
    tmNames: [
      'Wright State Raiders',
      "Wright State Raiders Men's Basketball", "Wright State Raiders Women's Basketball",
    ],
  },
  'Youngstown State': {
    color: '#E51936',
    logo: espnLogo('ncaa', '2754'),
    shortName: 'Penguins',
    tmNames: [
      'Youngstown State Penguins',
      "Youngstown State Penguins Men's Basketball", "Youngstown State Penguins Women's Basketball",
    ],
  },

  // --- Ivy League ---
  'Brown': {
    color: '#411e09',
    logo: espnLogo('ncaa', '225'),
    shortName: 'Bears',
    tmNames: [
      'Brown Bears',
      "Brown Bears Men's Basketball", "Brown Bears Women's Basketball",
    ],
  },
  'Columbia': {
    color: '#7ba4db',
    logo: espnLogo('ncaa', '171'),
    shortName: 'Lions',
    tmNames: [
      'Columbia Lions',
      "Columbia Lions Men's Basketball", "Columbia Lions Women's Basketball",
    ],
  },
  'Cornell': {
    color: '#b31b1b',
    logo: espnLogo('ncaa', '172'),
    shortName: 'Big Red',
    tmNames: [
      'Cornell Big Red',
      "Cornell Big Red Men's Basketball", "Cornell Big Red Women's Basketball",
    ],
  },
  'Dartmouth': {
    color: '#005730',
    logo: espnLogo('ncaa', '159'),
    shortName: 'Big Green',
    tmNames: [
      'Dartmouth Big Green',
      "Dartmouth Big Green Men's Basketball", "Dartmouth Big Green Women's Basketball",
    ],
  },
  'Harvard': {
    color: '#990000',
    logo: espnLogo('ncaa', '108'),
    shortName: 'Crimson',
    tmNames: [
      'Harvard Crimson',
      "Harvard Crimson Men's Basketball", "Harvard Crimson Women's Basketball",
    ],
  },
  'Penn': {
    color: '#082A74',
    logo: espnLogo('ncaa', '219'),
    shortName: 'Quakers',
    tmNames: [
      'Penn Quakers',
      "Penn Quakers Men's Basketball", "Penn Quakers Women's Basketball",
    ],
  },
  'Princeton': {
    color: '#000000',
    logo: espnLogo('ncaa', '163'),
    shortName: 'Tigers',
    tmNames: [
      'Princeton Tigers',
      "Princeton Tigers Men's Basketball", "Princeton Tigers Women's Basketball",
    ],
  },
  'Yale': {
    color: '#004a81',
    logo: espnLogo('ncaa', '43'),
    shortName: 'Bulldogs',
    tmNames: [
      'Yale Bulldogs',
      "Yale Bulldogs Men's Basketball", "Yale Bulldogs Women's Basketball",
    ],
  },

  // --- Metro Atlantic Athletic Conference ---
  'Canisius': {
    color: '#004a81',
    logo: espnLogo('ncaa', '2099'),
    shortName: 'Golden Griffins',
    tmNames: [
      'Canisius Golden Griffins',
      "Canisius Golden Griffins Men's Basketball", "Canisius Golden Griffins Women's Basketball",
    ],
  },
  'Fairfield': {
    color: '#000000',
    logo: espnLogo('ncaa', '2217'),
    shortName: 'Stags',
    tmNames: [
      'Fairfield Stags',
      "Fairfield Stags Men's Basketball", "Fairfield Stags Women's Basketball",
    ],
  },
  'Iona': {
    color: '#6f2c3e',
    logo: espnLogo('ncaa', '314'),
    shortName: 'Gaels',
    tmNames: [
      'Iona Gaels',
      "Iona Gaels Men's Basketball", "Iona Gaels Women's Basketball",
    ],
  },
  'Manhattan': {
    color: '#4f8537',
    logo: espnLogo('ncaa', '2363'),
    shortName: 'Jaspers',
    tmNames: [
      'Manhattan Jaspers',
      "Manhattan Jaspers Men's Basketball", "Manhattan Jaspers Women's Basketball",
    ],
  },
  'Marist': {
    color: '#e53730',
    logo: espnLogo('ncaa', '2368'),
    shortName: 'Red Foxes',
    tmNames: [
      'Marist Red Foxes',
      "Marist Red Foxes Men's Basketball", "Marist Red Foxes Women's Basketball",
    ],
  },
  'Merrimack': {
    color: '#000000',
    logo: espnLogo('ncaa', '2771'),
    shortName: 'Warriors',
    tmNames: [
      'Merrimack Warriors',
      "Merrimack Warriors Men's Basketball", "Merrimack Warriors Women's Basketball",
    ],
  },
  'Mount State Marys': {
    color: '#005596',
    logo: espnLogo('ncaa', '116'),
    shortName: 'Mountaineers',
    tmNames: [
      'Mount State Marys Mountaineers',
      "Mount State Marys Mountaineers Men's Basketball", "Mount State Marys Mountaineers Women's Basketball",
    ],
  },
  'Niagara': {
    color: '#69207E',
    logo: espnLogo('ncaa', '315'),
    shortName: 'Purple Eagles',
    tmNames: [
      'Niagara Purple Eagles',
      "Niagara Purple Eagles Men's Basketball", "Niagara Purple Eagles Women's Basketball",
    ],
  },
  'Quinnipiac': {
    color: '#041B43',
    logo: espnLogo('ncaa', '2514'),
    shortName: 'Bobcats',
    tmNames: [
      'Quinnipiac Bobcats',
      "Quinnipiac Bobcats Men's Basketball", "Quinnipiac Bobcats Women's Basketball",
    ],
  },
  'Rider': {
    color: '#a80532',
    logo: espnLogo('ncaa', '2520'),
    shortName: 'Broncs',
    tmNames: [
      'Rider Broncs',
      "Rider Broncs Men's Basketball", "Rider Broncs Women's Basketball",
    ],
  },
  'Sacred Heart': {
    color: '#a40012',
    logo: espnLogo('ncaa', '2529'),
    shortName: 'Pioneers',
    tmNames: [
      'Sacred Heart Pioneers',
      "Sacred Heart Pioneers Men's Basketball", "Sacred Heart Pioneers Women's Basketball",
    ],
  },
  'Saint Peter\'s': {
    color: '#004CC2',
    logo: espnLogo('ncaa', '2612'),
    shortName: 'Peacocks',
    tmNames: [
      'Saint Peter\'s Peacocks',
      "Saint Peter's Peacocks Men's Basketball", "Saint Peter's Peacocks Women's Basketball",
    ],
  },
  'Siena': {
    color: '#037961',
    logo: espnLogo('ncaa', '2561'),
    shortName: 'Saints',
    tmNames: [
      'Siena Saints',
      "Siena Saints Men's Basketball", "Siena Saints Women's Basketball",
    ],
  },

  // --- Mid-American Conference ---
  'Akron': {
    color: '#041e42',
    logo: espnLogo('ncaa', '2006'),
    shortName: 'Zips',
    tmNames: [
      'Akron Zips',
      "Akron Zips Men's Basketball", "Akron Zips Women's Basketball",
    ],
  },
  'Ball State': {
    color: '#ba0c2f',
    logo: espnLogo('ncaa', '2050'),
    shortName: 'Cardinals',
    tmNames: [
      'Ball State Cardinals',
      "Ball State Cardinals Men's Basketball", "Ball State Cardinals Women's Basketball",
    ],
  },
  'Bowling Green': {
    color: '#fd5000',
    logo: espnLogo('ncaa', '189'),
    shortName: 'Falcons',
    tmNames: [
      'Bowling Green Falcons',
      "Bowling Green Falcons Men's Basketball", "Bowling Green Falcons Women's Basketball",
    ],
  },
  'Buffalo': {
    color: '#005bbb',
    logo: espnLogo('ncaa', '2084'),
    shortName: 'Bulls',
    tmNames: [
      'Buffalo Bulls',
      "Buffalo Bulls Men's Basketball", "Buffalo Bulls Women's Basketball",
    ],
  },
  'C Michigan': {
    color: '#4c0027',
    logo: espnLogo('ncaa', '2117'),
    shortName: 'Chippewas',
    tmNames: [
      'C Michigan Chippewas',
      "C Michigan Chippewas Men's Basketball", "C Michigan Chippewas Women's Basketball",
    ],
  },
  'E Michigan': {
    color: '#006938',
    logo: espnLogo('ncaa', '2199'),
    shortName: 'Eagles',
    tmNames: [
      'E Michigan Eagles',
      "E Michigan Eagles Men's Basketball", "E Michigan Eagles Women's Basketball",
    ],
  },
  'Kent State': {
    color: '#002664',
    logo: espnLogo('ncaa', '2309'),
    shortName: 'Golden Flashes',
    tmNames: [
      'Kent State Golden Flashes',
      "Kent State Golden Flashes Men's Basketball", "Kent State Golden Flashes Women's Basketball",
    ],
  },
  'Miami OH': {
    color: '#c41230',
    logo: espnLogo('ncaa', '193'),
    shortName: 'RedHawks',
    tmNames: [
      'Miami OH RedHawks',
      "Miami OH RedHawks Men's Basketball", "Miami OH RedHawks Women's Basketball",
    ],
  },
  'N Illinois': {
    color: '#c8102e',
    logo: espnLogo('ncaa', '2459'),
    shortName: 'Huskies',
    tmNames: [
      'N Illinois Huskies',
      "N Illinois Huskies Men's Basketball", "N Illinois Huskies Women's Basketball",
    ],
  },
  'Ohio': {
    color: '#154734',
    logo: espnLogo('ncaa', '195'),
    shortName: 'Bobcats',
    tmNames: [
      'Ohio Bobcats',
      "Ohio Bobcats Men's Basketball", "Ohio Bobcats Women's Basketball",
    ],
  },
  'Toledo': {
    color: '#0b2240',
    logo: espnLogo('ncaa', '2649'),
    shortName: 'Rockets',
    tmNames: [
      'Toledo Rockets',
      "Toledo Rockets Men's Basketball", "Toledo Rockets Women's Basketball",
    ],
  },
  'UMass': {
    color: '#881c1c',
    logo: espnLogo('ncaa', '113'),
    shortName: 'Minutemen',
    tmNames: [
      'UMass Minutemen',
      "UMass Minutemen Men's Basketball", "UMass Minutemen Women's Basketball",
    ],
  },
  'W Michigan': {
    color: '#532e1f',
    logo: espnLogo('ncaa', '2711'),
    shortName: 'Broncos',
    tmNames: [
      'W Michigan Broncos',
      "W Michigan Broncos Men's Basketball", "W Michigan Broncos Women's Basketball",
    ],
  },

  // --- Mid-Eastern Athletic Conference ---
  'Coppin State': {
    color: '#2e3192',
    logo: espnLogo('ncaa', '2154'),
    shortName: 'Eagles',
    tmNames: [
      'Coppin State Eagles',
      "Coppin State Eagles Men's Basketball", "Coppin State Eagles Women's Basketball",
    ],
  },
  'Delaware State': {
    color: '#009cdb',
    logo: espnLogo('ncaa', '2169'),
    shortName: 'Hornets',
    tmNames: [
      'Delaware State Hornets',
      "Delaware State Hornets Men's Basketball", "Delaware State Hornets Women's Basketball",
    ],
  },
  'Howard': {
    color: '#003a63',
    logo: espnLogo('ncaa', '47'),
    shortName: 'Bison',
    tmNames: [
      'Howard Bison',
      "Howard Bison Men's Basketball", "Howard Bison Women's Basketball",
    ],
  },
  'MD Eastern': {
    color: '#5c2301',
    logo: espnLogo('ncaa', '2379'),
    shortName: 'Hawks',
    tmNames: [
      'MD Eastern Hawks',
      "MD Eastern Hawks Men's Basketball", "MD Eastern Hawks Women's Basketball",
    ],
  },
  'Morgan State': {
    color: '#014786',
    logo: espnLogo('ncaa', '2415'),
    shortName: 'Bears',
    tmNames: [
      'Morgan State Bears',
      "Morgan State Bears Men's Basketball", "Morgan State Bears Women's Basketball",
    ],
  },
  'NC Central': {
    color: '#880023',
    logo: espnLogo('ncaa', '2428'),
    shortName: 'Eagles',
    tmNames: [
      'NC Central Eagles',
      "NC Central Eagles Men's Basketball", "NC Central Eagles Women's Basketball",
    ],
  },
  'Norfolk State': {
    color: '#0c8968',
    logo: espnLogo('ncaa', '2450'),
    shortName: 'Spartans',
    tmNames: [
      'Norfolk State Spartans',
      "Norfolk State Spartans Men's Basketball", "Norfolk State Spartans Women's Basketball",
    ],
  },
  'SC State': {
    color: '#7d1315',
    logo: espnLogo('ncaa', '2569'),
    shortName: 'Bulldogs',
    tmNames: [
      'SC State Bulldogs',
      "SC State Bulldogs Men's Basketball", "SC State Bulldogs Women's Basketball",
    ],
  },

  // --- Missouri Valley Conference ---
  'Belmont': {
    color: '#182142',
    logo: espnLogo('ncaa', '2057'),
    shortName: 'Bruins',
    tmNames: [
      'Belmont Bruins',
      "Belmont Bruins Men's Basketball", "Belmont Bruins Women's Basketball",
    ],
  },
  'Bradley': {
    color: '#b70002',
    logo: espnLogo('ncaa', '71'),
    shortName: 'Braves',
    tmNames: [
      'Bradley Braves',
      "Bradley Braves Men's Basketball", "Bradley Braves Women's Basketball",
    ],
  },
  'Drake': {
    color: '#005596',
    logo: espnLogo('ncaa', '2181'),
    shortName: 'Bulldogs',
    tmNames: [
      'Drake Bulldogs',
      "Drake Bulldogs Men's Basketball", "Drake Bulldogs Women's Basketball",
    ],
  },
  'Evansville': {
    color: '#663399',
    logo: espnLogo('ncaa', '339'),
    shortName: 'Purple Aces',
    tmNames: [
      'Evansville Purple Aces',
      "Evansville Purple Aces Men's Basketball", "Evansville Purple Aces Women's Basketball",
    ],
  },
  'Illinois State': {
    color: '#CE1126',
    logo: espnLogo('ncaa', '2287'),
    shortName: 'Redbirds',
    tmNames: [
      'Illinois State Redbirds',
      "Illinois State Redbirds Men's Basketball", "Illinois State Redbirds Women's Basketball",
    ],
  },
  'Indiana State': {
    color: '#00669a',
    logo: espnLogo('ncaa', '282'),
    shortName: 'Sycamores',
    tmNames: [
      'Indiana State Sycamores',
      "Indiana State Sycamores Men's Basketball", "Indiana State Sycamores Women's Basketball",
    ],
  },
  'Murray State': {
    color: '#002148',
    logo: espnLogo('ncaa', '93'),
    shortName: 'Racers',
    tmNames: [
      'Murray State Racers',
      "Murray State Racers Men's Basketball", "Murray State Racers Women's Basketball",
    ],
  },
  'Northern Iowa': {
    color: '#473282',
    logo: espnLogo('ncaa', '2460'),
    shortName: 'Panthers',
    tmNames: [
      'Northern Iowa Panthers',
      "Northern Iowa Panthers Men's Basketball", "Northern Iowa Panthers Women's Basketball",
    ],
  },
  'S Illinois': {
    color: '#85283D',
    logo: espnLogo('ncaa', '79'),
    shortName: 'Salukis',
    tmNames: [
      'S Illinois Salukis',
      "S Illinois Salukis Men's Basketball", "S Illinois Salukis Women's Basketball",
    ],
  },
  'UIC': {
    color: '#001e62',
    logo: espnLogo('ncaa', '82'),
    shortName: 'Flames',
    tmNames: [
      'UIC Flames',
      "UIC Flames Men's Basketball", "UIC Flames Women's Basketball",
    ],
  },
  'Valparaiso': {
    color: '#794500',
    logo: espnLogo('ncaa', '2674'),
    shortName: 'Beacons',
    tmNames: [
      'Valparaiso Beacons',
      "Valparaiso Beacons Men's Basketball", "Valparaiso Beacons Women's Basketball",
    ],
  },

  // --- Mountain West Conference ---
  'Air Force': {
    color: '#003594',
    logo: espnLogo('ncaa', '2005'),
    shortName: 'Falcons',
    tmNames: [
      'Air Force Falcons',
      "Air Force Falcons Men's Basketball", "Air Force Falcons Women's Basketball",
    ],
  },
  'Boise State': {
    color: '#0033a0',
    logo: espnLogo('ncaa', '68'),
    shortName: 'Broncos',
    tmNames: [
      'Boise State Broncos',
      "Boise State Broncos Men's Basketball", "Boise State Broncos Women's Basketball",
    ],
  },
  'Colorado State': {
    color: '#004c23',
    logo: espnLogo('ncaa', '36'),
    shortName: 'Rams',
    tmNames: [
      'Colorado State Rams',
      "Colorado State Rams Men's Basketball", "Colorado State Rams Women's Basketball",
    ],
  },
  'Fresno State': {
    color: '#b1102b',
    logo: espnLogo('ncaa', '278'),
    shortName: 'Bulldogs',
    tmNames: [
      'Fresno State Bulldogs',
      "Fresno State Bulldogs Men's Basketball", "Fresno State Bulldogs Women's Basketball",
    ],
  },
  'Hawai\'i': {
    color: '#005737',
    logo: espnLogo('ncaa', '62'),
    shortName: 'Rainbow Warriors',
    tmNames: [
      'Hawai\'i Rainbow Warriors',
      "Hawai'i Rainbow Warriors Men's Basketball", "Hawai'i Rainbow Warriors Women's Basketball",
    ],
  },
  'Nevada': {
    color: '#041e42',
    logo: espnLogo('ncaa', '2440'),
    shortName: 'Wolf Pack',
    tmNames: [
      'Nevada Wolf Pack',
      "Nevada Wolf Pack Men's Basketball", "Nevada Wolf Pack Women's Basketball",
    ],
  },
  'New Mexico': {
    color: '#ba0c2f',
    logo: espnLogo('ncaa', '167'),
    shortName: 'Lobos',
    tmNames: [
      'New Mexico Lobos',
      "New Mexico Lobos Men's Basketball", "New Mexico Lobos Women's Basketball",
    ],
  },
  'San Diego State': {
    color: '#a6192e',
    logo: espnLogo('ncaa', '21'),
    shortName: 'Aztecs',
    tmNames: [
      'SDSU Aztec',
      "San Diego State Aztecs Men's Basketball", "San Diego State Aztecs Women's Basketball",
    ],
  },
  'San José State': {
    color: '#0038a8',
    logo: espnLogo('ncaa', '23'),
    shortName: 'Spartans',
    tmNames: [
      'San José State Spartans',
      "San José State Spartans Men's Basketball", "San José State Spartans Women's Basketball",
    ],
  },
  'UNLV': {
    color: '#cf0a2c',
    logo: espnLogo('ncaa', '2439'),
    shortName: 'Rebels',
    tmNames: [
      'UNLV Rebels',
      "UNLV Rebels Men's Basketball", "UNLV Rebels Women's Basketball",
    ],
  },
  'Wyoming': {
    color: '#492f24',
    logo: espnLogo('ncaa', '2751'),
    shortName: 'Cowboys',
    tmNames: [
      'Wyoming Cowboys',
      "Wyoming Cowboys Men's Basketball", "Wyoming Cowboys Women's Basketball",
    ],
  },

  // --- Northeast Conference ---
  'C Connecticut': {
    color: '#1B49A2',
    logo: espnLogo('ncaa', '2115'),
    shortName: 'Blue Devils',
    tmNames: [
      'C Connecticut Blue Devils',
      "C Connecticut Blue Devils Men's Basketball", "C Connecticut Blue Devils Women's Basketball",
    ],
  },
  'Chicago State': {
    color: '#006700',
    logo: espnLogo('ncaa', '2130'),
    shortName: 'Cougars',
    tmNames: [
      'Chicago State Cougars',
      "Chicago State Cougars Men's Basketball", "Chicago State Cougars Women's Basketball",
    ],
  },
  'FDU': {
    color: '#72293c',
    logo: espnLogo('ncaa', '161'),
    shortName: 'Knights',
    tmNames: [
      'FDU Knights',
      "FDU Knights Men's Basketball", "FDU Knights Women's Basketball",
    ],
  },
  'Le Moyne': {
    color: '#333333',
    logo: espnLogo('ncaa', '2330'),
    shortName: 'Dolphins',
    tmNames: [
      'Le Moyne Dolphins',
      "Le Moyne Dolphins Men's Basketball", "Le Moyne Dolphins Women's Basketball",
    ],
  },
  'Long Island': {
    color: '#50c9f7',
    logo: espnLogo('ncaa', '112358'),
    shortName: 'Sharks',
    tmNames: [
      'Long Island Sharks',
      "Long Island Sharks Men's Basketball", "Long Island Sharks Women's Basketball",
    ],
  },
  'Mercyhurst': {
    color: '#000000',
    logo: espnLogo('ncaa', '2385'),
    shortName: 'Lakers',
    tmNames: [
      'Mercyhurst Lakers',
      "Mercyhurst Lakers Men's Basketball", "Mercyhurst Lakers Women's Basketball",
    ],
  },
  'Saint Francis': {
    color: '#a20012',
    logo: espnLogo('ncaa', '2598'),
    shortName: 'Red Flash',
    tmNames: [
      'Saint Francis Red Flash',
      "Saint Francis Red Flash Men's Basketball", "Saint Francis Red Flash Women's Basketball",
    ],
  },
  'Stonehill': {
    color: '#000000',
    logo: espnLogo('ncaa', '284'),
    shortName: 'Skyhawks',
    tmNames: [
      'Stonehill Skyhawks',
      "Stonehill Skyhawks Men's Basketball", "Stonehill Skyhawks Women's Basketball",
    ],
  },
  'Wagner': {
    color: '#00483A',
    logo: espnLogo('ncaa', '2681'),
    shortName: 'Seahawks',
    tmNames: [
      'Wagner Seahawks',
      "Wagner Seahawks Men's Basketball", "Wagner Seahawks Women's Basketball",
    ],
  },

  // --- Ohio Valley Conference ---
  'E Illinois': {
    color: '#000000',
    logo: espnLogo('ncaa', '2197'),
    shortName: 'Panthers',
    tmNames: [
      'E Illinois Panthers',
      "E Illinois Panthers Men's Basketball", "E Illinois Panthers Women's Basketball",
    ],
  },
  'Lindenwood': {
    color: '#000000',
    logo: espnLogo('ncaa', '2815'),
    shortName: 'Lions',
    tmNames: [
      'Lindenwood Lions',
      "Lindenwood Lions Men's Basketball", "Lindenwood Lions Women's Basketball",
    ],
  },
  'Little Rock': {
    color: '#AD0000',
    logo: espnLogo('ncaa', '2031'),
    shortName: 'Trojans',
    tmNames: [
      'Little Rock Trojans',
      "Little Rock Trojans Men's Basketball", "Little Rock Trojans Women's Basketball",
    ],
  },
  'Morehead State': {
    color: '#094FA3',
    logo: espnLogo('ncaa', '2413'),
    shortName: 'Eagles',
    tmNames: [
      'Morehead State Eagles',
      "Morehead State Eagles Men's Basketball", "Morehead State Eagles Women's Basketball",
    ],
  },
  'SE Missouri': {
    color: '#c8102e',
    logo: espnLogo('ncaa', '2546'),
    shortName: 'Redhawks',
    tmNames: [
      'SE Missouri Redhawks',
      "SE Missouri Redhawks Men's Basketball", "SE Missouri Redhawks Women's Basketball",
    ],
  },
  'SIUE': {
    color: '#eb1c23',
    logo: espnLogo('ncaa', '2565'),
    shortName: 'Cougars',
    tmNames: [
      'SIUE Cougars',
      "SIUE Cougars Men's Basketball", "SIUE Cougars Women's Basketball",
    ],
  },
  'Tennessee State': {
    color: '#171796',
    logo: espnLogo('ncaa', '2634'),
    shortName: 'Tigers',
    tmNames: [
      'Tennessee State Tigers',
      "Tennessee State Tigers Men's Basketball", "Tennessee State Tigers Women's Basketball",
    ],
  },
  'Tennessee Tech': {
    color: '#5A4099',
    logo: espnLogo('ncaa', '2635'),
    shortName: 'Golden Eagles',
    tmNames: [
      'Tennessee Tech Golden Eagles',
      "Tennessee Tech Golden Eagles Men's Basketball", "Tennessee Tech Golden Eagles Women's Basketball",
    ],
  },
  'UT Martin': {
    color: '#FF6700',
    logo: espnLogo('ncaa', '2630'),
    shortName: 'Skyhawks',
    tmNames: [
      'UT Martin Skyhawks',
      "UT Martin Skyhawks Men's Basketball", "UT Martin Skyhawks Women's Basketball",
    ],
  },
  'W Illinois': {
    color: '#4e1e8a',
    logo: espnLogo('ncaa', '2710'),
    shortName: 'Leathernecks',
    tmNames: [
      'W Illinois Leathernecks',
      "W Illinois Leathernecks Men's Basketball", "W Illinois Leathernecks Women's Basketball",
    ],
  },

  // --- Other ---
  'Long Island': {
    color: '#333333',
    logo: espnLogo('ncaa', '2341'),
    shortName: 'Sharks',
    tmNames: [
      'Long Island Sharks',
      "Long Island Sharks Men's Basketball", "Long Island Sharks Women's Basketball",
    ],
  },
  'New Haven': {
    color: '#041e42',
    logo: espnLogo('ncaa', '2441'),
    shortName: 'Chargers',
    tmNames: [
      'New Haven Chargers',
      "New Haven Chargers Men's Basketball", "New Haven Chargers Women's Basketball",
    ],
  },

  // --- Pac-12 Conference ---
  'Oregon State': {
    color: '#dc4405',
    logo: espnLogo('ncaa', '204'),
    shortName: 'Beavers',
    tmNames: [
      'Oregon State Beavers',
      "Oregon State Beavers Men's Basketball", "Oregon State Beavers Women's Basketball", 'Oregon State University Beavers',
    ],
  },
  'Washington State': {
    color: '#a60f2d',
    logo: espnLogo('ncaa', '265'),
    shortName: 'Cougars',
    tmNames: [
      'Washington State Cougars',
      "Washington State Cougars Men's Basketball", "Washington State Cougars Women's Basketball",
    ],
  },

  // --- Patriot League ---
  'American': {
    color: '#c41130',
    logo: espnLogo('ncaa', '44'),
    shortName: 'Eagles',
    tmNames: [
      'American Eagles',
      "American Eagles Men's Basketball", "American Eagles Women's Basketball",
    ],
  },
  'Boston U': {
    color: '#cc0000',
    logo: espnLogo('ncaa', '104'),
    shortName: 'Terriers',
    tmNames: [
      'Boston U Terriers',
      "Boston U Terriers Men's Basketball", "Boston U Terriers Women's Basketball",
    ],
  },
  'Bucknell': {
    color: '#000060',
    logo: espnLogo('ncaa', '2083'),
    shortName: 'Bison',
    tmNames: [
      'Bucknell Bison',
      "Bucknell Bison Men's Basketball", "Bucknell Bison Women's Basketball",
    ],
  },
  'Colgate': {
    color: '#821019',
    logo: espnLogo('ncaa', '2142'),
    shortName: 'Raiders',
    tmNames: [
      'Colgate Raiders',
      "Colgate Raiders Men's Basketball", "Colgate Raiders Women's Basketball",
    ],
  },
  'Holy Cross': {
    color: '#582c83',
    logo: espnLogo('ncaa', '107'),
    shortName: 'Crusaders',
    tmNames: [
      'Holy Cross Crusaders',
      "Holy Cross Crusaders Men's Basketball", "Holy Cross Crusaders Women's Basketball",
    ],
  },
  'Lafayette': {
    color: '#790000',
    logo: espnLogo('ncaa', '322'),
    shortName: 'Leopards',
    tmNames: [
      'Lafayette Leopards',
      "Lafayette Leopards Men's Basketball", "Lafayette Leopards Women's Basketball",
    ],
  },
  'Lehigh': {
    color: '#6c2b2a',
    logo: espnLogo('ncaa', '2329'),
    shortName: 'Mountain Hawks',
    tmNames: [
      'Lehigh Mountain Hawks',
      "Lehigh Mountain Hawks Men's Basketball", "Lehigh Mountain Hawks Women's Basketball",
    ],
  },
  'Loyola MD': {
    color: '#76a7a0',
    logo: espnLogo('ncaa', '2352'),
    shortName: 'Greyhounds',
    tmNames: [
      'Loyola MD Greyhounds',
      "Loyola MD Greyhounds Men's Basketball", "Loyola MD Greyhounds Women's Basketball",
    ],
  },

  // --- Southeastern Conference ---
  'Alabama': {
    color: '#9e1b32',
    logo: espnLogo('ncaa', '333'),
    shortName: 'Crimson Tide',
    tmNames: [
      'Alabama Crimson Tide',
      "Alabama Crimson Tide Men's Basketball", "Alabama Crimson Tide Women's Basketball",
    ],
  },
  'Arkansas': {
    color: '#a32136',
    logo: espnLogo('ncaa', '8'),
    shortName: 'Razorbacks',
    tmNames: [
      'Arkansas Razorbacks',
      "Arkansas Razorbacks Men's Basketball", "Arkansas Razorbacks Women's Basketball",
    ],
  },
  'Auburn': {
    color: '#002b5c',
    logo: espnLogo('ncaa', '2'),
    shortName: 'Tigers',
    tmNames: [
      'Auburn Tigers',
      "Auburn Tigers Men's Basketball", "Auburn Tigers Women's Basketball",
    ],
  },
  'Florida': {
    color: '#0021a5',
    logo: espnLogo('ncaa', '57'),
    shortName: 'Gators',
    tmNames: [
      'Florida Gators',
      "Florida Gators Men's Basketball", "Florida Gators Women's Basketball",
    ],
  },
  'Georgia': {
    color: '#ba0c2f',
    logo: espnLogo('ncaa', '61'),
    shortName: 'Bulldogs',
    tmNames: [
      'Georgia Bulldogs',
      "Georgia Bulldogs Men's Basketball", "Georgia Bulldogs Women's Basketball",
    ],
  },
  'Kentucky': {
    color: '#0033a0',
    logo: espnLogo('ncaa', '96'),
    shortName: 'Wildcats',
    tmNames: [
      'Kentucky Wildcats',
      "Kentucky Wildcats Men's Basketball", "Kentucky Wildcats Women's Basketball",
    ],
  },
  'LSU': {
    color: '#461d76',
    logo: espnLogo('ncaa', '99'),
    shortName: 'Tigers',
    tmNames: [
      'LSU Tigers',
      "LSU Tigers Men's Basketball", "LSU Tigers Women's Basketball",
    ],
  },
  'Mississippi State': {
    color: '#5d1725',
    logo: espnLogo('ncaa', '344'),
    shortName: 'Bulldogs',
    tmNames: [
      'Mississippi State Bulldogs',
      "Mississippi State Bulldogs Men's Basketball", "Mississippi State Bulldogs Women's Basketball",
    ],
  },
  'Missouri': {
    color: '#f1b82d',
    logo: espnLogo('ncaa', '142'),
    shortName: 'Tigers',
    tmNames: [
      'Missouri Tigers',
      "Missouri Tigers Men's Basketball", "Missouri Tigers Women's Basketball",
    ],
  },
  'Oklahoma': {
    color: '#990000',
    logo: espnLogo('ncaa', '201'),
    shortName: 'Sooners',
    tmNames: [
      'Oklahoma Sooners',
      "Oklahoma Sooners Men's Basketball", "Oklahoma Sooners Women's Basketball",
    ],
  },
  'Ole Miss': {
    color: '#13294b',
    logo: espnLogo('ncaa', '145'),
    shortName: 'Rebels',
    tmNames: [
      'Ole Miss Rebels',
      "Ole Miss Rebels Men's Basketball", "Ole Miss Rebels Women's Basketball",
    ],
  },
  'South Carolina': {
    color: '#73000a',
    logo: espnLogo('ncaa', '2579'),
    shortName: 'Gamecocks',
    tmNames: [
      'South Carolina Gamecocks',
      "South Carolina Gamecocks Men's Basketball", "South Carolina Gamecocks Women's Basketball", 'Univ of South Carolina Gamecocks',
    ],
  },
  'Tennessee': {
    color: '#ff8200',
    logo: espnLogo('ncaa', '2633'),
    shortName: 'Volunteers',
    tmNames: [
      'Tennessee Volunteers',
      "Tennessee Volunteers Men's Basketball", "Tennessee Volunteers Women's Basketball",
    ],
  },
  'Texas': {
    color: '#af5c37',
    logo: espnLogo('ncaa', '251'),
    shortName: 'Longhorns',
    tmNames: [
      'Texas Longhorns',
      "Texas Longhorns Men's Basketball", "Texas Longhorns Women's Basketball",
    ],
  },
  'Texas A&M': {
    color: '#500000',
    logo: espnLogo('ncaa', '245'),
    shortName: 'Aggies',
    tmNames: [
      'Texas A&M Aggies',
      "Texas A&M Aggies Men's Basketball", "Texas A&M Aggies Women's Basketball",
    ],
  },
  'Vanderbilt': {
    color: '#000000',
    logo: espnLogo('ncaa', '238'),
    shortName: 'Commodores',
    tmNames: [
      'Vanderbilt Commodores',
      "Vanderbilt Commodores Men's Basketball", "Vanderbilt Commodores Women's Basketball",
    ],
  },

  // --- Southern Conference ---
  'Chattanooga': {
    color: '#00386b',
    logo: espnLogo('ncaa', '236'),
    shortName: 'Mocs',
    tmNames: [
      'Chattanooga Mocs',
      "Chattanooga Mocs Men's Basketball", "Chattanooga Mocs Women's Basketball",
    ],
  },
  'ETSU': {
    color: '#002d61',
    logo: espnLogo('ncaa', '2193'),
    shortName: 'Buccaneers',
    tmNames: [
      'ETSU Buccaneers',
      "ETSU Buccaneers Men's Basketball", "ETSU Buccaneers Women's Basketball",
    ],
  },
  'Furman': {
    color: '#582c83',
    logo: espnLogo('ncaa', '231'),
    shortName: 'Paladins',
    tmNames: [
      'Furman Paladins',
      "Furman Paladins Men's Basketball", "Furman Paladins Women's Basketball",
    ],
  },
  'Mercer': {
    color: '#ff7f29',
    logo: espnLogo('ncaa', '2382'),
    shortName: 'Bears',
    tmNames: [
      'Mercer Bears',
      "Mercer Bears Men's Basketball", "Mercer Bears Women's Basketball",
    ],
  },
  'Samford': {
    color: '#005485',
    logo: espnLogo('ncaa', '2535'),
    shortName: 'Bulldogs',
    tmNames: [
      'Samford Bulldogs',
      "Samford Bulldogs Men's Basketball", "Samford Bulldogs Women's Basketball",
    ],
  },
  'Citadel': {
    color: '#7badd3',
    logo: espnLogo('ncaa', '2643'),
    shortName: 'Bulldogs',
    tmNames: [
      'The Citadel Bulldogs',
      "The Citadel Bulldogs Men's Basketball", "The Citadel Bulldogs Women's Basketball", 'Citadel Bulldogs',
    ],
  },
  'UNC Greensboro': {
    color: '#003559',
    logo: espnLogo('ncaa', '2430'),
    shortName: 'Spartans',
    tmNames: [
      'UNC Greensboro Spartans',
      "UNC Greensboro Spartans Men's Basketball", "UNC Greensboro Spartans Women's Basketball",
    ],
  },
  'VMI': {
    color: '#ae122a',
    logo: espnLogo('ncaa', '2678'),
    shortName: 'Keydets',
    tmNames: [
      'VMI Keydets',
      "VMI Keydets Men's Basketball", "VMI Keydets Women's Basketball",
    ],
  },
  'W Carolina': {
    color: '#492F91',
    logo: espnLogo('ncaa', '2717'),
    shortName: 'Catamounts',
    tmNames: [
      'W Carolina Catamounts',
      "W Carolina Catamounts Men's Basketball", "W Carolina Catamounts Women's Basketball",
    ],
  },
  'Wofford': {
    color: '#533B23',
    logo: espnLogo('ncaa', '2747'),
    shortName: 'Terriers',
    tmNames: [
      'Wofford Terriers',
      "Wofford Terriers Men's Basketball", "Wofford Terriers Women's Basketball",
    ],
  },

  // --- Southland Conference ---
  'E Texas A&M': {
    color: '#000000',
    logo: espnLogo('ncaa', '2837'),
    shortName: 'Lions',
    tmNames: [
      'E Texas A&M Lions',
      "E Texas A&M Lions Men's Basketball", "E Texas A&M Lions Women's Basketball",
    ],
  },
  'Hou Christian': {
    color: '#00539c',
    logo: espnLogo('ncaa', '2277'),
    shortName: 'Huskies',
    tmNames: [
      'Hou Christian Huskies',
      "Hou Christian Huskies Men's Basketball", "Hou Christian Huskies Women's Basketball",
    ],
  },
  'Incarnate Word': {
    color: '#000000',
    logo: espnLogo('ncaa', '2916'),
    shortName: 'Cardinals',
    tmNames: [
      'Incarnate Word Cardinals',
      "Incarnate Word Cardinals Men's Basketball", "Incarnate Word Cardinals Women's Basketball",
    ],
  },
  'Lamar': {
    color: '#000000',
    logo: espnLogo('ncaa', '2320'),
    shortName: 'Cardinals',
    tmNames: [
      'Lamar Cardinals',
      "Lamar Cardinals Men's Basketball", "Lamar Cardinals Women's Basketball",
    ],
  },
  'McNeese': {
    color: '#00529C',
    logo: espnLogo('ncaa', '2377'),
    shortName: 'Cowboys',
    tmNames: [
      'McNeese Cowboys',
      "McNeese Cowboys Men's Basketball", "McNeese Cowboys Women's Basketball",
    ],
  },
  'N\'Western State': {
    color: '#492F91',
    logo: espnLogo('ncaa', '2466'),
    shortName: 'Demons',
    tmNames: [
      'N\'Western State Demons',
      "N'Western State Demons Men's Basketball", "N'Western State Demons Women's Basketball",
    ],
  },
  'New Orleans': {
    color: '#005da6',
    logo: espnLogo('ncaa', '2443'),
    shortName: 'Privateers',
    tmNames: [
      'New Orleans Privateers',
      "New Orleans Privateers Men's Basketball", "New Orleans Privateers Women's Basketball",
    ],
  },
  'Nicholls': {
    color: '#C41230',
    logo: espnLogo('ncaa', '2447'),
    shortName: 'Colonels',
    tmNames: [
      'Nicholls Colonels',
      "Nicholls Colonels Men's Basketball", "Nicholls Colonels Women's Basketball",
    ],
  },
  'SE Louisiana': {
    color: '#215732',
    logo: espnLogo('ncaa', '2545'),
    shortName: 'Lions',
    tmNames: [
      'SE Louisiana Lions',
      "SE Louisiana Lions Men's Basketball", "SE Louisiana Lions Women's Basketball",
    ],
  },
  'SF Austin': {
    color: '#393996',
    logo: espnLogo('ncaa', '2617'),
    shortName: 'Lumberjacks',
    tmNames: [
      'SF Austin Lumberjacks',
      "SF Austin Lumberjacks Men's Basketball", "SF Austin Lumberjacks Women's Basketball",
    ],
  },
  'Texas A&M-CC': {
    color: '#0067c5',
    logo: espnLogo('ncaa', '357'),
    shortName: 'Islanders',
    tmNames: [
      'Texas A&M-CC Islanders',
      "Texas A&M-CC Islanders Men's Basketball", "Texas A&M-CC Islanders Women's Basketball",
    ],
  },
  'UT Rio Grande': {
    color: '#dc6000',
    logo: espnLogo('ncaa', '292'),
    shortName: 'Vaqueros',
    tmNames: [
      'UT Rio Grande Vaqueros',
      "UT Rio Grande Vaqueros Men's Basketball", "UT Rio Grande Vaqueros Women's Basketball",
    ],
  },

  // --- Southwestern Athletic Conference ---
  'Alabama A&M': {
    color: '#790000',
    logo: espnLogo('ncaa', '2010'),
    shortName: 'Bulldogs',
    tmNames: [
      'Alabama A&M Bulldogs',
      "Alabama A&M Bulldogs Men's Basketball", "Alabama A&M Bulldogs Women's Basketball",
    ],
  },
  'Alabama State': {
    color: '#e9a900',
    logo: espnLogo('ncaa', '2011'),
    shortName: 'Hornets',
    tmNames: [
      'Alabama State Hornets',
      "Alabama State Hornets Men's Basketball", "Alabama State Hornets Women's Basketball",
    ],
  },
  'Alcorn State': {
    color: '#4b0058',
    logo: espnLogo('ncaa', '2016'),
    shortName: 'Braves',
    tmNames: [
      'Alcorn State Braves',
      "Alcorn State Braves Men's Basketball", "Alcorn State Braves Women's Basketball",
    ],
  },
  'AR-Pine Bluff': {
    color: '#e0aa0f',
    logo: espnLogo('ncaa', '2029'),
    shortName: 'Golden Lions',
    tmNames: [
      'AR-Pine Bluff Golden Lions',
      "AR-Pine Bluff Golden Lions Men's Basketball", "AR-Pine Bluff Golden Lions Women's Basketball",
    ],
  },
  'Bethune': {
    color: '#7b1831',
    logo: espnLogo('ncaa', '2065'),
    shortName: 'Wildcats',
    tmNames: [
      'Bethune Wildcats',
      "Bethune Wildcats Men's Basketball", "Bethune Wildcats Women's Basketball",
    ],
  },
  'Florida A&M': {
    color: '#F89728',
    logo: espnLogo('ncaa', '50'),
    shortName: 'Rattlers',
    tmNames: [
      'Florida A&M Rattlers',
      "Florida A&M Rattlers Men's Basketball", "Florida A&M Rattlers Women's Basketball",
    ],
  },
  'Grambling': {
    color: '#ee8601',
    logo: espnLogo('ncaa', '2755'),
    shortName: 'Tigers',
    tmNames: [
      'Grambling Tigers',
      "Grambling Tigers Men's Basketball", "Grambling Tigers Women's Basketball",
    ],
  },
  'Jackson State': {
    color: '#123297',
    logo: espnLogo('ncaa', '2296'),
    shortName: 'Tigers',
    tmNames: [
      'Jackson State Tigers',
      "Jackson State Tigers Men's Basketball", "Jackson State Tigers Women's Basketball",
    ],
  },
  'Miss Valley State': {
    color: '#005328',
    logo: espnLogo('ncaa', '2400'),
    shortName: 'Delta Devils',
    tmNames: [
      'Miss Valley State Delta Devils',
      "Miss Valley State Delta Devils Men's Basketball", "Miss Valley State Delta Devils Women's Basketball",
    ],
  },
  'Prairie View': {
    color: '#582c83',
    logo: espnLogo('ncaa', '2504'),
    shortName: 'Panthers',
    tmNames: [
      'Prairie View Panthers',
      "Prairie View Panthers Men's Basketball", "Prairie View Panthers Women's Basketball",
    ],
  },
  'Southern': {
    color: '#004B97',
    logo: espnLogo('ncaa', '2582'),
    shortName: 'Jaguars',
    tmNames: [
      'Southern Jaguars',
      "Southern Jaguars Men's Basketball", "Southern Jaguars Women's Basketball",
    ],
  },
  'Texas Southern': {
    color: '#860038',
    logo: espnLogo('ncaa', '2640'),
    shortName: 'Tigers',
    tmNames: [
      'Texas Southern Tigers',
      "Texas Southern Tigers Men's Basketball", "Texas Southern Tigers Women's Basketball",
    ],
  },

  // --- Summit League ---
  'Denver': {
    color: '#98002e',
    logo: espnLogo('ncaa', '2172'),
    shortName: 'Pioneers',
    tmNames: [
      'Denver Pioneers',
      "Denver Pioneers Men's Basketball", "Denver Pioneers Women's Basketball",
    ],
  },
  'Kansas City': {
    color: '#004b87',
    logo: espnLogo('ncaa', '140'),
    shortName: 'Roos',
    tmNames: [
      'Kansas City Roos',
      "Kansas City Roos Men's Basketball", "Kansas City Roos Women's Basketball",
    ],
  },
  'N Dakota State': {
    color: '#01402A',
    logo: espnLogo('ncaa', '2449'),
    shortName: 'Bison',
    tmNames: [
      'N Dakota State Bison',
      "N Dakota State Bison Men's Basketball", "N Dakota State Bison Women's Basketball",
    ],
  },
  'North Dakota': {
    color: '#00A26B',
    logo: espnLogo('ncaa', '155'),
    shortName: 'Fighting Hawks',
    tmNames: [
      'North Dakota Fighting Hawks',
      "North Dakota Fighting Hawks Men's Basketball", "North Dakota Fighting Hawks Women's Basketball",
    ],
  },
  'Omaha': {
    color: '#e3193e',
    logo: espnLogo('ncaa', '2437'),
    shortName: 'Mavericks',
    tmNames: [
      'Omaha Mavericks',
      "Omaha Mavericks Men's Basketball", "Omaha Mavericks Women's Basketball",
    ],
  },
  'Oral Roberts': {
    color: '#002462',
    logo: espnLogo('ncaa', '198'),
    shortName: 'Golden Eagles',
    tmNames: [
      'Oral Roberts Golden Eagles',
      "Oral Roberts Golden Eagles Men's Basketball", "Oral Roberts Golden Eagles Women's Basketball",
    ],
  },
  'S Dakota State': {
    color: '#0033a0',
    logo: espnLogo('ncaa', '2571'),
    shortName: 'Jackrabbits',
    tmNames: [
      'S Dakota State Jackrabbits',
      "S Dakota State Jackrabbits Men's Basketball", "S Dakota State Jackrabbits Women's Basketball",
    ],
  },
  'South Dakota': {
    color: '#CD1241',
    logo: espnLogo('ncaa', '233'),
    shortName: 'Coyotes',
    tmNames: [
      'South Dakota Coyotes',
      "South Dakota Coyotes Men's Basketball", "South Dakota Coyotes Women's Basketball",
    ],
  },
  'St Thomas (MN)': {
    color: '#000000',
    logo: espnLogo('ncaa', '2900'),
    shortName: 'Tommies',
    tmNames: [
      'St Thomas (MN) Tommies',
      "St Thomas (MN) Tommies Men's Basketball", "St Thomas (MN) Tommies Women's Basketball",
    ],
  },

  // --- Sun Belt Conference ---
  'App State': {
    color: '#000000',
    logo: espnLogo('ncaa', '2026'),
    shortName: 'Mountaineers',
    tmNames: [
      'App State Mountaineers',
      "App State Mountaineers Men's Basketball", "App State Mountaineers Women's Basketball",
    ],
  },
  'Arkansas State': {
    color: '#cc092f',
    logo: espnLogo('ncaa', '2032'),
    shortName: 'Red Wolves',
    tmNames: [
      'Arkansas State Red Wolves',
      "Arkansas State Red Wolves Men's Basketball", "Arkansas State Red Wolves Women's Basketball",
    ],
  },
  'Coastal': {
    color: '#006f71',
    logo: espnLogo('ncaa', '324'),
    shortName: 'Chanticleers',
    tmNames: [
      'Coastal Chanticleers',
      "Coastal Chanticleers Men's Basketball", "Coastal Chanticleers Women's Basketball",
    ],
  },
  'Georgia Southern': {
    color: '#041e42',
    logo: espnLogo('ncaa', '290'),
    shortName: 'Eagles',
    tmNames: [
      'Georgia Southern Eagles',
      "Georgia Southern Eagles Men's Basketball", "Georgia Southern Eagles Women's Basketball",
    ],
  },
  'Georgia State': {
    color: '#0039a6',
    logo: espnLogo('ncaa', '2247'),
    shortName: 'Panthers',
    tmNames: [
      'Georgia State Panthers',
      "Georgia State Panthers Men's Basketball", "Georgia State Panthers Women's Basketball",
    ],
  },
  'James Madison': {
    color: '#450084',
    logo: espnLogo('ncaa', '256'),
    shortName: 'Dukes',
    tmNames: [
      'James Madison Dukes',
      "James Madison Dukes Men's Basketball", "James Madison Dukes Women's Basketball",
    ],
  },
  'Louisiana': {
    color: '#ce181e',
    logo: espnLogo('ncaa', '309'),
    shortName: 'Ragin\' Cajuns',
    tmNames: [
      'Louisiana Ragin\' Cajuns',
      "Louisiana Ragin' Cajuns Men's Basketball", "Louisiana Ragin' Cajuns Women's Basketball",
    ],
  },
  'Marshall': {
    color: '#00b140',
    logo: espnLogo('ncaa', '276'),
    shortName: 'Thundering Herd',
    tmNames: [
      'Marshall Thundering Herd',
      "Marshall Thundering Herd Men's Basketball", "Marshall Thundering Herd Women's Basketball",
    ],
  },
  'Old Dominion': {
    color: '#003768',
    logo: espnLogo('ncaa', '295'),
    shortName: 'Monarchs',
    tmNames: [
      'Old Dominion Monarchs',
      "Old Dominion Monarchs Men's Basketball", "Old Dominion Monarchs Women's Basketball",
    ],
  },
  'South Alabama': {
    color: '#00205b',
    logo: espnLogo('ncaa', '6'),
    shortName: 'Jaguars',
    tmNames: [
      'South Alabama Jaguars',
      "South Alabama Jaguars Men's Basketball", "South Alabama Jaguars Women's Basketball",
    ],
  },
  'Southern Miss': {
    color: '#ffc72c',
    logo: espnLogo('ncaa', '2572'),
    shortName: 'Golden Eagles',
    tmNames: [
      'Southern Miss Golden Eagles',
      "Southern Miss Golden Eagles Men's Basketball", "Southern Miss Golden Eagles Women's Basketball",
    ],
  },
  'Texas State': {
    color: '#501214',
    logo: espnLogo('ncaa', '326'),
    shortName: 'Bobcats',
    tmNames: [
      'Texas State Bobcats',
      "Texas State Bobcats Men's Basketball", "Texas State Bobcats Women's Basketball",
    ],
  },
  'Troy': {
    color: '#862633',
    logo: espnLogo('ncaa', '2653'),
    shortName: 'Trojans',
    tmNames: [
      'Troy Trojans',
      "Troy Trojans Men's Basketball", "Troy Trojans Women's Basketball",
    ],
  },
  'UL Monroe': {
    color: '#840029',
    logo: espnLogo('ncaa', '2433'),
    shortName: 'Warhawks',
    tmNames: [
      'UL Monroe Warhawks',
      "UL Monroe Warhawks Men's Basketball", "UL Monroe Warhawks Women's Basketball",
    ],
  },

  // --- West Coast Conference ---
  'Gonzaga': {
    color: '#041e42',
    logo: espnLogo('ncaa', '2250'),
    shortName: 'Bulldogs',
    tmNames: [
      'Gonzaga Bulldogs',
      "Gonzaga Bulldogs Men's Basketball", "Gonzaga Bulldogs Women's Basketball",
    ],
  },
  'LMU': {
    color: '#880029',
    logo: espnLogo('ncaa', '2351'),
    shortName: 'Lions',
    tmNames: [
      'LMU Lions',
      "LMU Lions Men's Basketball", "LMU Lions Women's Basketball",
    ],
  },
  'Pacific': {
    color: '#F47820',
    logo: espnLogo('ncaa', '279'),
    shortName: 'Tigers',
    tmNames: [
      'Pacific Tigers',
      "Pacific Tigers Men's Basketball", "Pacific Tigers Women's Basketball",
    ],
  },
  'Pepperdine': {
    color: '#003A72',
    logo: espnLogo('ncaa', '2492'),
    shortName: 'Waves',
    tmNames: [
      'Pepperdine Waves',
      "Pepperdine Waves Men's Basketball", "Pepperdine Waves Women's Basketball",
    ],
  },
  'Portland': {
    color: '#330072',
    logo: espnLogo('ncaa', '2501'),
    shortName: 'Pilots',
    tmNames: [
      'Portland Pilots',
      "Portland Pilots Men's Basketball", "Portland Pilots Women's Basketball",
    ],
  },
  'Saint Mary\'s': {
    color: '#d80024',
    logo: espnLogo('ncaa', '2608'),
    shortName: 'Gaels',
    tmNames: [
      'Saint Mary\'s Gaels',
      "Saint Mary's Gaels Men's Basketball", "Saint Mary's Gaels Women's Basketball",
    ],
  },
  'San Diego': {
    color: '#2f99d4',
    logo: espnLogo('ncaa', '301'),
    shortName: 'Toreros',
    tmNames: [
      'San Diego Toreros',
      "San Diego Toreros Men's Basketball", "San Diego Toreros Women's Basketball",
    ],
  },
  'San Francisco': {
    color: '#005a36',
    logo: espnLogo('ncaa', '2539'),
    shortName: 'Dons',
    tmNames: [
      'San Francisco Dons',
      "San Francisco Dons Men's Basketball", "San Francisco Dons Women's Basketball",
    ],
  },
  'Santa Clara': {
    color: '#690b0b',
    logo: espnLogo('ncaa', '2541'),
    shortName: 'Broncos',
    tmNames: [
      'Santa Clara Broncos',
      "Santa Clara Broncos Men's Basketball", "Santa Clara Broncos Women's Basketball",
    ],
  },

  // --- Western Athletic Conference ---
  'Abilene Chrstn': {
    color: '#592d82',
    logo: espnLogo('ncaa', '2000'),
    shortName: 'Wildcats',
    tmNames: [
      'Abilene Chrstn Wildcats',
      "Abilene Chrstn Wildcats Men's Basketball", "Abilene Chrstn Wildcats Women's Basketball",
    ],
  },
  'CA Baptist': {
    color: '#000080',
    logo: espnLogo('ncaa', '2856'),
    shortName: 'Lancers',
    tmNames: [
      'CA Baptist Lancers',
      "CA Baptist Lancers Men's Basketball", "CA Baptist Lancers Women's Basketball",
    ],
  },
  'Grand Canyon': {
    color: '#522398',
    logo: espnLogo('ncaa', '2253'),
    shortName: 'Lopes',
    tmNames: [
      'Grand Canyon Lopes',
      "Grand Canyon Lopes Men's Basketball", "Grand Canyon Lopes Women's Basketball",
    ],
  },
  'Seattle U': {
    color: '#BF2E1A',
    logo: espnLogo('ncaa', '2547'),
    shortName: 'Redhawks',
    tmNames: [
      'Seattle U Redhawks',
      "Seattle U Redhawks Men's Basketball", "Seattle U Redhawks Women's Basketball",
    ],
  },
  'Tarleton State': {
    color: '#000000',
    logo: espnLogo('ncaa', '2627'),
    shortName: 'Texans',
    tmNames: [
      'Tarleton State Texans',
      "Tarleton State Texans Men's Basketball", "Tarleton State Texans Women's Basketball",
    ],
  },
  'UT Arlington': {
    color: '#004b7c',
    logo: espnLogo('ncaa', '250'),
    shortName: 'Mavericks',
    tmNames: [
      'UT Arlington Mavericks',
      "UT Arlington Mavericks Men's Basketball", "UT Arlington Mavericks Women's Basketball",
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
for (const league of [NBA, WNBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AHL, AAA, PLL, LOVB_TEAMS]) {
  for (const [name, data] of Object.entries(league)) {
    const teamData = data?.canonicalKey ? data : { ...data, canonicalKey: name }
    TEAMS[name] = teamData
    if (teamData?.displayName) TEAMS[teamData.displayName] = teamData
    if (teamData?.aliases) for (const alias of teamData.aliases) TEAMS[alias] = teamData
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
  const data = TEAMS[name] || TEAMS[normalizeLookupName(name)] || null
  if (!data) return null
  const blobLogo = logoManifest[name]
    || logoManifest[normalizeLookupName(name)]
    || logoManifest[data.canonicalKey]
    || logoManifest[data.displayName]
  return blobLogo ? { ...data, logo: blobLogo } : data
}

export function getCanonicalTeamName(name) {
  if (!name) return ''
  const data = getTeamData(name)
  return data?.displayName || name
}

export { NCAA, NBA, NHL, MLB, NFL, MLS, NWSL, PWHL, IAL, ECHL, AAA, PLL, LOVB_TEAMS }

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
  WNBA: 'bg-orange-500',
  MLB: 'bg-blue-700',
  MLS: 'bg-red-800',
  IAL: 'bg-red-700',
  USL: 'bg-indigo-700',
  'Liga MX': 'bg-emerald-700',
  'World Cup': 'bg-cyan-700',
  International: 'bg-sky-700',
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
  PWHL: 'bg-purple-700',
  AHL: 'bg-slate-500',
  ECHL: 'bg-slate-500',
  'Minor League': 'bg-slate-500',
  PLL: 'bg-yellow-500',
  Misc: 'bg-gray-500',
}

export default TEAMS
