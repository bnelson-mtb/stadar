// MLB ballparks (30). Notes as of July 2026: the Athletics play at Sutter
// Health Park (West Sacramento) until their Las Vegas park opens (~2028);
// the Rays returned to a repaired Tropicana Field for 2026. Yankee Stadium
// also hosts NYCFC (MLS) until Etihad Park opens (~2027).
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const MLB_VENUES = {
  "angel-stadium-anaheim-ca": {
    name: "Angel Stadium",
    aliases: ["Angel Stadium of Anaheim", "Edison International Field", "Anaheim Stadium", "The Big A"],
    city: "Anaheim",
    state: "CA",
    summary: "The Big A — MLB's fourth-oldest park, a comfortable classic off the 57 freeway with the famous halo marquee and rock-pile waterfall in center.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Family-forward Orange County calm; Rally Monkey nostalgia endures",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Huge on-site lot with easy freeway access; exits jam briefly post-game.",
      rideshare: "Simple drops off State College Blvd.",
      transit: "Metrolink/Amtrak at ARTIC station across the street — genuinely usable from LA.",
    },
    seating: {
      bestValueSections: ["View level behind home", "Field level outfield lines"],
      avoidIfPossible: ["Upper corners far down the lines"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard SoCal ballpark fare — helmet nachos and Chronic Tacos presence.",
      nearbyPregame: ["Golden Road Brewing (across the lot)", "The Catch", "Noble Ale Works"],
    },
    fanTips: [
      "Angels tickets are among MLB's cheapest for a two-superstar-era team gone quiet — great value nights.",
      "June-September evenings are near-perfect weather; day games bake the third-base side.",
      "The team's long-running stadium/relocation saga is unresolved — the Big A's future is perennially in the news."
    ],
    officialLinks: {
      website: "https://www.mlb.com/angels/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "chase-field-phoenix-az": {
    name: "Chase Field",
    aliases: ["Bank One Ballpark", "The BOB"],
    city: "Phoenix",
    state: "AZ",
    summary: "Retractable-roof, air-conditioned Diamondbacks home downtown — the pool in right-center and light rail at the door make it the desert's most practical ballpark.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Casual and cool (literally) — the roof stays closed most of the summer",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (closed in summer)"
    },
    arrival: {
      parking: "Downtown garages within 3 blocks; event pricing moderate.",
      rideshare: "Jefferson Street drops are easy.",
      transit: "Valley Metro light rail stops two blocks away at 3rd St/Jefferson.",
    },
    seating: {
      bestValueSections: ["Upper infield", "Lower outfield reserve"],
      avoidIfPossible: ["Upper corners (long views in a big bowl)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "The Sonoran dog is mandatory; value menus keep it one of MLB's cheaper eats.",
      nearbyPregame: ["Downtown bars on Roosevelt Row (short ride)", "Cornish Pasty Co", "Pedal Haus"],
    },
    fanTips: [
      "D-backs tickets are consistently among MLB's most affordable — walk-up friendly most nights.",
      "It's 75°F inside when it's 112°F outside — dress for AC, not the desert.",
      "Stadium lease/renovation politics simmer in the background; the building itself is comfortable as-is."
    ],
    officialLinks: {
      website: "https://www.mlb.com/dbacks/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "truist-park-atlanta-ga": {
    name: "Truist Park",
    aliases: ["SunTrust Park"],
    city: "Atlanta",
    state: "GA",
    summary: "Braves home in Cobb County, wrapped in The Battery — the sport's most complete ballpark-village, where the pregame neighborhood is half the ticket's value.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Chop-chanting, packed, and social — the Battery keeps energy flowing all night",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Battery and satellite decks; prepay always — it's a car venue by design.",
      rideshare: "Designated zones across Windy Ridge; surge post-game.",
      transit: "No rail — CobbLinc shuttle options only; this is metro Atlanta driving.",
    },
    seating: {
      bestValueSections: ["Terrace infield", "Vista corners behind home"],
      avoidIfPossible: ["Deep upper corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Strong in-park program plus the entire Battery restaurant lineup at the gates.",
      nearbyPregame: ["The Battery (Punch Bowl Social, Live! venue)", "Terrapin Taproom", "Superica"],
    },
    fanTips: [
      "Braves games sell strongly — weekday matinees are the value window.",
      "Summer evening storms pass fast; delays are common but rarely wash out.",
      "The Battery is worth arriving early for even without kids — it's the model every team now copies."
    ],
    officialLinks: {
      website: "https://www.mlb.com/braves/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "oriole-park-at-camden-yards-baltimore-md": {
    name: "Oriole Park at Camden Yards",
    aliases: ["Camden Yards", "Oriole Park"],
    city: "Baltimore",
    state: "MD",
    summary: "The park that started the retro-ballpark revolution (1992) — the B&O Warehouse backdrop, Eutaw Street's Boog's BBQ, and downtown Baltimore at the gates.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Baseball-romantic; the young-core era re-filled the seats with orange",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Stadium lots shared with M&T Bank Stadium plus downtown garages.",
      rideshare: "Easy drops on Russell/Pratt.",
      transit: "Light Rail stops at Camden Yards; MARC Camden Line from DC ends at the gates.",
    },
    seating: {
      bestValueSections: ["Upper reserve infield", "Left field lower"],
      avoidIfPossible: ["Deep right-field corner under the wall's shadow of the warehouse view"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Boog's BBQ on Eutaw Street and crab-everything — a top-5 MLB food park.",
      nearbyPregame: ["Pickles Pub", "Federal Hill", "Cross Street Market"],
    },
    fanTips: [
      "Walk Eutaw Street even if your seats are elsewhere — it's the park's living museum.",
      "O's tickets remain affordable for the product; weekend Yankees/Sox games are the exception.",
      "Combine with Fort McHenry or the Inner Harbor for a full Baltimore day."
    ],
    officialLinks: {
      website: "https://www.mlb.com/orioles/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fenway-park-boston-ma": {
    name: "Fenway Park",
    aliases: ["Fenway"],
    city: "Boston",
    state: "MA",
    summary: "America's oldest ballpark (1912) — the Green Monster, Pesky's Pole, and a century of quirks in the middle of a living Boston neighborhood.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Cathedral crossed with a pub — 'Sweet Caroline' in the 8th, tourists and die-hards shoulder to shoulder",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Scarce and extortionate — Fenway garages hit $60+; don't drive.",
      rideshare: "Kenmore-area drops; the T is faster.",
      transit: "Green Line to Kenmore or Fenway stations, a 5-minute walk.",
    },
    seating: {
      bestValueSections: ["Bleachers (sections 34-43)", "Grandstand infield (poles permitting)"],
      avoidIfPossible: ["Grandstand seats flagged obstructed (support poles)", "Right field grandstand angles (face center, not home)"],
      accessibilityNote: "A 1912 building — accessible seating exists but options are limited; verify carefully before buying."
    },
    foodAndDrink: {
      summary: "Fenway Franks inside; Lansdowne Street and the Fenway neighborhood bars carry the pregame.",
      nearbyPregame: ["Cask 'n Flagon", "Bleacher Bar (under the bleachers)", "Time Out Market Boston"],
    },
    fanTips: [
      "Take the park tour if it's your first visit — the Monster's interior and 1912 details are worth it.",
      "Grandstand seats are wooden 1934 originals: narrow and knee-tight; aisle seats help.",
      "Yankees series and October reprice everything; midweek NL visitors are the value window."
    ],
    officialLinks: {
      website: "https://www.mlb.com/redsox/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "wrigley-field-chicago-il": {
    name: "Wrigley Field",
    aliases: ["Wrigley", "The Friendly Confines"],
    city: "Chicago",
    state: "IL",
    summary: "The Friendly Confines (1914) — ivy walls, hand-turned scoreboard, rooftop bleachers across Waveland and Sheffield, and Wrigleyville wrapped around it all.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Half ballgame, half street festival — the neighborhood is the experience",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Nearly nonexistent — remote lots with shuttles exist, but don't drive to Wrigleyville.",
      rideshare: "Drop zones blocks away; the L is faster and cheaper.",
      transit: "CTA Red Line to Addison station, directly outside the park.",
    },
    seating: {
      bestValueSections: ["Upper deck infield", "Bleachers (general admission energy)"],
      avoidIfPossible: ["Back terrace rows under the overhang (obstructed sky)", "Poles-adjacent seats flagged obstructed"],
      accessibilityNote: "A 1914 building — accessible options are limited and specific; verify at purchase."
    },
    foodAndDrink: {
      summary: "Chicago dogs and Old Style inside; every third door in Wrigleyville is a bar.",
      nearbyPregame: ["Murphy's Bleachers", "Sluggers", "Gallagher Way plaza"],
    },
    fanTips: [
      "Day games are the canonical Wrigley experience — the park was built for afternoon sun.",
      "Wind direction changes the game: blowing out means homers, blowing in means 2-1 — check the flags.",
      "April and September games can be 40°F off the lake; summer bleachers can be 95°F. There is no neutral Wrigley weather."
    ],
    officialLinks: {
      website: "https://www.mlb.com/cubs/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rate-field-chicago-il": {
    name: "Rate Field",
    aliases: ["Guaranteed Rate Field", "U.S. Cellular Field", "Comiskey Park", "The Cell"],
    city: "Chicago",
    state: "IL",
    summary: "White Sox home in Bridgeport on the South Side — an underrated food park with easy Red Line access and famously cheap tickets.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "South Side local pride, sparse in rebuild years but genuinely fun when full",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Big official lots — one of the few easy-driving Chicago venues.",
      rideshare: "Simple drops off 35th Street.",
      transit: "Red Line to Sox-35th, directly across the street.",
    },
    seating: {
      bestValueSections: ["Lower box infield (resale)", "Outfield lower reserved"],
      avoidIfPossible: ["Upper deck top rows (notoriously steep/high)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Sleeper top-5 MLB food — elote, Polish sausage, and South Side classics.",
      nearbyPregame: ["Cork & Kerry", "Turtle's Bar", "Bridgeport spots on Halsted"],
    },
    fanTips: [
      "Sox tickets are routinely MLB's cheapest — a $15 night with elite ballpark food.",
      "The Sox have flirted with a new South Loop stadium — the future here is an open question.",
      "Crosstown Cubs series flips the park's energy completely; buy those early."
    ],
    officialLinks: {
      website: "https://www.mlb.com/whitesox/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "great-american-ball-park-cincinnati-oh": {
    name: "Great American Ball Park",
    aliases: ["GABP"],
    city: "Cincinnati",
    state: "OH",
    summary: "Reds home on the Ohio River next to The Banks — riverboat smokestacks in center field and the baseball-original franchise's museum at the gate.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Old-baseball-town warmth; fireworks Fridays are a family institution",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Central Riverfront Garage under The Banks; easy by MLB standards.",
      rideshare: "Drop at The Banks and walk in.",
      transit: "Cincinnati streetcar (free) to The Banks; TANK buses from Kentucky.",
    },
    seating: {
      bestValueSections: ["View level infield", "Terrace outfield"],
      avoidIfPossible: ["Sun/moon deck for day games unless you want the tan"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Skyline chili and LaRosa's inside; The Banks district at the gates.",
      nearbyPregame: ["Moerlein Lager House", "The Banks bars", "Findlay Market (pre-game trip)"],
    },
    fanTips: [
      "Reds tickets are deep-value MLB — great walk-up spontaneity.",
      "The Reds Hall of Fame at the park is worth the add-on for baseball-history fans.",
      "Cross the Roebling Bridge from Covington for cheaper parking and a better walk."
    ],
    officialLinks: {
      website: "https://www.mlb.com/reds/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "progressive-field-cleveland-oh": {
    name: "Progressive Field",
    aliases: ["Jacobs Field", "The Jake"],
    city: "Cleveland",
    state: "OH",
    summary: "Guardians home on the Gateway block downtown — a renovated 90s gem with a famously rowdy bullpen-adjacent right field district.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Midwest-earnest with drum-in-the-bleachers tradition",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Gateway garages shared with Rocket Arena; easy walking from downtown.",
      rideshare: "East 4th/Prospect drops.",
      transit: "RTA Rapid to Tower City + 10-minute walk.",
    },
    seating: {
      bestValueSections: ["Upper box infield", "Lower reserved outfield"],
      avoidIfPossible: ["Deep upper corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Renovations brought Cleveland vendors in force — a legit local-food park.",
      nearbyPregame: ["East 4th Street", "Flannery's", "Masthead Brewing"],
    },
    fanTips: [
      "Guardians tickets stay affordable even in contention years.",
      "April games off Lake Erie are genuinely cold — this is a June-September park at its best.",
      "The John Adams drum tradition continues via successors in the bleachers — sit left field for it."
    ],
    officialLinks: {
      website: "https://www.mlb.com/guardians/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "coors-field-denver-co": {
    name: "Coors Field",
    aliases: ["Coors"],
    city: "Denver",
    state: "CO",
    summary: "Mile-high baseball in LoDo — thin-air homers, the Rooftop party deck, mountain sunsets, and the purple row marking exactly 5,280 feet.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Social-first — the Rooftop crowd sometimes outnumbers the baseball-watchers",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "LoDo garages and lots; prices climb near the gates.",
      rideshare: "Blake Street drops are simple.",
      transit: "RTD rail to Union Station, a 5-minute walk away.",
    },
    seating: {
      bestValueSections: ["Upper infield (mountain views)", "The Rockpile"],
      avoidIfPossible: ["Nothing structural — it's a friendly bowl"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Helton Burger and craft beer everywhere — plus the entire LoDo bar scene at the gates.",
      nearbyPregame: ["Wynkoop Brewing", "Falling Rock territory (LoDo beer bars)", "Union Station hall"],
    },
    fanTips: [
      "Sit on the purple 20th row of the upper deck — exactly one mile above sea level.",
      "The team is usually bad; the experience isn't — treat it as a $20 patio with baseball attached.",
      "Summer evening storms roll through fast; delays end quickly at altitude."
    ],
    officialLinks: {
      website: "https://www.mlb.com/rockies/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "comerica-park-detroit-mi": {
    name: "Comerica Park",
    aliases: ["Comerica"],
    city: "Detroit",
    state: "MI",
    summary: "Tigers home downtown with the giant tiger statues, a Ferris wheel and carousel inside, and Ford Field next door.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Family-forward with old-franchise bones; buzzing again as the Tigers contend",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "District garages shared with LCA/Ford Field; prebook weekends.",
      rideshare: "Woodward/Montcalm drops.",
      transit: "QLine streetcar down Woodward stops at the gate.",
    },
    seating: {
      bestValueSections: ["Upper box infield", "Pavilion outfield (kid zones close)"],
      avoidIfPossible: ["Deep outfield corners (vast territory = far from everything)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Coney dogs (obviously) and a solid local lineup.",
      nearbyPregame: ["Hockeytown Cafe", "Grand Trunk Pub", "Eastern Market (Saturdays)"],
    },
    fanTips: [
      "The carousel/Ferris wheel make this a legitimately great first-ballgame park for kids.",
      "April in Detroit is winter baseball — night games before May demand layers.",
      "Tigers contention has revived crowds; weekend games are no longer walk-up sure things."
    ],
    officialLinks: {
      website: "https://www.mlb.com/tigers/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "daikin-park-houston-tx": {
    name: "Daikin Park",
    aliases: ["Minute Maid Park", "Enron Field", "The Juice Box"],
    city: "Houston",
    state: "TX",
    summary: "Astros home downtown (renamed from Minute Maid Park in 2025) — retractable roof, the left-field train, and the Crawford Boxes' short porch.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Championship-era confidence; loud with the roof closed",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (closed most of summer)"
    },
    arrival: {
      parking: "Downtown garages and official lots east of the park.",
      rideshare: "Texas Ave drops standard.",
      transit: "METRORail Green/Purple lines pass blocks away; Red Line connects downtown.",
    },
    seating: {
      bestValueSections: ["View deck infield", "Mezzanine outfield"],
      avoidIfPossible: ["Deep view-deck corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Torchy's, BBQ, and Tex-Mex — top-half MLB food.",
      nearbyPregame: ["Home Plate Bar & Grill", "Truck Yard Houston", "EaDo breweries"],
    },
    fanTips: [
      "Old listings still say Minute Maid Park — renamed Daikin Park for 2025.",
      "The train on the left-field track runs after homers — sit third-base side to face it.",
      "Astros weekend games price high; midweek NL visitors are the value window."
    ],
    officialLinks: {
      website: "https://www.mlb.com/astros/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kauffman-stadium-kansas-city-mo": {
    name: "Kauffman Stadium",
    aliases: ["The K", "Royals Stadium"],
    city: "Kansas City",
    state: "MO",
    summary: "The K — crown-topped scoreboard and the famous outfield fountains, sharing the Truman Sports Complex with Arrowhead while the Royals pursue a new ballpark.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Fountains-and-family calm with 2015-vintage loyalty underneath",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Sports-complex lots only — a driving venue, no neighborhood.",
      rideshare: "Designated zones; waits moderate.",
      transit: "Minimal; plan to drive.",
    },
    seating: {
      bestValueSections: ["View level infield", "Outfield plaza"],
      avoidIfPossible: ["Deep view-level corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "KC BBQ inside is real (burnt ends); Craft & Draft in right field is the beer destination.",
      nearbyPregame: ["Your tailgate", "eat BBQ in the city first (Joe's, Q39) — it's a drive anyway"],
    },
    fanTips: [
      "The Royals' new-stadium pursuit (downtown/Kansas-side options) means The K's era is winding toward an end — see the fountains while they run.",
      "Royals tickets are among MLB's cheapest; fireworks Fridays are the family standard.",
      "Summer day games are shadeless in much of the bowl — check sun exposure."
    ],
    officialLinks: {
      website: "https://www.mlb.com/royals/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "dodger-stadium-los-angeles-ca": {
    name: "Dodger Stadium",
    aliases: ["Chavez Ravine"],
    city: "Los Angeles",
    state: "CA",
    summary: "Baseball's third-oldest park (1962) carved into Chavez Ravine — palm trees, San Gabriel views, Dodger Dogs, and the sport's biggest capacity.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Arrives in the 2nd, leaves in the 8th, loud in between — LA's most reliable communal event",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "The classic option — big lots but slow exits; prepay and park facing out.",
      rideshare: "Dedicated lot; expect walking either way.",
      transit: "Dodger Stadium Express bus (free with ticket) from Union Station — the best-kept non-secret.",
    },
    seating: {
      bestValueSections: ["Top deck infield", "Reserve level infield"],
      avoidIfPossible: ["Pavilions if you want to leave your section (historically restricted circulation)"],
      accessibilityNote: "Terraced hillside design — verify elevator/gate access for your level when buying."
    },
    foodAndDrink: {
      summary: "The Dodger Dog is the ritual; micheladas and helmet nachos round out the classics.",
      nearbyPregame: ["Short Stop (Echo Park)", "Sunset Blvd spots", "Olvera Street pre-Express bus"],
    },
    fanTips: [
      "Sunset from the reserve level over the outfield palms is the definitive LA baseball image.",
      "Freeway exits back up 90 minutes before first pitch — the Express bus or early arrival are the only good plans.",
      "Friday-night fireworks let you exit late and skip the worst traffic."
    ],
    officialLinks: {
      website: "https://www.mlb.com/dodgers/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "loandepot-park-miami-fl": {
    name: "loanDepot park",
    aliases: ["Marlins Park", "LoanDepot Park"],
    city: "Miami",
    state: "FL",
    summary: "Retractable-roof Marlins home in Little Havana — air-conditioned, art-splashed, and never crowded, with genuinely great Cuban food inside.",
    bestFor: ["MLB", "international soccer/baseball (WBC)"],
    atmosphere: {
      vibe: "Quiet most nights; erupts for WBC and Cuban-heritage events",
      noiseLevel: "Low-medium",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (closed in summer)"
    },
    arrival: {
      parking: "On-site garages are cheap by Miami standards.",
      rideshare: "Easy — attendance keeps traffic light.",
      transit: "Limited; Magic City trolleys and buses — most drive.",
    },
    seating: {
      bestValueSections: ["Anywhere infield (buy cheapest, upgrade by walking)", "Home run porch"],
      avoidIfPossible: ["Nothing — emptiness is the amenity"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cuban sandwiches, croquetas, and cafecito — the food outperforms the team reliably.",
      nearbyPregame: ["Calle Ocho (Little Havana)", "Ball & Chain", "Versailles (pre-game institution)"],
    },
    fanTips: [
      "Pair the game with a Calle Ocho evening — the neighborhood is the draw.",
      "WBC games here are the building at its true potential — completely different event class.",
      "Marlins tickets are MLB's most discounted; never pay face for a regular-season game."
    ],
    officialLinks: {
      website: "https://www.mlb.com/marlins/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "american-family-field-milwaukee-wi": {
    name: "American Family Field",
    aliases: ["Miller Park", "AmFam Field"],
    city: "Milwaukee",
    state: "WI",
    summary: "Brewers home with the fan-shaped retractable roof — MLB's best tailgating scene, the sausage race, and Bernie's dugout slide.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Wisconsin tailgate culture transplanted to baseball — social, beery, and warm",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Vast on-site lots built for tailgating; prepay and bring a grill.",
      rideshare: "Designated zones; fine either way.",
      transit: "MCTS Brewers Line game-day buses from downtown.",
    },
    seating: {
      bestValueSections: ["Terrace infield", "Loge outfield"],
      avoidIfPossible: ["Deep terrace corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Brats with stadium sauce, cheese curds, and the local-beer depth you'd expect.",
      nearbyPregame: ["Your tailgate (non-negotiable)", "Kelly's Bleachers", "J&B's Blue Ribbon"],
    },
    fanTips: [
      "The roof means weather never cancels — book travel plans with confidence.",
      "Watch the sausage race like it matters, because everyone around you thinks it does.",
      "Brewers tickets stay affordable even in contending seasons — strong value market."
    ],
    officialLinks: {
      website: "https://www.mlb.com/brewers/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "target-field-minneapolis-mn": {
    name: "Target Field",
    aliases: ["Target Field Minneapolis"],
    city: "Minneapolis",
    state: "MN",
    summary: "Twins home in the North Loop — limestone-clad, transit-served, and regularly rated among MLB's best modern parks despite April's cold reality.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Minnesota-nice with real baseball bones",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Ramps A/B/C connect by skyway; North Loop street options exist.",
      rideshare: "Easy drops around the ballpark district.",
      transit: "Blue/Green lines terminate at Target Field station under the park; Northstar commuter rail too.",
    },
    seating: {
      bestValueSections: ["Upper infield", "Left field bleachers"],
      avoidIfPossible: ["Deep upper corners in April (wind)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Kramarczuk's sausages and Juicy Lucys — top-10 MLB food with the North Loop next door.",
      nearbyPregame: ["Fulton Brewing", "The Freehouse", "North Loop restaurant row"],
    },
    fanTips: [
      "April/May night games are genuinely cold — day games until June are the comfort play.",
      "Twins tickets are reasonable; summer weekend series sell best.",
      "Combine with a Saturday North Loop brunch-to-ballgame — the neighborhood is the underrated star."
    ],
    officialLinks: {
      website: "https://www.mlb.com/twins/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "citi-field-queens-ny": {
    name: "Citi Field",
    aliases: ["Citi", "Shea Stadium (predecessor site)"],
    city: "Queens",
    state: "NY",
    summary: "Mets home in Flushing — the Jackie Robinson Rotunda, the Home Run Apple, Shake Shack in center field, and the 7 train to the gates.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Long-suffering wit turned big-payroll hope — Queens loud when it matters",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Big lots on the Shea footprint; LGA-corridor traffic is real.",
      rideshare: "Fine, but the 7 exists.",
      transit: "7 train to Mets-Willets Point, at the gate; LIRR Port Washington branch too.",
    },
    seating: {
      bestValueSections: ["Promenade infield", "Left field landing"],
      avoidIfPossible: ["Promenade deep corners (distant, occasionally cut-off sightlines)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "One of MLB's best food parks — Shake Shack, Fuku, Pat LaFrieda's, and the whole World's Fare Market.",
      nearbyPregame: ["Flushing's Chinatown (one stop away — elite pre-game meal)", "Mikkeller-successor brewery spots", "Corona's Italian ices"],
    },
    fanTips: [
      "Pregame in downtown Flushing (one 7 stop) is the best food move in New York sports.",
      "NYCFC also plays occasional matches here — check whether your event is baseball or soccer.",
      "Planes into LGA fly over — part of the charm, honest."
    ],
    officialLinks: {
      website: "https://www.mlb.com/mets/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "yankee-stadium-bronx-ny": {
    name: "Yankee Stadium",
    aliases: ["The Stadium", "New Yankee Stadium"],
    city: "Bronx",
    state: "NY",
    summary: "The Yankees' marble-and-frieze cathedral in the South Bronx — Monument Park, the Bleacher Creatures' roll call, and NYCFC soccer on off-days until Etihad Park opens (~2027).",
    bestFor: ["MLB", "MLS", "college football (Pinstripe Bowl)"],
    atmosphere: {
      vibe: "Imperial-franchise expectation — October here is a different sport",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Garages exist at painful prices; the subway is the answer.",
      rideshare: "161st Street chaos post-game; take the train.",
      transit: "4/B/D to 161st St-Yankee Stadium, at the gate; Metro-North Yankees station too.",
    },
    seating: {
      bestValueSections: ["Grandstand infield (400s)", "Main level outfield (200s)"],
      avoidIfPossible: ["Obstructed bleacher spots behind the bullpens (check maps)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Lobel's steak sandwich is the splurge; the food is corporate-solid throughout.",
      nearbyPregame: ["Stan's Sports Bar (the institution)", "Billy's Sports Bar", "Yankee Tavern"],
    },
    fanTips: [
      "Visit Monument Park early — it closes 45 minutes before first pitch.",
      "Bleacher roll call (top of the 1st, right field) is a tradition worth sitting through once.",
      "NYCFC matches here are cheap and the pitch-in-a-ballpark oddity ends when Etihad Park opens (~2027)."
    ],
    officialLinks: {
      website: "https://www.mlb.com/yankees/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "sutter-health-park-west-sacramento-ca": {
    name: "Sutter Health Park",
    aliases: ["Raley Field"],
    city: "West Sacramento",
    state: "CA",
    summary: "The Athletics' temporary home (2025 until the Las Vegas ballpark opens, ~2028) — a Triple-A park across the river from downtown Sacramento hosting big-league baseball at minor-league intimacy.",
    bestFor: ["MLB", "minor league baseball"],
    atmosphere: {
      vibe: "Novelty-era intimacy — 14,000 seats of major leaguers up close",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Modest on-site lots by MLB standards; downtown Sacramento garages + the bridge walk.",
      rideshare: "Easy — Sacramento scale.",
      transit: "Walkable from downtown Sacramento over the Tower Bridge; SacRT buses nearby.",
    },
    seating: {
      bestValueSections: ["Anywhere infield", "Grass berm (outfield)"],
      avoidIfPossible: ["First-base side day games (afternoon sun)"],
      accessibilityNote: "Smaller park with accessible rows; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Minor-league-priced concessions (a relief) with Sacramento farm-to-fork touches.",
      nearbyPregame: ["Drake's: The Barn (riverfront)", "Old Sacramento", "R Street Corridor"],
    },
    fanTips: [
      "Summer day games regularly top 95°F with limited shade — night games strongly preferred.",
      "The berm in the outfield is the family value play.",
      "This arrangement ends when the Vegas ballpark opens (~2028) — a genuine baseball-history oddity to catch while it lasts."
    ],
    officialLinks: {
      website: "https://www.mlb.com/athletics/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "citizens-bank-park-philadelphia-pa": {
    name: "Citizens Bank Park",
    aliases: ["CBP", "The Bank"],
    city: "Philadelphia",
    state: "PA",
    summary: "Phillies home in the South Philly complex — Ashburn Alley's food row, the Liberty Bell in right-center, and October crowds that shake broadcast cameras.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "The loudest sustained regular-season crowds in baseball since 2022",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Complex lots shared with the Linc and Xfinity Mobile Arena.",
      rideshare: "Subway beats it, as with every complex event.",
      transit: "SEPTA Broad Street Line to NRG station.",
    },
    seating: {
      bestValueSections: ["Pavilion/terrace infield", "Hall of Fame Club (resale)"],
      avoidIfPossible: ["Deep upper corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Ashburn Alley is a top-3 MLB food destination — Federal Donuts chicken, Chickie's crab fries, cheesesteaks that don't embarrass.",
      nearbyPregame: ["Xfinity Live!", "Pattison Ave bars", "East Passyunk (dinner before)"],
    },
    fanTips: [
      "Phillies crowds since the 2022 run are playoff-loud in June — buy expecting demand.",
      "Check the complex calendar — quadruple-event days change every logistic.",
      "Dollar Dog Nights' successors and weekday promos are the value entries."
    ],
    officialLinks: {
      website: "https://www.mlb.com/phillies/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "pnc-park-pittsburgh-pa": {
    name: "PNC Park",
    aliases: ["PNC"],
    city: "Pittsburgh",
    state: "PA",
    summary: "Consensus pick for the most beautiful ballpark in America — the Clemente Bridge walk, the downtown skyline over the outfield, and the Allegheny beyond the right-field wall.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Gorgeous and gentle — the view outdraws the (usually rebuilding) team",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "North Shore garages or downtown + the bridge walk.",
      rideshare: "Drop downtown and walk the Clemente Bridge — it closes to cars on game days.",
      transit: "The T (light rail) is free to North Side station from downtown.",
    },
    seating: {
      bestValueSections: ["Upper infield third-base side (skyline view)", "Outfield bleachers"],
      avoidIfPossible: ["Right field lower if you want the skyline (you face away)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Primanti's, pierogies, and local beer; the North Shore bar row is at the gates.",
      nearbyPregame: ["Mike's Beer Bar", "Burgatory", "Southern Tier"],
    },
    fanTips: [
      "Pirates tickets are among the cheapest in baseball — a $12 seat here beats a $90 seat in most parks.",
      "The pierogi race (Great Pierogi Race) is the mid-inning tradition to catch.",
      "Friday fireworks over the river are legitimately spectacular from the third-base side."
    ],
    officialLinks: {
      website: "https://www.mlb.com/pirates/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "petco-park-san-diego-ca": {
    name: "Petco Park",
    aliases: ["Petco"],
    city: "San Diego",
    state: "CA",
    summary: "Padres home in the Gaslamp Quarter — the Western Metal Supply building in left field, the Park at the Park lawn, and the best ballpark weather in the majors.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Sold-out and loud in the Padres' win-now era — San Diego finally has the crowds the park deserved",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Gaslamp/East Village garages; prices spike on weekends.",
      rideshare: "Gaslamp drops everywhere.",
      transit: "San Diego Trolley (Green/Orange... check line maps) to Gaslamp Quarter station, two blocks away.",
    },
    seating: {
      bestValueSections: ["Upper infield", "Park at the Park lawn"],
      avoidIfPossible: ["Deep upper corners (though weather forgives everything here)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Elite — Hodad's burgers, fish tacos, Cali burritos, and a deep local craft-beer program.",
      nearbyPregame: ["Gaslamp Quarter (everything)", "East Village breweries (Stone tap room area)", "Barrio Logan (pre-game tacos)"],
    },
    fanTips: [
      "There is no bad-weather date on the Padres schedule — book any game with confidence.",
      "The lawn (Park at the Park) with kids is the best family value in the sport.",
      "Padres contention means weekend sellouts — midweek is the access window now."
    ],
    officialLinks: {
      website: "https://www.mlb.com/padres/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "oracle-park-san-francisco-ca": {
    name: "Oracle Park",
    aliases: ["AT&T Park", "SBC Park", "Pacific Bell Park", "Pac Bell Park"],
    city: "San Francisco",
    state: "CA",
    summary: "Giants home on McCovey Cove — splash hits, the Coke bottle slide, garlic fries, and the most scenic waterfront setting in the majors.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "Postcard-beautiful and knowledgeable; bring layers, always",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Lot A and Mission Bay lots at SF prices; transit city rules apply.",
      rideshare: "King Street drops; Muni is easier.",
      transit: "Muni T/N lines stop at the park; Caltrain's 4th & King is two blocks; ferries dock behind center field.",
    },
    seating: {
      bestValueSections: ["View level infield (bay views)", "Bleachers"],
      avoidIfPossible: ["View level reserved in night fog if cold ruins your night (it's biting)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Gilroy garlic fries, Crazy Crab'z sandwich, Ghirardelli sundaes — a top-tier food park.",
      nearbyPregame: ["MoMo's", "21st Amendment Brewery", "The Yard at Mission Rock"],
    },
    fanTips: [
      "Night games are cold in July — this is non-negotiable local knowledge; bring a real jacket.",
      "Standing room along the arcade lets you watch splash-hit territory up close.",
      "Day games are the warm, postcard version of the park — prioritize them for first visits."
    ],
    officialLinks: {
      website: "https://www.mlb.com/giants/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "high", lastReviewed: "2026-07-09", source: "generated" }
  },

  "t-mobile-park-seattle-wa": {
    name: "T-Mobile Park",
    aliases: ["Safeco Field"],
    city: "Seattle",
    state: "WA",
    summary: "Mariners home in SODO with a retractable umbrella-roof (open sides, covered top) — sushi-grade food, the 'Pen bar district inside, and Link light rail nearby.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Long-patient fanbase with real bite when contention appears",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (umbrella style — covers, doesn't enclose)"
    },
    arrival: {
      parking: "SODO garages shared with Lumen Field.",
      rideshare: "Drop in Pioneer Square and walk south.",
      transit: "Link to Stadium station; Sounder commuter trains for most games.",
    },
    seating: {
      bestValueSections: ["View level infield", "The 'Pen (standing/social)"],
      avoidIfPossible: ["Deep view corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Ichiroll sushi, Din Tai Fung history, toasted grasshoppers (chapulines) — MLB's most adventurous menu.",
      nearbyPregame: ["Pioneer Square", "Hatback Bar & Grille", "SODO breweries"],
    },
    fanTips: [
      "The roof covers rain but doesn't heat — Seattle night games need layers into July.",
      "Mariners tickets are moderate; weekend Blue Jays invasions (border fans) sell out — buy those early.",
      "The chapulines are actually good. Trust."
    ],
    officialLinks: {
      website: "https://www.mlb.com/mariners/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "busch-stadium-st-louis-mo": {
    name: "Busch Stadium",
    aliases: ["New Busch Stadium", "Busch Stadium III"],
    city: "St. Louis",
    state: "MO",
    summary: "Cardinals home downtown with the Arch framed over the outfield and Ballpark Village across the street — baseball's self-styled best fans in a sea of red.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Church-of-baseball earnest — knowledgeable, polite, and packed regardless of standings",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Downtown garages everywhere; Ballpark Village decks closest.",
      rideshare: "Easy grid drops.",
      transit: "MetroLink to Stadium station, at the gate.",
    },
    seating: {
      bestValueSections: ["Upper infield third-base side (Arch view)", "Left field porch"],
      avoidIfPossible: ["Right field lower if you want the skyline/Arch (you face away)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Toasted rav, pork steaks, and Budweiser heritage; Ballpark Village handles everything else.",
      nearbyPregame: ["Ballpark Village", "Broadway Oyster Bar (institution)", "Soulard (short ride)"],
    },
    fanTips: [
      "Cardinals crowds fill the park even in down years — don't expect distressed-ticket bargains.",
      "July games are humid-hot; the third-base side shades first.",
      "Broadway Oyster Bar pregame with live music is the local ritual worth adopting."
    ],
    officialLinks: {
      website: "https://www.mlb.com/cardinals/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "tropicana-field-st-petersburg-fl": {
    name: "Tropicana Field",
    aliases: ["The Trop"],
    city: "St. Petersburg",
    state: "FL",
    summary: "The Rays' fixed-dome home, reopened for 2026 with a rebuilt roof and refreshed interior after Hurricane Milton forced the 2025 season to Tampa — catwalks, rays touch tank, and all.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Quirky and intimate — small crowds, analytics-darling team, cowbells",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor (fixed dome)"
    },
    arrival: {
      parking: "On-site lots are ample and cheap by MLB standards.",
      rideshare: "Easy — St. Pete traffic is light.",
      transit: "SunRunner BRT connects the beaches and downtown St. Pete near the dome.",
    },
    seating: {
      bestValueSections: ["Lower infield (resale)", "Outfield 100s"],
      avoidIfPossible: ["Upper corners (tarped/closed in many configurations)"],
      accessibilityNote: "Accessible seating available; post-renovation layouts may shift — verify at purchase."
    },
    foodAndDrink: {
      summary: "Cuban sandwiches and the rays touch tank make it memorable; renovation refreshed the concourses.",
      nearbyPregame: ["Central Avenue breweries (Green Bench, Cycle)", "downtown St. Pete", "Ferg's Sports Bar"],
    },
    fanTips: [
      "2026 is the return season after the hurricane year in Tampa — expect event-level energy early.",
      "The Rays' long-term stadium question remains open; the Trop's remaining years are numbered either way.",
      "AC and a roof mean every summer date is weatherproof — Florida's rain doesn't apply here."
    ],
    officialLinks: {
      website: "https://www.mlb.com/rays/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "globe-life-field-arlington-tx": {
    name: "Globe Life Field",
    aliases: ["GLF"],
    city: "Arlington",
    state: "TX",
    summary: "Rangers' retractable-roof, air-conditioned home (2020) across from AT&T Stadium — the World Series-winning answer to Texas summer.",
    bestFor: ["MLB", "college baseball", "concerts"],
    atmosphere: {
      vibe: "Comfortable and loud when full — the 2023 title era reset expectations",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof (closed all summer)"
    },
    arrival: {
      parking: "Shared entertainment-district lots with AT&T Stadium; prepay and note the lot.",
      rideshare: "Texas Live! drops.",
      transit: "None meaningful — Arlington remains America's largest transit-less city; drive.",
    },
    seating: {
      bestValueSections: ["Upper infield", "Lower outfield (resale)"],
      avoidIfPossible: ["Deep upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Texas-sized novelty items (the boomstick lineage) and solid BBQ.",
      nearbyPregame: ["Texas Live!", "Hurtado BBQ (Arlington's own)", "Division Brewing"],
    },
    fanTips: [
      "Summer games are 72°F inside when it's 105°F out — the roof made Texas baseball civilized.",
      "Check the Cowboys/concert calendar across the street — shared-district nights jam everything.",
      "The old Globe Life Park (Choctaw Stadium) next door now hosts other events — don't navigate to the wrong building."
    ],
    officialLinks: {
      website: "https://www.mlb.com/rangers/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rogers-centre-toronto-on": {
    name: "Rogers Centre",
    aliases: ["SkyDome"],
    city: "Toronto",
    state: "ON",
    summary: "The former SkyDome downtown at the CN Tower's feet — retractable roof, hotel rooms overlooking center field, and a major bowl renovation completed in 2024.",
    bestFor: ["MLB", "concerts"],
    atmosphere: {
      vibe: "A whole country's team — Jays crowds draw from coast to coast and get loud",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Downtown garages at Toronto prices; transit is the answer.",
      rideshare: "Blue Jays Way crawls post-game.",
      transit: "Union Station (TTC/GO/UP Express) connects via SkyWalk, fully indoors.",
    },
    seating: {
      bestValueSections: ["500-level infield", "Outfield district decks"],
      avoidIfPossible: ["500-level corners (still distant)"],
      accessibilityNote: "Renovated accessibility throughout; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Post-renovation food is far better — local Toronto vendors joined the classics.",
      nearbyPregame: ["Steam Whistle Brewing (in the roundhouse next door)", "King West", "The Loose Moose"],
    },
    fanTips: [
      "Roof-open summer nights with the CN Tower lit above the field are special — check the roof forecast.",
      "US visitors: CAD pricing is a quiet discount.",
      "Canada Day and Yankees/Sox weekends sell out — book ahead for those."
    ],
    officialLinks: {
      website: "https://www.mlb.com/bluejays/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nationals-park-washington-dc": {
    name: "Nationals Park",
    aliases: ["Nats Park"],
    city: "Washington",
    state: "DC",
    summary: "Nationals home in the Navy Yard — the ballpark that regenerated a neighborhood, with the racing presidents, Capitol views from the upper deck, and Metro at the gate.",
    bestFor: ["MLB"],
    atmosphere: {
      vibe: "Political-city casual — packed happy-hour energy on summer Fridays",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Navy Yard garages; prices reasonable for DC.",
      rideshare: "N Street drops fine.",
      transit: "Metro Green Line to Navy Yard-Ballpark, half a block from the CF gate.",
    },
    seating: {
      bestValueSections: ["Upper infield", "Outfield reserved"],
      avoidIfPossible: ["Deep upper corners"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Ben's Chili Bowl half-smokes are the signature; the Navy Yard's bars surround the park.",
      nearbyPregame: ["The Bullpen/Half Street Fairgrounds", "Bluejacket Brewery", "The Wharf (one stop away)"],
    },
    fanTips: [
      "Watch the racing presidents (4th inning) — Teddy's lore is required DC knowledge.",
      "Rebuild-era tickets run cheap; the neighborhood experience holds the value.",
      "July humidity is swampy-real — night games and the first-base shade side matter."
    ],
    officialLinks: {
      website: "https://www.mlb.com/nationals/ballpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
