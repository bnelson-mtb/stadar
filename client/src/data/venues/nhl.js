// NHL-exclusive arenas (21). The other 11 NHL buildings are shared with NBA
// tenants and live in nba.js (Crypto.com, MSG, TD Garden, Xfinity Mobile,
// Ball, United Center, Little Caesars, AAC, Delta Center, Scotiabank Arena,
// Capital One). Lenovo Center here also covers NC State basketball.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const NHL_VENUES = {
  "honda-center-anaheim-ca": {
    name: "Honda Center",
    aliases: ["Arrowhead Pond", "The Pond"],
    city: "Anaheim",
    state: "CA",
    summary: "Ducks home across the 57 from Angel Stadium — an easy-driving Orange County arena with ARTIC train station next door and a big renovation/district build underway around it.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Relaxed OC crowd that spikes for rivals (Kings games are the loud nights)",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Large on-site lots; easy in, slow out onto Katella.",
      rideshare: "Simple drops; OC surge is mild.",
      transit: "Metrolink/Amtrak at ARTIC station a short walk away — usable from LA and OC.",
    },
    seating: {
      bestValueSections: ["Terrace center", "Plaza corners"],
      avoidIfPossible: ["Terrace behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with SoCal touches; the OC Vibe district under construction will change the area's options.",
      nearbyPregame: ["The Ranch (steakhouse/saloon)", "JT Schmid's", "Golden Road Brewing (Angel Stadium)"],
    },
    fanTips: [
      "Freeway (Ducks-Kings) games are the atmosphere nights — buy those first.",
      "Angels home dates across the street double the traffic — check the MLB slate.",
      "Ducks rebuild-era tickets are among the NHL's cheapest for a warm-weather market."
    ],
    officialLinks: {
      website: "https://www.hondacenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "sap-center-san-jose-ca": {
    name: "SAP Center",
    aliases: ["San Jose Arena", "HP Pavilion", "The Shark Tank"],
    city: "San Jose",
    state: "CA",
    summary: "The Shark Tank — a teal fortress near downtown San Jose and Diridon Station, famous for the shark-head player entrance.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Loyal through the rebuild; the chomp and goal horn traditions endure",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "On-site lots plus Diridon-area garages; reasonable by Bay Area standards.",
      rideshare: "Santa Clara Street drops are easy.",
      transit: "Caltrain/ACE/Amtrak at Diridon Station, a 5-minute walk; VTA light rail nearby.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard arena fare; San Pedro Square Market a 10-minute walk is the real pregame.",
      nearbyPregame: ["San Pedro Square Market", "Poor House Bistro", "downtown San Jose bars"],
    },
    fanTips: [
      "Sharks tickets are deep-value during the rebuild — great cheap NHL night in an expensive metro.",
      "The pregame shark-head entrance is worth being in your seat early to see.",
      "Google's Downtown West construction keeps shifting the parking map — recheck each season."
    ],
    officialLinks: {
      website: "https://www.sapcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "t-mobile-arena-las-vegas-nv": {
    name: "T-Mobile Arena",
    aliases: ["T Mobile Arena"],
    city: "Las Vegas",
    state: "NV",
    summary: "Golden Knights' Strip-side fortress behind New York-New York — the best pregame show in hockey and a Toshiba Plaza party before every game.",
    bestFor: ["NHL", "boxing", "UFC", "concerts"],
    atmosphere: {
      vibe: "Production-heavy spectacle that converted a tourist town into a real hockey market",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "MGM-property garages (NYNY, Park MGM) with validation quirks; most visitors walk the Strip.",
      rideshare: "Strip drops crawl on event nights; walking beats wheels within a mile.",
      transit: "The Strip itself — walk from most center-Strip hotels; monorail is east-side only.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net rows if new to live hockey"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Vegas food-hall quality at Vegas prices; The Park outside has full restaurants.",
      nearbyPregame: ["Beer Park (Paris)", "The Park restaurants", "NYNY's bars"],
    },
    fanTips: [
      "The pregame drumline and castle show start well before puck drop — be inside 30 minutes early.",
      "Knights games double as tourist events; visiting-team fans are everywhere and welcome.",
      "Weeknight games are notably cheaper than the weekend tourist-inflated dates."
    ],
    officialLinks: {
      website: "https://www.t-mobilearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "climate-pledge-arena-seattle-wa": {
    name: "Climate Pledge Arena",
    aliases: ["KeyArena", "Seattle Center Arena"],
    city: "Seattle",
    state: "WA",
    summary: "Kraken home under the preserved 1962 World's Fair roof at Seattle Center — a carbon-neutral rebuild next to the Space Needle with monorail access.",
    bestFor: ["NHL", "WNBA", "concerts"],
    atmosphere: {
      vibe: "New-franchise enthusiasm with Pacific Northwest polish; Storm games bring championship history",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Limited Seattle Center garages — the venue actively discourages driving.",
      rideshare: "Mercer Street congestion is infamous; drop farther and walk Seattle Center.",
      transit: "Monorail from Westlake (included with event tickets) plus the D Line and Link via reroute.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural — a fair modern bowl"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Seattle-quality local vendors and a just-walk-out market; strong local beer.",
      nearbyPregame: ["Queen Anne bars (lower QA)", "Seattle Center food", "Belltown spots"],
    },
    fanTips: [
      "Transit is included with tickets — genuinely use it; parking here is the worst in the league.",
      "Storm and Kraken share the building — check which team your date belongs to.",
      "The building is cashless and heavily app-driven; set up tickets and payment before arriving."
    ],
    officialLinks: {
      website: "https://climatepledgearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rogers-arena-vancouver-bc": {
    name: "Rogers Arena",
    aliases: ["GM Place", "General Motors Place"],
    city: "Vancouver",
    state: "BC",
    summary: "Canucks home downtown next to BC Place — SkyTrain-served, surrounded by the stadium district's towers, and loud when the Canucks are good.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Hockey-mad city energy; the building shakes in playoff springs",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Stadium-district garages at downtown prices; transit is better.",
      rideshare: "Griffiths Way drops; slow exits post-game.",
      transit: "SkyTrain Expo Line to Stadium–Chinatown station, steps away.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Above-average arena fare (banh mi, sushi); Yaletown and Chinatown flank the district.",
      nearbyPregame: ["Yaletown breweries", "The Pint", "Chinatown restaurants"],
    },
    fanTips: [
      "Prices list in CAD — a quiet discount for US visitors.",
      "Yaletown pregame + SkyTrain is the local pattern.",
      "Canucks playoff tickets are scarce civic events — regular season is the accessible window."
    ],
    officialLinks: {
      website: "https://rogersarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rogers-place-edmonton-ab": {
    name: "Rogers Place",
    aliases: ["Rogers Place Edmonton"],
    city: "Edmonton",
    state: "AB",
    summary: "Oilers home anchoring the Ice District downtown — a modern hockey palace with the Ford Hall gathering space and McDavid-era electricity.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "As hockey-intense as it gets — orange playoff crowds are among the sport's loudest",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Ice District garages; prebook on weekend games.",
      rideshare: "104 Ave drops; winter waits are cold — time it.",
      transit: "LRT to MacEwan station connects directly to the arena via pedway.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Strong local program; the Ice District plaza has bars and restaurants at the doors.",
      nearbyPregame: ["Ice District plaza", "The Banquet", "104 Street spots"],
    },
    fanTips: [
      "Oilers tickets are priced for a city that plans life around the team — buy well ahead.",
      "The Moss Pit (standing area) and playoff watch parties define the atmosphere.",
      "CAD pricing softens the blow for US visitors."
    ],
    officialLinks: {
      website: "https://www.rogersplace.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "scotiabank-saddledome-calgary-ab": {
    name: "Scotiabank Saddledome",
    aliases: ["Saddledome", "Pengrowth Saddledome", "Canadian Airlines Saddledome"],
    city: "Calgary",
    state: "AB",
    summary: "The saddle-roofed Flames barn on the Stampede grounds — the NHL's most distinctive silhouette, living out its final seasons before Scotia Place opens (~2027).",
    bestFor: ["NHL", "concerts", "Stampede events"],
    atmosphere: {
      vibe: "C of Red loyalty in an old-school loud building",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Stampede lots; prebook for weekend games.",
      rideshare: "Standard zones off Macleod Trail.",
      transit: "CTrain Red Line to Victoria Park/Stampede or Erlton/Stampede stations, both short walks.",
    },
    seating: {
      bestValueSections: ["Upper center (press level)", "Lower corners"],
      avoidIfPossible: ["Highest corner rows (roof-curve sightline quirks)"],
      accessibilityNote: "Older building — accessible seating exists but verify locations before buying."
    },
    foodAndDrink: {
      summary: "Old-barn concessions; 17th Ave SW (the Red Mile) and Inglewood carry the pregame.",
      nearbyPregame: ["17th Ave SW (Red Mile)", "Inglewood breweries", "Victoria Park spots"],
    },
    fanTips: [
      "See it before it's gone — Scotia Place replaces it around 2027 and the Dome is a piece of hockey architecture history.",
      "During July Stampede weeks the grounds transform entirely; no NHL but the venue hosts rodeo events.",
      "Flames-Oilers Battle of Alberta nights are the ticket to hunt."
    ],
    officialLinks: {
      website: "https://www.scotiabanksaddledome.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "canada-life-centre-winnipeg-mb": {
    name: "Canada Life Centre",
    aliases: ["MTS Centre", "Bell MTS Place"],
    city: "Winnipeg",
    state: "MB",
    summary: "Jets home in downtown Winnipeg — the NHL's smallest building, which makes the whiteout playoff crowds feel like standing inside a jet engine.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Small building, maximum noise — the whiteout is a league-wide legend",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown surface lots and garages, cheap by NHL standards.",
      rideshare: "Portage Ave drops are simple.",
      transit: "Winnipeg Transit buses converge downtown; most locals drive or walk from downtown offices.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing — the building's size is the feature"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with local touches; The Forks market is a short drive/walk for pregame.",
      nearbyPregame: ["The Forks", "Exchange District spots", "King's Head Pub"],
    },
    fanTips: [
      "Wear white for playoff games — the whiteout is a genuine all-crowd dress code.",
      "Winter arrival logistics are serious at -35°C; park connected or get dropped at the door.",
      "Tickets are scarce relative to the small capacity — buy early for weekend games."
    ],
    officialLinks: {
      website: "https://www.canadalifecentre.ca/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "grand-casino-arena-saint-paul-mn": {
    name: "Grand Casino Arena",
    aliases: ["Xcel Energy Center", "The X"],
    city: "Saint Paul",
    state: "MN",
    summary: "Wild home in downtown St. Paul (renamed from Xcel Energy Center in September 2025) — long regarded as one of the best pure hockey buildings in the NHL.",
    bestFor: ["NHL", "high school hockey (state tournament)", "concerts"],
    atmosphere: {
      vibe: "State-of-Hockey reverence — knowledgeable, loud, and green-clad",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "RiverCentre ramp attached plus downtown St. Paul ramps; cheaper than Minneapolis.",
      rideshare: "West 7th Street drops are the norm.",
      transit: "Green Line LRT from Minneapolis ends blocks away at Union Depot area; buses on West 7th.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid local program; West 7th's bars (Cossetta's!) are the real draw.",
      nearbyPregame: ["Cossetta's", "Tom Reid's Hockey City Pub", "Eagle Street Grille"],
    },
    fanTips: [
      "Listings may still say Xcel Energy Center — renamed Grand Casino Arena in 2025.",
      "The Minnesota boys' high school hockey tournament (March) is a bucket-list event in this building.",
      "Wild tickets run reasonable; rivalry nights (Blackhawks, Jets) price up."
    ],
    officialLinks: {
      website: "https://www.grandcasinoarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "enterprise-center-st-louis-mo": {
    name: "Enterprise Center",
    aliases: ["Scottrade Center", "Savvis Center", "Kiel Center"],
    city: "St. Louis",
    state: "MO",
    summary: "Blues home in downtown St. Louis near Union Station — organ-led hockey tradition and the Stanley Cup banner they waited 52 years for.",
    bestFor: ["NHL", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Blue-collar hockey town warmth; 'Gloria' nostalgia runs deep",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Union Station and downtown garages within blocks; affordable.",
      rideshare: "Clark Ave drops are painless.",
      transit: "MetroLink to Civic Center station, a block away.",
    },
    seating: {
      bestValueSections: ["Mezzanine center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Toasted ravioli and local beer; Union Station's revived complex is next door.",
      nearbyPregame: ["Union Station (Train Shed, soda fountain)", "Ballpark Village (10-min walk)", "Maggie O'Brien's"],
    },
    fanTips: [
      "Blues tickets are mid-priced NHL — weeknights drop pleasantly.",
      "Cardinals playoff overlap in October strains downtown; check both calendars.",
      "The organist is a genuine part of the experience — this is one of the league's traditional atmospheres."
    ],
    officialLinks: {
      website: "https://www.enterprisecenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bridgestone-arena-nashville-tn": {
    name: "Bridgestone Arena",
    aliases: ["Gaylord Entertainment Center", "Nashville Arena", "Sommet Center"],
    city: "Nashville",
    state: "TN",
    summary: "Predators home directly on Lower Broadway — the only NHL rink where the pregame is 30 honky-tonks within 500 feet, and the in-game country acts play the Zamboni breaks.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Party-loud smashville — catfish throws, standing-cheering culture, and country music between whistles",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages at Broadway prices; park a few blocks south for relief.",
      rideshare: "Broadway is closed-chaotic on weekends — drop on 4th/5th Ave and walk.",
      transit: "WeGo buses downtown; most visitors are already staying walkable.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["303 if you want to sit quietly (that's their turf)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Nashville hot chicken inside; the entire honky-tonk strip outside the doors.",
      nearbyPregame: ["Any Lower Broadway honky-tonk", "Assembly Food Hall", "Printer's Alley"],
    },
    fanTips: [
      "Weekend games double as bachelorette-party central — weeknights are the purer hockey experience.",
      "Preds tickets price mid-league; the atmosphere outperforms the price badly.",
      "If someone throws a catfish, that's normal here."
    ],
    officialLinks: {
      website: "https://www.bridgestonearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nationwide-arena-columbus-oh": {
    name: "Nationwide Arena",
    aliases: ["Nationwide"],
    city: "Columbus",
    state: "OH",
    summary: "Blue Jackets home anchoring the Arena District — cannon blasts after goals and a purpose-built entertainment neighborhood around it.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Underdog-market enthusiasm; the cannon culture is beloved and deafening",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Arena District garages built for this; prebook on weekend games.",
      rideshare: "Nationwide Blvd drops are simple.",
      transit: "COTA buses; most attendees drive or stay downtown.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard-plus fare; the District's bars and North Market (short walk) carry pregame.",
      nearbyPregame: ["R Bar (the hockey bar)", "North Market", "Goodale Park-area spots"],
    },
    fanTips: [
      "The goal cannon is genuinely loud — warn kids (or sensitive adults) near the west end.",
      "CBJ tickets are among the NHL's most affordable — good spontaneous hockey.",
      "Ohio State home-game Saturdays gridlock all of Columbus — check the college schedule."
    ],
    officialLinks: {
      website: "https://www.nationwidearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ppg-paints-arena-pittsburgh-pa": {
    name: "PPG Paints Arena",
    aliases: ["Consol Energy Center"],
    city: "Pittsburgh",
    state: "PA",
    summary: "Penguins home uptown, a short walk from downtown Pittsburgh — a modern barn with sellout streak history and a devoted black-and-gold crowd.",
    bestFor: ["NHL", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Hockey-first city intensity carried from the Crosby era forward",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Uptown lots around Fifth Ave; downtown garages a 10-minute walk downhill.",
      rideshare: "Centre Ave drops standard; post-game surge moderate.",
      transit: "Downtown T stations a 12-minute walk; buses up Fifth/Forbes.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Primanti's presence and local beer; downtown's food scene is walkable pre-game.",
      nearbyPregame: ["Souper Bowl", "downtown Market Square", "Duquesne-area spots"],
    },
    fanTips: [
      "Pens tickets softened post-dynasty — good value windows against non-rivals.",
      "The Market Square-to-arena walk uphill takes 15 minutes; budget it.",
      "Student-rush programs make this one of the better cheap-ticket NHL markets if eligible."
    ],
    officialLinks: {
      website: "https://www.ppgpaintsarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "prudential-center-newark-nj": {
    name: "Prudential Center",
    aliases: ["The Rock"],
    city: "Newark",
    state: "NJ",
    summary: "Devils home ('The Rock') in downtown Newark — one stop from Manhattan on multiple rail lines and far easier than any NYC arena logistics.",
    bestFor: ["NHL", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Underrated-loud Devils crowd with a young-core buzz",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Newark garages are plentiful and NYC-cheap.",
      rideshare: "Broad Street drops easy outside rush hour.",
      transit: "Newark Penn Station (PATH, NJ Transit, Amtrak) is a 5-minute walk.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid fare; Newark's Ironbound (Portuguese/Spanish) district a 10-minute walk is a legit food destination.",
      nearbyPregame: ["Ironbound district (Ferry Street)", "Edison Ale House", "Halsey Street spots"],
    },
    fanTips: [
      "The Ironbound pregame dinner is the best-kept secret in NY-area sports.",
      "Devils tickets undercut Rangers and Islanders badly for comparable hockey.",
      "Seton Hall college games share the building in winter — verify the event."
    ],
    officialLinks: {
      website: "https://www.prucenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ubs-arena-elmont-ny": {
    name: "UBS Arena",
    aliases: ["UBS Arena at Belmont Park"],
    city: "Elmont",
    state: "NY",
    summary: "Islanders home at Belmont Park (opened 2021) — a retro-styled hockey barn built to end the team's arena odyssey, with its own LIRR station.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Long Island loyalty transplanted intact — the 'Yes! Yes! Yes!' chants survived the move",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Belmont Park lots are ample; exits funnel slowly onto the Cross Island.",
      rideshare: "Designated lots; LIRR is the better story.",
      transit: "LIRR Elmont-UBS Arena station serves event trains from Penn/Grand Central and Jamaica.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Strong local program (bagel sandwiches, LI breweries) in a building that took food seriously.",
      nearbyPregame: ["UBS Arena's own bars", "Floral Park pubs", "Queens spots pre-LIRR"],
    },
    fanTips: [
      "Isles-Rangers games are the hottest tickets — buy early or watch resale close to puck drop.",
      "The building was built for noise — upper-bowl center is the best sound-per-dollar in the metro.",
      "Check LIRR event-train times home; gaps run long on weeknights."
    ],
    officialLinks: {
      website: "https://www.ubsarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "keybank-center-buffalo-ny": {
    name: "KeyBank Center",
    aliases: ["First Niagara Center", "HSBC Arena", "Marine Midland Arena"],
    city: "Buffalo",
    state: "NY",
    summary: "Sabres home at the foot of Main Street downtown, next to the Canalside waterfront district — a loyal hockey town waiting out a long rebuild.",
    bestFor: ["NHL", "college basketball (NCAA rounds)", "concerts"],
    atmosphere: {
      vibe: "Patient, hockey-literate crowd that erupts when given reason",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown ramps and surface lots, cheap by NHL standards.",
      rideshare: "Easy drops on Perry/Main.",
      transit: "Metro Rail ends at Special Events/Canalside station at the door — free along Main Street's surface section.",
    },
    seating: {
      bestValueSections: ["300-level center", "Lower corners"],
      avoidIfPossible: ["300-level behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Wings, beef on weck, and local beer — Buffalo does arena food right.",
      nearbyPregame: ["Canalside bars", "Pearl Street Grill & Brewery", "Cobblestone District"],
    },
    fanTips: [
      "Sabres tickets are among the NHL's cheapest — Toronto and Boston fans often invade; buy early for those.",
      "Pearl Street Brewery pregame is the local institution.",
      "Lake-effect storms can make the drive in worse than the game-time weather suggests — check radar."
    ],
    officialLinks: {
      website: "https://www.keybankcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bell-centre-montreal-qc": {
    name: "Bell Centre",
    aliases: ["Centre Bell", "Molson Centre"],
    city: "Montreal",
    state: "QC",
    summary: "The largest and loudest building in hockey — the Canadiens' cathedral downtown, where 21,000 bilingual die-hards make regular-season games feel like playoffs.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "The standard against which NHL atmosphere is measured — anthem to final horn",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages at city prices; the Métro renders them optional.",
      rideshare: "De la Montagne drops; post-game surge downtown.",
      transit: "Métro Bonaventure/Lucien-L'Allier stations connect nearly underground to the building.",
    },
    seating: {
      bestValueSections: ["300-level center", "Lower corners"],
      avoidIfPossible: ["400-level behind-net top rows (genuinely far)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Smoked meat and poutine inside; downtown Montreal's food scene is steps away.",
      nearbyPregame: ["Crescent Street bars", "Rue Sainte-Catherine", "Griffintown (short walk)"],
    },
    fanTips: [
      "Habs tickets are expensive and demand is bilingual-city universal — book well ahead.",
      "The anthem (sung by the crowd) and goal songs are worth arriving early for.",
      "CAD pricing helps US visitors; Saturday night games are the full-fever experience."
    ],
    officialLinks: {
      website: "https://www.centrebell.ca/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "canadian-tire-centre-ottawa-on": {
    name: "Canadian Tire Centre",
    aliases: ["Scotiabank Place", "Corel Centre", "The Palladium"],
    city: "Ottawa",
    state: "ON",
    summary: "Senators home in suburban Kanata, 25km west of downtown Ottawa — a commuter arena the franchise plans to eventually replace with a downtown LeBreton Flats build.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Loud when the Sens contend; the young core has re-energized the barn",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Big on-site lots — this is a drive-to venue; exits onto the 417 crawl.",
      rideshare: "Long waits post-game in Kanata; arrange pickup spots ahead.",
      transit: "OC Transpo event buses (Connexion routes) from downtown and park-and-rides.",
    },
    seating: {
      bestValueSections: ["300-level center", "Lower corners"],
      avoidIfPossible: ["300-level behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare; Kanata's chain-restaurant strip is the nearby option — eat downtown first if staying there.",
      nearbyPregame: ["Local Public Eatery Kanata", "Broadway Bar & Grill", "downtown Ottawa before driving"],
    },
    fanTips: [
      "Leafs and Habs visits flip the building half-away-fans — buy early if you want Sens-crowd nights.",
      "A downtown LeBreton Flats arena is planned — this suburban era has an end date (~2030s).",
      "Sens tickets are among the cheaper Canadian-market NHL entries."
    ],
    officialLinks: {
      website: "https://www.canadiantirecentre.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lenovo-center-raleigh-nc": {
    name: "Lenovo Center",
    aliases: ["PNC Arena", "RBC Center", "Raleigh Entertainment and Sports Arena"],
    city: "Raleigh",
    state: "NC",
    summary: "Hurricanes home (renamed from PNC Arena in 2024) shared with NC State basketball — the loudest house in the South when the Caniacs storm playoff surges, with a big tailgating culture rare for the NHL.",
    bestFor: ["NHL", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Tailgate-fueled and deafening for playoffs; NC State games bring their own red-clad noise",
      noiseLevel: "Very high (playoffs) / High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Massive lots shared with Carter-Finley Stadium — NHL's best tailgating happens here.",
      rideshare: "Designated zones; post-game waits are suburban-long.",
      transit: "Minimal — GoRaleigh game-day services only; plan to drive.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Carolina BBQ presence inside; the tailgate lots are the real pregame meal.",
      nearbyPregame: ["Your own tailgate", "Backyard Bistro", "Hillsborough Street (NC State side)"],
    },
    fanTips: [
      "Listings may still show PNC Arena — renamed Lenovo Center in late 2024.",
      "NC State basketball and Canes hockey can play back-to-back days — verify which event you're buying.",
      "The Storm Surge era made Canes tickets pricier, but weeknight non-rivals stay reasonable."
    ],
    officialLinks: {
      website: "https://www.lenovocenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "amerant-bank-arena-sunrise-fl": {
    name: "Amerant Bank Arena",
    aliases: ["FLA Live Arena", "BB&T Center", "BankAtlantic Center", "Office Depot Center"],
    city: "Sunrise",
    state: "FL",
    summary: "Panthers home on the edge of the Everglades in Sunrise — a back-to-back Cup-winning team that turned a sleepy suburban barn into a real hockey destination.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Cup-era loud with rat-throwing tradition revived — a transformed fanbase",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Big on-site lots; prepay saves time — it's 35+ minutes from Miami without traffic.",
      rideshare: "Works, but distances from Miami/Fort Lauderdale make it pricey.",
      transit: "Effectively none — this is a driving venue next to Sawgrass Mills mall.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with Latin touches; Sawgrass Mills mall next door for pre-game chains.",
      nearbyPregame: ["Sawgrass Mills options", "Village Tavern", "eat in Fort Lauderdale first"],
    },
    fanTips: [
      "Championship-era demand raised prices, but it's still cheaper than most contender tickets in the league.",
      "Plastic rats fly after big wins — tradition, not littering.",
      "The team has explored a move closer to Miami long-term; enjoy the suburban-barn era while it lasts."
    ],
    officialLinks: {
      website: "https://www.amerantbankarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "benchmark-international-arena-tampa-fl": {
    name: "Benchmark International Arena",
    aliases: ["Amalie Arena", "Tampa Bay Times Forum", "St. Pete Times Forum", "Ice Palace"],
    city: "Tampa",
    state: "FL",
    summary: "Lightning home in Tampa's Channelside district (renamed from Amalie Arena in 2025) — Tesla-coil goal effects, a Cup-hardened crowd, and the Riverwalk at the doors.",
    bestFor: ["NHL", "concerts"],
    atmosphere: {
      vibe: "Championship-tested loud — Tampa turned into a legitimate hockey town",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Channelside garages; prebook for weekend games.",
      rideshare: "Easy Channelside drops.",
      transit: "TECO streetcar (free) connects Ybor City through Channelside to downtown.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cuban sandwiches (it's Tampa — they're serious) and solid fare; Sparkman Wharf next door.",
      nearbyPregame: ["Sparkman Wharf", "Ybor City (streetcar)", "American Social on the Riverwalk"],
    },
    fanTips: [
      "Listings may still show Amalie Arena — renamed Benchmark International Arena in 2025.",
      "The Tesla coils fire for goals — sit mid-bowl to feel it properly.",
      "Bolts tickets price like a contender; weeknight non-rivals are the entry point."
    ],
    officialLinks: {
      website: "https://www.benchmarkinternationalarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
