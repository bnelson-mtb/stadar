// NFL stadiums (30 buildings, 32 teams — MetLife and SoFi host two teams each).
// Shared-tenant buildings (MLS, college football) are listed here once with all
// uses in `bestFor`; mls.js and the college files skip them to avoid duplicates.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const NFL_VENUES = {
  "highmark-stadium-orchard-park-ny": {
    name: "Highmark Stadium",
    aliases: ["New Highmark Stadium", "Highmark Stadium (2026)"],
    city: "Orchard Park",
    state: "NY",
    summary: "Brand-new $2.1B home of the Bills (opened June 2026) — smallest NFL capacity at ~60,000, built for weather with a snow-melt system and wind-reducing design, and still surrounded by the NFL's most famous tailgating lots.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Bills Mafia intensity in a modern building",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Lot passes sell in advance and lots open hours early for tailgating; buy parking before game day.",
      rideshare: "Designated zones on the stadium campus; expect long post-game waits in a suburban location.",
      transit: "Minimal — Orchard Park is car country; NFTA runs limited game-day shuttles from downtown Buffalo.",
    },
    seating: {
      bestValueSections: ["Upper sideline", "Lower corners"],
      avoidIfPossible: ["Top rows on the open ends in cold months"],
      accessibilityNote: "New-build ADA seating throughout; check the seating map for accessible rows before buying."
    },
    foodAndDrink: {
      summary: "Big upgrade over the old stadium with local Buffalo vendors; wings and beef on weck are the move.",
      nearbyPregame: ["Tailgate lots (the real pregame)", "Abbott Road bars", "Big Tree Inn"],
    },
    fanTips: [
      "December games are a snow-gear commitment even with the wind-reduction design — dress in layers.",
      "First season in the new building (2026): expect evolving entry/parking logistics, so recheck gameday info each visit.",
      "Lot passes and traffic patterns changed from the old stadium across the street — don't rely on old habits."
    ],
    officialLinks: {
      website: "https://www.buffalobills.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "gillette-stadium-foxborough-ma": {
    name: "Gillette Stadium",
    aliases: ["Gillette"],
    city: "Foxborough",
    state: "MA",
    summary: "Suburban fortress between Boston and Providence with the Patriot Place shopping/dining complex attached — great pregame options, but plan around Route 1 traffic.",
    bestFor: ["NFL", "MLS", "college football"],
    atmosphere: {
      vibe: "Big-event suburban stadium; Revolution games are far mellower than Patriots Sundays",
      noiseLevel: "High (NFL) / Medium (MLS)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Huge on-site lots; prepaid parking recommended for NFL, plentiful and cheaper for Revolution games.",
      rideshare: "Dedicated lot; surge pricing after Patriots games is brutal.",
      transit: "MBTA Commuter Rail event trains from Boston South Station stop at Foxboro station — the stress-free option.",
    },
    seating: {
      bestValueSections: ["200-level sidelines", "Lower corners"],
      avoidIfPossible: ["Top upper-deck rows in winter wind"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard stadium fare inside; Patriot Place next door has dozens of real restaurants.",
      nearbyPregame: ["Patriot Place restaurants", "Six String Grill & Stage", "CBS Sporting Club"],
    },
    fanTips: [
      "For Revolution games you can often walk up and sit close for cheap — soccer is the value play here.",
      "The commuter rail event train saves you the worst post-game traffic in the NFL.",
      "Cell service dies with a full house; download tickets before you leave home."
    ],
    officialLinks: {
      website: "https://www.gillettestadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "metlife-stadium-east-rutherford-nj": {
    name: "MetLife Stadium",
    aliases: ["MetLife", "Meadowlands Stadium"],
    city: "East Rutherford",
    state: "NJ",
    summary: "82,500-seat shared home of the Giants and Jets in the Meadowlands — massive, easy to see from anywhere, and best reached by train rather than car.",
    bestFor: ["NFL", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Corporate-big NFL; crowd energy depends heavily on which team is home and how the season is going",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Sprawling lots with slow exits; prepaid passes strongly recommended.",
      rideshare: "Designated zone, but post-game surge and gridlock make it the worst option.",
      transit: "NJ Transit rail from Secaucus Junction straight to Meadowlands station — the correct answer from NYC.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Mezzanine sidelines"],
      avoidIfPossible: ["300-level end zone top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard big-stadium concessions; the Meadowlands area has little walkable pregame, so eat before you travel.",
      nearbyPregame: ["American Dream mall (adjacent)", "Hoboken bars before the train", "Manhattan pre-game then rail out"],
    },
    fanTips: [
      "Wind makes it feel 10 degrees colder than the forecast from November on.",
      "Giants and Jets crowds are different worlds — check whose home game it is before assuming the vibe.",
      "Leaving 5 minutes before the final whistle beats the rail-platform crush."
    ],
    officialLinks: {
      website: "https://www.metlifestadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "hard-rock-stadium-miami-gardens-fl": {
    name: "Hard Rock Stadium",
    aliases: ["Hard Rock"],
    city: "Miami Gardens",
    state: "FL",
    summary: "Canopy-covered bowl that shades most seats from the Florida sun — home of the Dolphins and Miami Hurricanes football, plus F1 and the Miami Open.",
    bestFor: ["NFL", "college football", "international soccer"],
    atmosphere: {
      vibe: "Laid-back South Florida crowd that heats up for rivalry games; Canes games bring their own energy",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy shades most seats)"
    },
    arrival: {
      parking: "Large on-site lots; prepay to avoid gameday markup. Miami Gardens is a drive from everything.",
      rideshare: "Workable but surge-heavy; pickup zones are a long walk.",
      transit: "Limited — no rail nearby; special event shuttles only for big games.",
    },
    seating: {
      bestValueSections: ["200-level sidelines", "Upper corners (shaded)"],
      avoidIfPossible: ["Low sideline rows for day games (sun exposure)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Above-average stadium food with Miami flavors (Cuban sandwiches, ceviche stands).",
      nearbyPregame: ["Tailgate lots", "Calder Casino area", "eat in Miami/Fort Lauderdale before driving"],
    },
    fanTips: [
      "September games: shade is worth more than proximity — check the seat's sun exposure before buying.",
      "Hurricanes games are usually far cheaper than Dolphins games in the same seats.",
      "Afternoon thunderstorms are routine in early fall; a delay plan beats a soaked one."
    ],
    officialLinks: {
      website: "https://www.hardrockstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "acrisure-stadium-pittsburgh-pa": {
    name: "Acrisure Stadium",
    aliases: ["Heinz Field"],
    city: "Pittsburgh",
    state: "PA",
    summary: "Riverfront home of the Steelers and Pitt football on the North Shore, with downtown skyline views over the open end and a walkable bar district next door.",
    bestFor: ["NFL", "college football"],
    atmosphere: {
      vibe: "Terrible Towels everywhere; one of the NFL's most tradition-heavy crowds",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "North Shore garages fill early; downtown garages + a 15-minute walk across the bridges is the local move.",
      rideshare: "Drop on the downtown side of the river and walk over to skip the North Shore snarl.",
      transit: "The T light rail is free between downtown and North Side stations on game days.",
    },
    seating: {
      bestValueSections: ["Upper north sideline", "Lower corners"],
      avoidIfPossible: ["Uncovered rows in late-season sleet"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Primanti Bros. inside is the mandatory Pittsburgh experience; North Shore bars surround the stadium.",
      nearbyPregame: ["Southern Tier Brewing", "Burgatory", "North Shore bar row on federal Street"],
    },
    fanTips: [
      "Pitt games are a cheap way to see the building with good sightlines and easy tickets.",
      "Steelers tickets rarely go below face — buy early rather than waiting for a drop.",
      "Late-season games are cold and wet off the rivers; waterproof beats warm."
    ],
    officialLinks: {
      website: "https://acrisurestadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mt-bank-stadium-baltimore-md": {
    name: "M&T Bank Stadium",
    aliases: ["M and T Bank Stadium", "Ravens Stadium"],
    city: "Baltimore",
    state: "MD",
    summary: "Loud, purple, and right next to Camden Yards downtown — one of the easier NFL stadiums to reach on foot from a city core.",
    bestFor: ["NFL", "international soccer"],
    atmosphere: {
      vibe: "Blue-collar intensity; the pregame 'Seven Nation Army' chant sets the tone",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Shared lots with Camden Yards plus downtown garages a 10-minute walk away.",
      rideshare: "Drop near Camden Yards and walk; post-game pickup is chaos on Russell Street.",
      transit: "Light Rail stops at Hamburg Street next to the stadium; MARC trains from DC to Camden station.",
    },
    seating: {
      bestValueSections: ["Lower corners", "200-level sidelines"],
      avoidIfPossible: ["Upper-deck top rows if you dislike heights"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Crab everything — the crab cake and crab dip fries are legitimately good stadium food.",
      nearbyPregame: ["Pickles Pub", "Federal Hill bars (10-min walk)", "Cross Street Market"],
    },
    fanTips: [
      "Federal Hill is the pregame neighborhood — better and cheaper than the stadium-adjacent options.",
      "Combined Orioles/Ravens event days overload the area; check both schedules.",
      "The stadium gets loud enough that lower-bowl seats near the tunnels are a genuine experience."
    ],
    officialLinks: {
      website: "https://www.baltimoreravens.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "paycor-stadium-cincinnati-oh": {
    name: "Paycor Stadium",
    aliases: ["Paul Brown Stadium"],
    city: "Cincinnati",
    state: "OH",
    summary: "Riverfront Bengals home on the Ohio River, a short walk from downtown and The Banks entertainment district.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Who Dey energy that spiked in the playoff era and stayed",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Central Riverfront Garage under The Banks plus downtown garages; prepay for big games.",
      rideshare: "Drop downtown and walk 5 minutes rather than fighting riverfront closures.",
      transit: "Cincinnati streetcar (free) runs through downtown to The Banks; TANK buses from Kentucky.",
    },
    seating: {
      bestValueSections: ["Lower corners", "200-level sidelines"],
      avoidIfPossible: ["Top upper-deck rows in December wind off the river"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Skyline chili and local brews inside; The Banks next door is wall-to-wall bars and restaurants.",
      nearbyPregame: ["The Banks district", "Moerlein Lager House", "Holy Grail Tavern"],
    },
    fanTips: [
      "The Banks fills 3+ hours before kickoff for big games — go early or eat across the river in Covington.",
      "Walk the Roebling Bridge from Kentucky for cheap parking and a great arrival view.",
      "River wind makes late-season games colder than the forecast says."
    ],
    officialLinks: {
      website: "https://www.bengals.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "huntington-bank-field-cleveland-oh": {
    name: "Huntington Bank Field",
    aliases: ["Cleveland Browns Stadium", "FirstEnergy Stadium"],
    city: "Cleveland",
    state: "OH",
    summary: "Lakefront Browns stadium on Lake Erie, walkable from downtown — bring wind protection from October on.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Dawg Pound loyalty through everything; the east end zone is its own culture",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Muni Lot (the famous tailgate) plus downtown garages a 10-15 minute walk away.",
      rideshare: "Drop in the Warehouse District and walk down; lakefront pickup is slow post-game.",
      transit: "RTA Rapid to Tower City then a 15-minute walk, or the Waterfront Line when running.",
    },
    seating: {
      bestValueSections: ["Lower sideline corners", "200-level"],
      avoidIfPossible: ["Upper deck facing the lake in November+"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Local vendors (Barrio tacos, local brews) beat the generic stands.",
      nearbyPregame: ["Warehouse District", "The Flats East Bank", "Muni Lot tailgate"],
    },
    fanTips: [
      "Lake-effect weather turns fast; a dry November forecast still means bringing a shell.",
      "The Flats East Bank is the best postgame area and against the exit traffic flow.",
      "A new enclosed Browns stadium in Brook Park is planned (~2029) — this building's NFL days are numbered."
    ],
    officialLinks: {
      website: "https://www.clevelandbrowns.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "everbank-stadium-jacksonville-fl": {
    name: "EverBank Stadium",
    aliases: ["TIAA Bank Field", "EverBank Field", "Jacksonville Municipal Stadium"],
    city: "Jacksonville",
    state: "FL",
    summary: "Jaguars home mid-transformation: the 'Stadium of the Future' renovation caps 2026 capacity around 42,500, and the team plays 2027 in Orlando before the rebuilt stadium opens in 2028.",
    bestFor: ["NFL", "college football"],
    atmosphere: {
      vibe: "Sun-soaked and social — famous for its pools and party decks",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Sports-complex lots east of downtown; construction is reshaping lot access, so recheck each visit.",
      rideshare: "Reasonable — Jacksonville traffic is mild by NFL standards.",
      transit: "Limited; gameday shuttles from downtown when offered.",
    },
    seating: {
      bestValueSections: ["West sideline", "Covered club rows"],
      avoidIfPossible: ["East-side lower rows for 1pm kickoffs (full sun)"],
      accessibilityNote: "Accessible seating on all levels; renovation may relocate sections — verify at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare plus Florida seafood stands; the pools/cabana areas are their own ticket class.",
      nearbyPregame: ["Intuition Ale Works", "Manifest Distilling", "Doro District"],
    },
    fanTips: [
      "2026 is the last Jacksonville season before a year in Orlando (Camping World Stadium, 2027) — reduced ~42,500 capacity means tickets are tighter than usual.",
      "September heat is brutal; night games are a different (better) experience.",
      "The Florida-Georgia college game here is a separate phenomenon with its own logistics."
    ],
    officialLinks: {
      website: "https://www.jaguars.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nrg-stadium-houston-tx": {
    name: "NRG Stadium",
    aliases: ["Reliant Stadium"],
    city: "Houston",
    state: "TX",
    summary: "Retractable-roof Texans home in the NRG Park complex south of downtown — air-conditioned comfort with light-rail access.",
    bestFor: ["NFL", "rodeo", "international soccer"],
    atmosphere: {
      vibe: "Comfortable big-event stadium; louder with the roof closed",
      noiseLevel: "High (roof closed)",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Massive NRG Park lots; prepaid passes save real money and time.",
      rideshare: "Designated lots, long post-game waits.",
      transit: "METRORail Red Line's Stadium Park/Astrodome station is a short walk — the easy option from downtown or the Medical Center.",
    },
    seating: {
      bestValueSections: ["300-level sidelines", "Lower corners"],
      avoidIfPossible: ["600-level end zones if you want any detail"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Texas-sized concessions — brisket and tacos are the right calls.",
      nearbyPregame: ["Eighteen36 (Midtown, rail-adjacent)", "Medical Center-area spots", "downtown before the train"],
    },
    fanTips: [
      "The roof is usually closed and the AC on — you don't need to dress for Houston weather inside.",
      "In rodeo season (Feb-Mar) the entire complex reconfigures; other events there are affected.",
      "Prepaid parking is on the far side of enormous lots — note your lot color, seriously."
    ],
    officialLinks: {
      website: "https://www.nrgpark.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lucas-oil-stadium-indianapolis-in": {
    name: "Lucas Oil Stadium",
    aliases: ["Lucas Oil"],
    city: "Indianapolis",
    state: "IN",
    summary: "Retractable-roof Colts home right in downtown Indy — arguably the most walkable NFL stadium in the country, connected to the convention-center skywalk system.",
    bestFor: ["NFL", "college basketball (Final Four)", "college football"],
    atmosphere: {
      vibe: "Polished and welcoming; Indy does big events better than almost anyone",
      noiseLevel: "High (roof/window closed)",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Downtown garages everywhere within a 10-minute walk; South lot for tailgating.",
      rideshare: "Easy by NFL standards — downtown grid disperses traffic.",
      transit: "Most downtown hotels are walkable; IndyGo Red Line stops nearby.",
    },
    seating: {
      bestValueSections: ["200-level corners", "Terrace sidelines"],
      avoidIfPossible: ["600-level top rows behind the end zone"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid concessions, but downtown Indy's restaurant scene 5 minutes away is the real pregame.",
      nearbyPregame: ["Georgia Street", "Kilroy's", "Sun King Brewery taproom"],
    },
    fanTips: [
      "The retractable window with the skyline view is open more often than the roof — north-facing seats get it.",
      "Big 10 championship and Final Four weeks transform downtown; hotel prices triple.",
      "Colts tickets are among the NFL's more affordable — sideline seats are gettable."
    ],
    officialLinks: {
      website: "https://www.lucasoilstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nissan-stadium-nashville-tn": {
    name: "Nissan Stadium",
    aliases: ["The Coliseum", "LP Field"],
    city: "Nashville",
    state: "TN",
    summary: "Titans stadium across the Cumberland River from Broadway — a walk over the pedestrian bridge from downtown honky-tonks. The new enclosed stadium next door opens in 2027, making 2026 the old building's final season.",
    bestFor: ["NFL", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Nashville party energy spills across the river on gamedays",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Stadium lots east of the river; downtown garages + the pedestrian bridge is the smarter play.",
      rideshare: "Drop downtown and walk the John Seigenthaler bridge — traffic on the stadium side locks up.",
      transit: "WeGo buses downtown; most visitors just walk from Broadway.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper west (skyline view)"],
      avoidIfPossible: ["East upper deck for afternoon sun in September"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Nashville hot chicken inside; but Broadway across the bridge is the actual food-and-drink plan.",
      nearbyPregame: ["Broadway honky-tonks", "The Gulch", "East Nashville spots"],
    },
    fanTips: [
      "2026 is the final season here — the new enclosed Nissan Stadium opens next door in 2027.",
      "Skyline-facing seats (west) are worth a few extra dollars at sunset kickoffs.",
      "Postgame Broadway is a zoo after wins; head to East Nashville instead if you want a table."
    ],
    officialLinks: {
      website: "https://www.tennesseetitans.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "arrowhead-stadium-kansas-city-mo": {
    name: "GEHA Field at Arrowhead Stadium",
    aliases: ["Arrowhead Stadium", "Arrowhead"],
    city: "Kansas City",
    state: "MO",
    summary: "The loudest stadium in the NFL (Guinness-certified) and home of its best BBQ tailgating scene, in the Truman Sports Complex it shares with Kauffman Stadium.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Sea of red, deafening on third downs — a bucket-list NFL crowd",
      noiseLevel: "Very high (record-setting)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Sports-complex lots only — there is no walkable neighborhood; buy parking in advance, always.",
      rideshare: "Designated lot with long post-game waits; agree on a distant pickup point to escape faster.",
      transit: "Minimal; a car (or bus charter) is essentially required.",
    },
    seating: {
      bestValueSections: ["Upper sideline", "Lower corners"],
      avoidIfPossible: ["Top rows in January (wind chill)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Legit KC BBQ inside, but the parking-lot smokers outclass every concession stand.",
      nearbyPregame: ["Your own tailgate", "Big Charlie's Saloon crowd... just kidding — it's all in the lots"],
    },
    fanTips: [
      "January playoff games here are legendarily cold — this is full arctic-kit territory.",
      "Chiefs-Raiders and playoff parking sells out days ahead.",
      "If Royals and Chiefs events overlap in the complex, traffic doubles — check both calendars."
    ],
    officialLinks: {
      website: "https://www.chiefs.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "empower-field-at-mile-high-denver-co": {
    name: "Empower Field at Mile High",
    aliases: ["Mile High Stadium", "Broncos Stadium at Mile High", "Sports Authority Field"],
    city: "Denver",
    state: "CO",
    summary: "Broncos home just west of downtown Denver with Rocky Mountain views from the upper west side and light-rail service to the gates.",
    bestFor: ["NFL", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Orange-clad and loud; the 'IN-COM-PLETE' chant and Mile High Magic are real",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site lots need prepaid passes; nearby private lots line Federal Blvd.",
      rideshare: "Doable; drop across I-25 and walk the pedestrian bridge to save 20 minutes.",
      transit: "RTD light rail (C/E/W lines) serves Empower Field at Mile High station directly.",
    },
    seating: {
      bestValueSections: ["Upper east (mountain views)", "Lower corners"],
      avoidIfPossible: ["Top west rows in afternoon sun (you face it)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Green chile on everything is the local move; solid craft-beer selection.",
      nearbyPregame: ["Highland neighborhood bars", "Jefferson Park", "LoDo before the train"],
    },
    fanTips: [
      "The altitude is real for visitors — hydrate more than usual, especially with beer involved.",
      "October night games swing 30+ degrees from kickoff to final whistle; layer up.",
      "Sunset from the east upper deck over the Rockies is a legitimately great cheap-seat bonus."
    ],
    officialLinks: {
      website: "https://www.empowerfieldatmilehigh.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "allegiant-stadium-las-vegas-nv": {
    name: "Allegiant Stadium",
    aliases: ["The Death Star"],
    city: "Las Vegas",
    state: "NV",
    summary: "The black-domed Raiders home just off the Strip — climate-controlled, visiting-fan-heavy, and walkable from Mandalay Bay via a pedestrian bridge.",
    bestFor: ["NFL", "concerts", "college football"],
    atmosphere: {
      vibe: "Half tourist destination, half Raider Nation; visiting fans often take over",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor (dome)"
    },
    arrival: {
      parking: "On-site parking is limited and pricey; most visitors don't drive.",
      rideshare: "Heavy surge post-game; walking back to the Strip first cuts the fare.",
      transit: "Walk from Mandalay Bay/Luxor via the Hacienda Ave bridge (~15-20 min from the Strip).",
    },
    seating: {
      bestValueSections: ["300-level sidelines", "Lower corners"],
      avoidIfPossible: ["Back rows of 100-level end zone under overhangs (video board cut off)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Vegas-priced everything; eat on the Strip first and treat concessions as a top-up.",
      nearbyPregame: ["Mandalay Bay", "Luxor", "Town Square (rideshare)"],
    },
    fanTips: [
      "Raiders games are effectively neutral-site — expect 40%+ visiting fans for big fanbases.",
      "This is one of the NFL's most expensive tickets; midweek-listed resale often dips closer to kickoff.",
      "The AC is aggressive — a light layer indoors is not crazy in October."
    ],
    officialLinks: {
      website: "https://www.allegiantstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "sofi-stadium-inglewood-ca": {
    name: "SoFi Stadium",
    aliases: ["SoFi"],
    city: "Inglewood",
    state: "CA",
    summary: "The NFL's $5B showpiece — indoor-outdoor canopy design, the double-sided Infinity Screen, and home to both the Rams and Chargers in Inglewood.",
    bestFor: ["NFL", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Spectacular building, LA-casual crowd; energy varies wildly by opponent",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Open-air with canopy (feels indoor)"
    },
    arrival: {
      parking: "Zones sell in advance at LA prices; offsite lots (Forum, Hollywood Park casino) + walk are cheaper.",
      rideshare: "Designated zones a long walk from gates; post-game surge is severe.",
      transit: "K Line to Downtown Inglewood + shuttle/walk; improving but still not door-to-door.",
    },
    seating: {
      bestValueSections: ["300-level corners", "500-level sidelines (still good views)"],
      avoidIfPossible: ["100-level end zone if you want to use the video board comfortably (neck angle)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "LA-quality food halls with real local vendors — among the NFL's best (and priciest) concessions.",
      nearbyPregame: ["Hollywood Park complex", "Three Weavers Brewing", "downtown Inglewood spots"],
    },
    fanTips: [
      "Check which team is 'home' — Rams and Chargers games have totally different crowds and prices.",
      "Chargers games are routinely the cheaper way to experience the building.",
      "The canopy keeps sun off but it's open-air — evenings get cool, bring a layer."
    ],
    officialLinks: {
      website: "https://www.sofistadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "levis-stadium-santa-clara-ca": {
    name: "Levi's Stadium",
    aliases: ["Levis Stadium"],
    city: "Santa Clara",
    state: "CA",
    summary: "Tech-forward 49ers home in Santa Clara (45 miles from San Francisco) — sunny, open, and best reached by VTA light rail or Caltrain.",
    bestFor: ["NFL", "international soccer", "college football"],
    atmosphere: {
      vibe: "Corporate-mellow most games, faithful-loud for rivals and playoffs",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Lots spread across office parks; prepaid required for close-in.",
      rideshare: "Works, but the venue is transit-friendly enough to skip it.",
      transit: "VTA light rail stops at Great America station next door; Caltrain to Mountain View + VTA transfer from SF.",
    },
    seating: {
      bestValueSections: ["West sideline uppers", "Lower corners"],
      avoidIfPossible: ["East-side lower bowl for 1:25pm kickoffs (direct sun for hours)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Bay Area quality with vegetarian depth unusual for the NFL; long lines at marquee stands.",
      nearbyPregame: ["Great America area", "Santana Row (15 min)", "San Pedro Square (San Jose)"],
    },
    fanTips: [
      "Sunscreen is a genuine requirement on the east side — it's the stadium's defining flaw.",
      "VTA post-game trains queue long; walking one station up the line beats the crush.",
      "October night games flip cold fast once the sun drops."
    ],
    officialLinks: {
      website: "https://www.levisstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lumen-field-seattle-wa": {
    name: "Lumen Field",
    aliases: ["CenturyLink Field", "Qwest Field", "Seahawks Stadium"],
    city: "Seattle",
    state: "WA",
    summary: "The 12s' cauldron just south of Pioneer Square — engineered-loud roof overhangs, home to the Seahawks and Sounders, and fully walkable from downtown Seattle.",
    bestFor: ["NFL", "MLS", "NWSL", "concerts"],
    atmosphere: {
      vibe: "Among the loudest in sports for NFL; Sounders matches bring marching supporters and constant song",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (roof covers ~70% of seats)"
    },
    arrival: {
      parking: "Garages north of the stadium and in SODO; expensive on NFL days, fine for MLS.",
      rideshare: "Drop in Pioneer Square and walk 5 minutes.",
      transit: "Link light rail to Stadium or International District stations; Sounder trains run for most games.",
    },
    seating: {
      bestValueSections: ["300-level sidelines", "Hawks Nest (north end bleachers)"],
      avoidIfPossible: ["Uncovered south end rows in fall rain"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Seattle-quality options (Din Tai Fung has appeared here) and strong local beer.",
      nearbyPregame: ["Pioneer Square bars", "Occidental Ave 'March to the Match' (Sounders)", "SODO breweries"],
    },
    fanTips: [
      "Sounders games are a cheap way into a genuinely great atmosphere — the supporters' end is worth sitting near.",
      "For NFL, the noise is a feature: sit low near the north end to feel the false starts happen.",
      "Mariners next door at T-Mobile Park can double-book the area — check both schedules."
    ],
    officialLinks: {
      website: "https://www.lumenfield.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "state-farm-stadium-glendale-az": {
    name: "State Farm Stadium",
    aliases: ["University of Phoenix Stadium"],
    city: "Glendale",
    state: "AZ",
    summary: "Retractable-roof (and roll-out natural grass field) Cardinals home in Glendale's Westgate district, 20 minutes west of downtown Phoenix.",
    bestFor: ["NFL", "college football", "international soccer"],
    atmosphere: {
      vibe: "Comfortable big-event venue; Cardinals crowds run mellow outside rivalry games",
      noiseLevel: "Medium-high (roof closed)",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Big Westgate-area lots; prepaid recommended for NFL and bowl games.",
      rideshare: "Standard drop zones; Westgate walkability softens the wait.",
      transit: "Essentially none — Glendale requires a car or rideshare.",
    },
    seating: {
      bestValueSections: ["200-level corners", "Upper sidelines"],
      avoidIfPossible: ["Top upper rows behind end zones"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard stadium fare with Sonoran touches; Westgate has the real restaurants.",
      nearbyPregame: ["Westgate Entertainment District", "Desert Diamond Casino", "Salt & Lime area spots"],
    },
    fanTips: [
      "The roof stays closed in early-season heat — inside is 72°F even when it's 105°F out.",
      "Cardinals tickets are among the NFL's cheapest; the building often hosts marquee neutral-site games too.",
      "Downtown Phoenix is 30-45 min in traffic; don't cut arrival time close."
    ],
    officialLinks: {
      website: "https://www.statefarmstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "att-stadium-arlington-tx": {
    name: "AT&T Stadium",
    aliases: ["ATT Stadium", "Cowboys Stadium", "Jerry World"],
    city: "Arlington",
    state: "TX",
    summary: "Jerry World: the Cowboys' colossal retractable-roof dome in Arlington with the iconic center-hung video board — a tourist attraction in its own right.",
    bestFor: ["NFL", "college football", "boxing", "international soccer"],
    atmosphere: {
      vibe: "Grand spectacle; corporate lower bowl, rowdier up top and in standing 'Party Pass' areas",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Vast numbered lots shared with the Rangers' Globe Life Field; prepay and note the lot — the walk can be a mile.",
      rideshare: "Designated zones with long post-game waits.",
      transit: "Arlington has no rail; Trinity Metro TEXRail + rideshare, or drive.",
    },
    seating: {
      bestValueSections: ["400-level sidelines", "Hall of Fame level corners"],
      avoidIfPossible: ["Standing-room if you want to actually watch the field (you'll watch the board)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Everything is big — brisket nachos are the signature; Texas Live! next door for real meals.",
      nearbyPregame: ["Texas Live!", "Globe Life Field plaza", "Division Brewing (Arlington)"],
    },
    fanTips: [
      "Cowboys games draw heavy neutral/visitor crowds — 'home field' is relative here.",
      "Big college games (Cowboys Classic, CFP) are often cheaper entries to the same building.",
      "Rangers home dates next door create mega-traffic — check the MLB schedule too."
    ],
    officialLinks: {
      website: "https://attstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lincoln-financial-field-philadelphia-pa": {
    name: "Lincoln Financial Field",
    aliases: ["The Linc"],
    city: "Philadelphia",
    state: "PA",
    summary: "The Linc: Eagles home in the South Philly sports complex, subway-accessible, and carrying one of the NFL's most feared home-crowd reputations.",
    bestFor: ["NFL", "college football", "international soccer"],
    atmosphere: {
      vibe: "Intense, hostile to visitors, and proud of it — wear neutral colors if unsure",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Sports-complex lots shared with the arena and ballpark; tailgating is serious here.",
      rideshare: "Designated zones; the subway is faster after games.",
      transit: "SEPTA Broad Street Line to NRG station — direct, cheap, and the local default.",
    },
    seating: {
      bestValueSections: ["Lower corners", "200-level sidelines"],
      avoidIfPossible: ["Top upper rows in December+"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cheesesteaks inside are fine, but Chickie's & Pete's crab fries are the stadium signature.",
      nearbyPregame: ["Xfinity Live! complex", "Chickie's & Pete's (Packer Ave)", "your own lot tailgate"],
    },
    fanTips: [
      "Visiting-team gear in the 700-level equivalent sections is a choice — sit lower or dress neutral.",
      "If the Phillies/Sixers/Flyers also play that day, complex traffic multiplies — check all four schedules.",
      "Temple football home games here are a cheap way to see the building."
    ],
    officialLinks: {
      website: "https://www.lincolnfinancialfield.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "northwest-stadium-landover-md": {
    name: "Northwest Stadium",
    aliases: ["FedExField", "FedEx Field", "Commanders Field"],
    city: "Landover",
    state: "MD",
    summary: "Commanders home in Landover, MD — an aging building the team plans to leave for a new DC stadium at the RFK site (~2030), but Metro-accessible in the meantime.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Rebuilding fanbase energy; big games bring heavy visiting-fan presence",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site lots with infamous exit queues; prepaid required close-in.",
      rideshare: "Long waits post-game; walk away from the stadium before requesting.",
      transit: "Metro Blue/Silver Line to Morgan Boulevard, then a ~15-minute walk.",
    },
    seating: {
      bestValueSections: ["Lower corners", "200-level sidelines"],
      avoidIfPossible: ["Upper-deck end zones (distant views)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard concessions; the area around the stadium offers little, so eat in DC first.",
      nearbyPregame: ["DC neighborhoods pre-Metro (H Street, Capitol Hill)", "National Harbor (drive)"],
    },
    fanTips: [
      "Tickets often sell below face on resale for non-rival games — good spontaneous-outing value.",
      "The new RFK-site stadium (~2030) means this building is on borrowed time; see it for the history, not the amenities.",
      "For big visiting fanbases (Dallas, Philly), expect a near-neutral crowd."
    ],
    officialLinks: {
      website: "https://www.commanders.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "soldier-field-chicago-il": {
    name: "Soldier Field",
    aliases: ["Soldier Field Stadium"],
    city: "Chicago",
    state: "IL",
    summary: "The NFL's oldest stadium (1924, modernized 2003) on Chicago's lakefront museum campus — home of the Bears and Chicago Fire FC, with skyline views and lake wind in equal measure.",
    bestFor: ["NFL", "MLS", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Old-school NFL tradition; Fire matches are relaxed and family-heavy by comparison",
      noiseLevel: "High (NFL)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Museum-campus garages (Waldron, North Garage) plus Soldier Field lots; prepay for NFL.",
      rideshare: "Drop near the museum campus and walk; Lake Shore Drive closures snarl pickups.",
      transit: "CTA Roosevelt station (Red/Orange/Green) + 15-minute walk or the #146 bus; Metra Electric to Museum Campus.",
    },
    seating: {
      bestValueSections: ["Upper east (skyline)", "Lower corners"],
      avoidIfPossible: ["North end zone uppers in November+ (lake wind funnel)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Chicago staples inside (Italian beef, deep-dish slices); South Loop bars pregame.",
      nearbyPregame: ["South Loop (Kasey's, Flo & Santos)", "Motor Row breweries", "museum campus picnic"],
    },
    fanTips: [
      "Lake wind is the story from November on — the forecast temp understates it badly.",
      "Fire FC games are one of the cheapest big-stadium tickets in Chicago (Fire plan a move to a new South Loop stadium ~2028).",
      "The Bears' proposed move (Arlington Heights/lakefront saga) is unresolved — enjoy the history while it's here."
    ],
    officialLinks: {
      website: "https://www.soldierfield.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ford-field-detroit-mi": {
    name: "Ford Field",
    aliases: ["Ford Field Stadium"],
    city: "Detroit",
    state: "MI",
    summary: "Indoor Lions home in downtown Detroit, built into a former Hudson's warehouse — loud, warm in winter, and steps from Comerica Park and the Fox Theatre district.",
    bestFor: ["NFL", "college basketball (tournaments)", "concerts"],
    atmosphere: {
      vibe: "Reborn-fanbase loud — the post-2023 Lions crowd is a top-5 NFL atmosphere",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor (dome)"
    },
    arrival: {
      parking: "Downtown garages everywhere within a 10-minute walk; prepay on big weekends.",
      rideshare: "Easy by NFL standards; drop in the Fox district.",
      transit: "QLine streetcar down Woodward and the Detroit People Mover both stop nearby.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Lower corners"],
      avoidIfPossible: ["Corner seats tucked under overhangs (board sightlines)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Detroit-style pizza and coney dogs inside; Greektown and the Columbia Street bars are steps away.",
      nearbyPregame: ["Hockeytown Cafe", "Greektown", "Eastern Market (Sunday tailgates)"],
    },
    fanTips: [
      "Thanksgiving in Detroit is a legitimate bucket-list NFL tradition.",
      "Lions tickets since 2023 are no longer cheap — buy earlier than you think.",
      "Eastern Market tailgating before Sunday games is the local secret worth doing once."
    ],
    officialLinks: {
      website: "https://www.fordfield.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lambeau-field-green-bay-wi": {
    name: "Lambeau Field",
    aliases: ["Lambeau"],
    city: "Green Bay",
    state: "WI",
    summary: "The frozen tundra — pro football's most historic venue, surrounded by residential streets where locals rent their lawns for parking. A pilgrimage more than a game.",
    bestFor: ["NFL"],
    atmosphere: {
      vibe: "Small-town reverence meets big-league noise; the Lambeau Leap end zones are sacred ground",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Official lots are limited — parking on nearby residents' lawns ($20-60 cash) is the authentic move.",
      rideshare: "Exists but thin — Green Bay is small; plan pickup logistics ahead.",
      transit: "Minimal city bus service; most visitors drive from Milwaukee/Appleton hotels.",
    },
    seating: {
      bestValueSections: ["End zone benches (the classic view)", "Upper sideline"],
      avoidIfPossible: ["Nothing, honestly — but know the benches are backless"],
      accessibilityNote: "Accessible seating available; the old bowl means checking rows carefully before buying."
    },
    foodAndDrink: {
      summary: "Brats, cheese curds, and Usinger's everything; the atrium restaurants operate year-round.",
      nearbyPregame: ["The Bar on Holmgren Way", "Stadium View", "Kroll's West (butter burgers)"],
    },
    fanTips: [
      "December games are genuinely dangerous cold — boot-blankets and hand warmers are standard equipment, not overkill.",
      "Do the stadium tour and Packers Hall of Fame if you're traveling for it — it completes the pilgrimage.",
      "Tickets are all season-ticket held; resale is the only market and rivals cost a fortune."
    ],
    officialLinks: {
      website: "https://www.packers.com/lambeau-field/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "us-bank-stadium-minneapolis-mn": {
    name: "U.S. Bank Stadium",
    aliases: ["US Bank Stadium", "USB Stadium"],
    city: "Minneapolis",
    state: "MN",
    summary: "The Vikings' glass-and-angles longship in downtown Minneapolis — fixed translucent roof, natural light, and light rail to the door.",
    bestFor: ["NFL", "college basketball (Final Four)", "concerts"],
    atmosphere: {
      vibe: "Skol chants echo hard off the roof — one of the loudest indoor buildings in the league",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor (fixed translucent roof)"
    },
    arrival: {
      parking: "Downtown ramps connected by skyway; prepay and use the skyways in winter.",
      rideshare: "Fine, but light rail is right there.",
      transit: "Metro Blue/Green lines stop at U.S. Bank Stadium station directly outside.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Lower corners"],
      avoidIfPossible: ["Very top rows if steep stairs bother you"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Juicy lucys and walleye items localize the menu; Downtown East options keep growing.",
      nearbyPregame: ["Day Block Brewing", "Kieran's/The Local downtown", "East Town bars"],
    },
    fanTips: [
      "The translucent roof means it feels outdoor-bright without weather — unique in the NFL.",
      "Vikings games sell well but non-rival resale is reasonable a week out.",
      "The skyway system is a cheat code for winter events — learn your route in advance."
    ],
    officialLinks: {
      website: "https://www.usbankstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mercedes-benz-stadium-atlanta-ga": {
    name: "Mercedes-Benz Stadium",
    aliases: ["Mercedes Benz Stadium", "MBS"],
    city: "Atlanta",
    state: "GA",
    summary: "The pinwheel-roof marvel downtown — home of the Falcons and Atlanta United, famous for fan-friendly concession prices and the halo video board.",
    bestFor: ["NFL", "MLS", "college football", "international soccer"],
    atmosphere: {
      vibe: "Atlanta United matches are the loudest MLS environment in the country; Falcons games are solid if streaky",
      noiseLevel: "Very high (MLS) / High (NFL)",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (usually closed)"
    },
    arrival: {
      parking: "Downtown decks around the Gulch; prepay via the official app.",
      rideshare: "Designated zones; MARTA is genuinely better here.",
      transit: "MARTA to Vine City or GWCC/CNN Center stations — both practically at the doors.",
    },
    seating: {
      bestValueSections: ["300-level sidelines", "Lower corners"],
      avoidIfPossible: ["100-level under-overhang back rows (halo partially cut off)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Famous 'fan-first pricing' — $2 hot dogs and $5 beers make it the cheapest eating in pro sports.",
      nearbyPregame: ["Marietta Street bars", "The Gulch/Centennial Yard", "West Midtown breweries"],
    },
    fanTips: [
      "Atlanta United's supporters' section (the 'Spike') is worth experiencing from nearby at least once.",
      "Concessions are so cheap that eating inside is actually the budget move — rare in this league.",
      "Big SEC/CFP games here sell out fast and hotel prices spike — book everything early."
    ],
    officialLinks: {
      website: "https://mercedesbenzstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bank-of-america-stadium-charlotte-nc": {
    name: "Bank of America Stadium",
    aliases: ["BofA Stadium", "Ericsson Stadium"],
    city: "Charlotte",
    state: "NC",
    summary: "Uptown Charlotte home of the Panthers and Charlotte FC — one of the few NFL stadiums truly inside a city core, walkable from most of Uptown.",
    bestFor: ["NFL", "MLS", "college football", "international soccer"],
    atmosphere: {
      vibe: "Panthers Sundays are solid; Charlotte FC has built one of MLS's biggest crowds",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Uptown decks in every direction; prices drop 2-3 blocks out.",
      rideshare: "Easy drops on the Uptown grid.",
      transit: "LYNX Blue Line to Brooklyn Village or 3rd Street stations, then a short walk.",
    },
    seating: {
      bestValueSections: ["Lower corners", "500-level midfield"],
      avoidIfPossible: ["Upper end zones for soccer (far from the supporters' energy)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Carolina BBQ and local brews inside; all of Uptown's restaurants within a 10-minute walk.",
      nearbyPregame: ["Romare Bearden Park (pregame gathering)", "South End breweries (Blue Line)", "Uptown bar row"],
    },
    fanTips: [
      "Charlotte FC matches regularly top 35k+ and are the cheaper ticket into the building.",
      "South End's brewery district one train stop away is the best pregame in the city.",
      "Summer evening kickoffs still start hot and humid — hydrate before you sit."
    ],
    officialLinks: {
      website: "https://www.panthers.com/stadium/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "caesars-superdome-new-orleans-la": {
    name: "Caesars Superdome",
    aliases: ["Superdome", "Mercedes-Benz Superdome", "Louisiana Superdome"],
    city: "New Orleans",
    state: "LA",
    summary: "The iconic dome in the New Orleans CBD — Saints football, Sugar Bowls, and Super Bowls, all a walk from the French Quarter.",
    bestFor: ["NFL", "college football", "concerts"],
    atmosphere: {
      vibe: "The Who Dat crowd in a sealed dome is a genuinely deafening, joyful experience",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor (dome)"
    },
    arrival: {
      parking: "Dome garages plus CBD lots; prepay for Saints games.",
      rideshare: "Slow post-game in the CBD; walking toward the Quarter first helps.",
      transit: "Streetcars and buses serve the CBD; from most downtown/Quarter hotels it's simply a walk.",
    },
    seating: {
      bestValueSections: ["Lower corners", "300-level sidelines"],
      avoidIfPossible: ["600-level end zone top rows (nosebleed even by dome standards)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Gumbo, po'boys, and daiquiris inside — and the best pre/post-game food city in America outside.",
      nearbyPregame: ["French Quarter", "Warehouse District (Cochon, Pêche)", "Poydras Street bars"],
    },
    fanTips: [
      "Saints games double as street parties — the pregame walk down Poydras is part of the show.",
      "Sugar Bowl and Super Bowl weeks reprice the whole city; book far ahead.",
      "The dome roar on big third downs is a top-3 NFL noise experience — sit mid-bowl to bathe in it."
    ],
    officialLinks: {
      website: "https://www.caesarssuperdome.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "raymond-james-stadium-tampa-fl": {
    name: "Raymond James Stadium",
    aliases: ["Ray Jay", "RayJay"],
    city: "Tampa",
    state: "FL",
    summary: "Buccaneers home with the famous 103-foot pirate ship in the north end zone that fires cannons after scores; also hosts USF football and major bowls.",
    bestFor: ["NFL", "college football", "international soccer"],
    atmosphere: {
      vibe: "Relaxed Florida crowd that wakes up when the cannons do",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Big on-site lots around Dale Mabry Highway; prepaid recommended for NFL.",
      rideshare: "Standard zones; Dale Mabry backs up an hour before kickoff.",
      transit: "Limited HART bus service; most arrive by car.",
    },
    seating: {
      bestValueSections: ["Upper west sideline", "Lower corners"],
      avoidIfPossible: ["East lower rows for 1pm September kickoffs (sun)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cuban sandwiches are the local must; standard fare otherwise.",
      nearbyPregame: ["Yard of Ale/Press Box on Dale Mabry", "Armature Works (drive)", "Ybor City (postgame)"],
    },
    fanTips: [
      "September games are heat events — night games are a far better experience.",
      "USF home games are the cheap way into the building.",
      "Afternoon storm cells roll through fast in early fall; check radar before you tailgate."
    ],
    officialLinks: {
      website: "https://raymondjamesstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
