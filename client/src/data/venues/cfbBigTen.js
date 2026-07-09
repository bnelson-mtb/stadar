// Big Ten football stadiums (18 schools). Northwestern's new Ryan Field
// opens Oct 2, 2026 (first two 2026 home games at lakeside Martin Stadium).
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const CFB_BIG_TEN_VENUES = {
  "memorial-stadium-champaign-il": {
    name: "Memorial Stadium (Illinois)",
    aliases: ["Memorial Stadium Champaign", "Illinois Memorial Stadium", "Zuppke Field"],
    city: "Champaign",
    state: "IL",
    summary: "Illinois's colonnaded 1923 stadium honoring WWI dead — Grange Grove tailgating out front and a program rebuilding its Saturday culture.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Steady Big Ten crowd that surges when the Illini are ranked",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots and grass fields around the stadium; easy by Big Ten standards.",
      rideshare: "Kirby Ave drops.",
      transit: "MTD buses cover campus; most drive.",
    },
    seating: {
      bestValueSections: ["East sideline", "Upper corners"],
      avoidIfPossible: ["West side for afternoon sun early season"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Campustown and downtown Champaign carry pregame.",
      nearbyPregame: ["Grange Grove", "Kams/Campustown bars", "downtown Champaign breweries"],
    },
    fanTips: [
      "Tickets are among the Big Ten's cheapest — easy spontaneous Saturdays.",
      "November games get properly cold on the prairie — layer seriously.",
      "The 1923 colonnades and memorial columns are worth a walk-around."
    ],
    officialLinks: {
      website: "https://fightingillini.com/facilities/memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "memorial-stadium-bloomington-in": {
    name: "Memorial Stadium (Indiana)",
    aliases: ["Memorial Stadium Bloomington", "Indiana Memorial Stadium", "The Rock"],
    city: "Bloomington",
    state: "IN",
    summary: "Indiana's limestone-clad home — long a basketball school's football venue, transformed by the Cignetti-era winning into a legitimate loud Saturday.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "New-era buzz — recent contention filled a historically mellow stadium",
      noiseLevel: "High (recent vintage)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Stadium lots north of campus; grass lots fill the rest.",
      rideshare: "17th Street drops.",
      transit: "Bloomington Transit; most drive from around Indiana.",
    },
    seating: {
      bestValueSections: ["East sideline", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Bloomington's food scene (a real one) is downtown.",
      nearbyPregame: ["Kirkwood Avenue", "Nick's English Hut", "Upland Brewing"],
    },
    fanTips: [
      "IU football tickets repriced with the winning — no longer the giveaway they were.",
      "October in Bloomington (limestone + fall color) is the aesthetic peak.",
      "Basketball season overlaps late-year — Assembly Hall doubleheader weekends are possible."
    ],
    officialLinks: {
      website: "https://iuhoosiers.com/facilities/memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kinnick-stadium-iowa-city-ia": {
    name: "Kinnick Stadium",
    aliases: ["Kinnick"],
    city: "Iowa City",
    state: "IA",
    summary: "Iowa's 69,000-seat home — famous for The Wave to the children's hospital after the first quarter, pink visitor locker rooms, and hard-nosed Big Ten Saturdays.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Black-and-gold blue-collar loud; The Wave is the most heartwarming tradition in sports",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Hospital/campus ramps and neighborhood yards; Melrose Ave is the tailgate spine.",
      rideshare: "Melrose drops.",
      transit: "Iowa City transit + gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Upper corners", "North end zone"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; downtown Iowa City's bar density handles the rest.",
      nearbyPregame: ["Melrose Ave tailgates", "downtown Iowa City (Pedestrian Mall)", "Airliner"],
    },
    fanTips: [
      "Wave to the kids at Stead Family Children's Hospital after the first quarter — everyone does, and it matters.",
      "Night games at Kinnick are rare and special — grab them when scheduled.",
      "November wind in Iowa City cuts hard; dress a level warmer than forecast."
    ],
    officialLinks: {
      website: "https://hawkeyesports.com/facilities/kinnick-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "secu-stadium-college-park-md": {
    name: "SECU Stadium",
    aliases: ["Maryland Stadium", "Capital One Field", "Byrd Stadium"],
    city: "College Park",
    state: "MD",
    summary: "Maryland's campus stadium inside the Beltway — Metro-accessible Big Ten football with DC's sports market around it.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Mellow by Big Ten standards; big-visitor days import the noise",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots with gameday rates; easier than most P4 venues.",
      rideshare: "Campus Drive drops.",
      transit: "Metro Green Line to College Park + shuttle/walk; the Purple Line will add options.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare with Maryland crab touches; College Park's Route 1 strip covers pregame.",
      nearbyPregame: ["Route 1 bars (Bentley's successors)", "The Hall CP", "Hyattsville's arts district"],
    },
    fanTips: [
      "Ohio State/Michigan/Penn State visits are effectively road games for Maryland — buy early, expect visitor noise.",
      "Terps tickets otherwise run cheap for P4 football.",
      "Fall Saturdays pair well with a DC trip — the Metro makes it seamless."
    ],
    officialLinks: {
      website: "https://umterps.com/facilities/secu-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "michigan-stadium-ann-arbor-mi": {
    name: "Michigan Stadium",
    aliases: ["The Big House"],
    city: "Ann Arbor",
    state: "MI",
    summary: "The Big House — the largest stadium in the Western Hemisphere (107,601), a sunken bowl where seven-figure crowds have watched Michigan since 1927.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Enormous and tradition-drenched; the winged helmets emerging under the banner never gets old",
      noiseLevel: "High (diffuse — the bowl spreads sound)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Golf course and neighborhood lots; Ann Arbor gameday is a well-oiled machine of walking crowds.",
      rideshare: "Stadium Blvd drops, long post-game waits.",
      transit: "AATA buses; most stay walkable in Ann Arbor.",
    },
    seating: {
      bestValueSections: ["Corners rows 50+", "End zone uppers"],
      avoidIfPossible: ["Very low rows far from midfield (flat sightline)"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Ann Arbor's food scene (Zingerman's!) is a destination itself.",
      nearbyPregame: ["Main Street bars", "Zingerman's Deli (early)", "Hoover Street student scene"],
    },
    fanTips: [
      "Ohio State at home (even years) is one of sport's biggest events — plan a year out.",
      "The bowl blocks wind so it's warmer inside than the walk in — but November still bites.",
      "'Mr. Brightside' and the marching band are all-crowd moments; stay through the postgame band show."
    ],
    officialLinks: {
      website: "https://mgoblue.com/facilities/michigan-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "spartan-stadium-east-lansing-mi": {
    name: "Spartan Stadium",
    aliases: ["Spartan Stadium East Lansing"],
    city: "East Lansing",
    state: "MI",
    summary: "Michigan State's 75,000-seat home on the Red Cedar River — 'Zeke the Wonderdog,' the Sparty statue, and green-and-white Saturdays.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Big Ten standard-loud with a chip vs the school down the road",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus ramps and grass lots along the river.",
      rideshare: "Shaw Lane drops.",
      transit: "CATA buses run gameday services.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Grand River Avenue's strip covers pregame.",
      nearbyPregame: ["Grand River Ave bars", "Crunchy's", "HopCat East Lansing"],
    },
    fanTips: [
      "Michigan week flips the town's mood entirely — the rivalry is bitter and the tickets price it.",
      "Late-season night games are cold-weather commitments.",
      "MSU tickets outside rivalries are affordable Big Ten entries."
    ],
    officialLinks: {
      website: "https://msuspartans.com/facilities/spartan-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "huntington-bank-stadium-minneapolis-mn": {
    name: "Huntington Bank Stadium",
    aliases: ["TCF Bank Stadium", "The Bank"],
    city: "Minneapolis",
    state: "MN",
    summary: "Minnesota's 2009-built campus stadium — a horseshoe open to the downtown skyline with light rail at the gates and 'Ski-U-Mah' on the walls.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Row the Boat culture made Saturdays fun again; cold-weather crowds are hardy",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus ramps; light rail makes them optional.",
      rideshare: "University Ave drops.",
      transit: "Green Line's Stadium Village station is at the gate.",
    },
    seating: {
      bestValueSections: ["East sideline (skyline view)", "Corners"],
      avoidIfPossible: ["Upper north in November wind"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Standard-plus with Minnesota staples; Stadium Village and Dinkytown carry pregame.",
      nearbyPregame: ["Stadium Village bars", "Dinkytown", "Surly Brewing (one stop away — destination-grade)"],
    },
    fanTips: [
      "Surly Brewing's beer hall one light-rail stop away is the best pregame in the Big Ten.",
      "November games are legitimately arctic — the stadium was built for it; you must be too.",
      "Gopher tickets run cheap outside trophy games (Axe games vs Wisconsin especially)."
    ],
    officialLinks: {
      website: "https://gophersports.com/facilities/huntington-bank-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "memorial-stadium-lincoln-ne": {
    name: "Memorial Stadium (Nebraska)",
    aliases: ["Memorial Stadium Lincoln", "Nebraska Memorial Stadium", "The Sea of Red"],
    city: "Lincoln",
    state: "NE",
    summary: "Nebraska's Sea of Red — sold out every game since 1962, the longest streak in sports, making the stadium the state's third-largest city on Saturdays.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "The sellout-streak crowd applauds opponents off the field — famously loud AND famously sporting",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Haymarket district garages and campus lots.",
      rideshare: "Haymarket drops and the walk in.",
      transit: "StarTran gameday services; Lincoln is compact.",
    },
    seating: {
      bestValueSections: ["Upper corners", "South end zone"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Runzas at the stadium are the Nebraska-specific must-eat.",
      nearbyPregame: ["Haymarket bars/restaurants", "Barry's", "Lazlo's Brewery"],
    },
    fanTips: [
      "Eat a Runza inside — it's the state's signature food and a stadium tradition.",
      "The balloon release after the first score and the Tunnel Walk are the moments to be seated for.",
      "The sellout streak means resale is the only market — but it's usually reasonable."
    ],
    officialLinks: {
      website: "https://huskers.com/facilities/memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ryan-field-evanston-il": {
    name: "Ryan Field",
    aliases: ["New Ryan Field", "Northwestern Stadium", "Martin Stadium (temporary 2024-26 home)"],
    city: "Evanston",
    state: "IL",
    summary: "Northwestern's brand-new $862M stadium — the most expensive college football venue ever built, opening October 2, 2026 vs Penn State; the Wildcats' first two 2026 home games stay at lakeside Martin Stadium.",
    bestFor: ["college football", "concerts"],
    atmosphere: {
      vibe: "New-build intimacy at 35,000 (smallest in the Big Ten) — designed for canopy-trapped noise",
      noiseLevel: "High (by design)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "Limited by design — Evanston pushes transit hard for the new build.",
      rideshare: "Central Street drops.",
      transit: "Metra UP-North to Central Street station, two blocks away; CTA Purple Line nearby.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Nothing known yet — new building"],
      accessibilityNote: "Brand-new ADA design throughout."
    },
    foodAndDrink: {
      summary: "New premium-heavy food program; Central Street's shops and downtown Evanston nearby.",
      nearbyPregame: ["Central Street spots", "downtown Evanston", "Mustard's Last Stand (the institution survives)"],
    },
    fanTips: [
      "Opening season 2026: the Oct 2 Penn State opener is a historic ticket; the Sep home games are at Martin Stadium on the lakefront instead.",
      "At 35,000 seats, big-visitor games (Ohio State, Michigan) will be the scarcest tickets in the conference.",
      "Chicago fans: this is now the easiest 'road' trip in the Big Ten — 30 minutes on the Metra."
    ],
    officialLinks: {
      website: "https://nusports.com/facilities/ryan-field",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ohio-stadium-columbus-oh": {
    name: "Ohio Stadium",
    aliases: ["The Horseshoe", "The Shoe"],
    city: "Columbus",
    state: "OH",
    summary: "The Horseshoe — Ohio State's 102,000-seat icon on the Olentangy, where Script Ohio and the i-dotting are the most famous band tradition in sports.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Scarlet-obsessed at scale — the program IS the state's civic religion",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus garages and vast grass lots west of the river; all permit/prepay for big games.",
      rideshare: "Lane Ave drops; long post-game waits.",
      transit: "COTA gameday services; most drive or walk from campus-area lodging.",
    },
    seating: {
      bestValueSections: ["C-deck center", "A-deck corners"],
      avoidIfPossible: ["C-deck south top rows if heights bother you"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard big-stadium fare; Lane Avenue and the Short North carry the day.",
      nearbyPregame: ["Lane Avenue tailgates", "Varsity Club (institution)", "Short North (postgame)"],
    },
    fanTips: [
      "Michigan at home (even years) is the sport's biggest regular-season event — priced accordingly.",
      "'Hang on Sloopy' between the third and fourth quarters is full-stadium participation.",
      "Non-conference September games are the affordable way into the Shoe."
    ],
    officialLinks: {
      website: "https://ohiostatebuckeyes.com/facilities/ohio-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "autzen-stadium-eugene-or": {
    name: "Autzen Stadium",
    aliases: ["Autzen"],
    city: "Eugene",
    state: "OR",
    summary: "Oregon's 54,000-seat pressure cooker across the Willamette — pound-for-pound the loudest stadium in the country, reached by a footbridge walk through the trees.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "'It never rains at Autzen' — deafening beyond its size, with Nike-era spectacle everywhere",
      noiseLevel: "Very high (loudest per-capita in CFB)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Limited stadium lots — most park on campus/downtown and walk the footbridge.",
      rideshare: "MLK Blvd drops.",
      transit: "LTD buses; the walk is the tradition anyway.",
    },
    seating: {
      bestValueSections: ["Corners", "East end zone"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare with PNW touches; Eugene's brewery scene handles the rest.",
      nearbyPregame: ["Tailgates in the Autzen lots", "Ninkasi Brewing", "5th Street Public Market"],
    },
    fanTips: [
      "The rain slogan is a bit — bring waterproof anyway from October on.",
      "The Duck's push-up count after scores and 'Shout' in the fourth quarter are the participation moments.",
      "Oregon's uniform-reveal culture means every game looks different — part of the show."
    ],
    officialLinks: {
      website: "https://goducks.com/facilities/autzen-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "beaver-stadium-university-park-pa": {
    name: "Beaver Stadium",
    aliases: ["Beaver Stadium State College"],
    city: "University Park",
    state: "PA",
    summary: "Penn State's 106,000-seat White Out machine in Happy Valley — mid-renovation (through 2027) but still hosting the sport's best single visual: a night White Out.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "White Out nights are a religious experience; regular Saturdays are merely enormous",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Vast grass lots around the stadium — the RV/tailgate scale is its own spectacle.",
      rideshare: "Long waits; central PA capacity is finite.",
      transit: "Minimal — Happy Valley is remote; driving (or chartered buses) is the reality.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zone uppers"],
      avoidIfPossible: ["Sections flagged as construction-adjacent during the renovation"],
      accessibilityNote: "Renovation is improving ADA access; verify current sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare (grilled stickies aside); the tailgate fields and downtown State College carry it.",
      nearbyPregame: ["Stadium grass-lot tailgates", "College Ave bars", "The Creamery (ice cream, required)"],
    },
    fanTips: [
      "If you attend one game, make it the White Out — wear white, no exceptions.",
      "Berkey Creamery ice cream is the campus tradition that outranks most rivals' entire gameday.",
      "Renovation-era logistics shift year to year — reread the gameday guide each season."
    ],
    officialLinks: {
      website: "https://gopsusports.com/facilities/beaver-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ross-ade-stadium-west-lafayette-in": {
    name: "Ross-Ade Stadium",
    aliases: ["Ross Ade Stadium"],
    city: "West Lafayette",
    state: "IN",
    summary: "Purdue's home since 1924 — the Boilermaker Special locomotive, the World's Largest Drum, and a program that lives for ranked-team upsets.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Spoilermaker energy — modest crowds that become giant-killers when a top-5 team visits",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus and IM-field lots; easy by conference standards.",
      rideshare: "Northwestern Ave drops.",
      transit: "CityBus covers campus.",
    },
    seating: {
      bestValueSections: ["Upper corners", "South end"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Chauncey Hill and the Levee carry pregame.",
      nearbyPregame: ["Harry's Chocolate Shop (the institution)", "Chauncey Hill", "Triple XXX Family Restaurant"],
    },
    fanTips: [
      "Harry's Chocolate Shop is a bar, not a chocolate shop — and it's mandatory.",
      "Purdue hosts ranked teams cheap — the upset-lottery ticket is a real value strategy.",
      "The Boilermaker Special (the locomotive) circling after scores is the signature."
    ],
    officialLinks: {
      website: "https://purduesports.com/facilities/ross-ade-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "shi-stadium-piscataway-nj": {
    name: "SHI Stadium",
    aliases: ["High Point Solutions Stadium", "Rutgers Stadium"],
    city: "Piscataway",
    state: "NJ",
    summary: "Rutgers' home on the Raritan — the Birthplace of College Football (1869) plays on next door to where the first game happened.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Jersey-proud and growing with the program's respectability",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots across the Busch campus; buses shuttle between.",
      rideshare: "River Road drops.",
      transit: "NJ Transit to New Brunswick + campus shuttles.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Upper rows in November river wind"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Fat sandwiches are the Rutgers food legend — find the grease trucks' descendants.",
      nearbyPregame: ["New Brunswick's Easton Ave", "Stuff Yer Face", "tailgate lots"],
    },
    fanTips: [
      "Big Ten blue-bloods visiting (OSU, Michigan, PSU) bring their fans in force — Rutgers tickets for those run cheap-to-face.",
      "A 'Fat Darrell' sandwich is a required cultural experience.",
      "NYC-based fans: this is the closest Big Ten football to the city."
    ],
    officialLinks: {
      website: "https://scarletknights.com/facilities/shi-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rose-bowl-pasadena-ca": {
    name: "Rose Bowl",
    aliases: ["Rose Bowl Stadium"],
    city: "Pasadena",
    state: "CA",
    summary: "The most beautiful setting in American sports — UCLA's home in the Arroyo Seco with the San Gabriels behind the north rim and a century of Rose Bowl Game history.",
    bestFor: ["college football", "international soccer", "concerts"],
    atmosphere: {
      vibe: "UCLA Saturdays are mellow; the Rose Bowl Game and big soccer friendlies fill it properly",
      noiseLevel: "Medium (UCLA) / High (bowl game)",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Golf-course grass lots around the stadium — iconic but slow-exiting.",
      rideshare: "Long walks from drop zones regardless.",
      transit: "Metro A Line to Memorial Park + shuttle on big event days.",
    },
    seating: {
      bestValueSections: ["South sideline (mountain view)", "Corners"],
      avoidIfPossible: ["Low rows midfield (the old bowl is shallow — go higher)"],
      accessibilityNote: "A 1922 bowl — accessible options exist but are specific; verify at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Old Pasadena's restaurant rows are 20 minutes' walk.",
      nearbyPregame: ["Brookside golf course tailgates", "Old Pasadena", "Lincoln Ave spots"],
    },
    fanTips: [
      "A late-afternoon kick with alpenglow on the San Gabriels is the best light in American sports.",
      "UCLA attendance is soft — cheap tickets to a legendary venue most Saturdays.",
      "New Year's (Rose Bowl Game) is a different universe of pricing and planning."
    ],
    officialLinks: {
      website: "https://rosebowlstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "la-memorial-coliseum-los-angeles-ca": {
    name: "Los Angeles Memorial Coliseum",
    aliases: ["LA Coliseum", "United Airlines Field at the Coliseum", "L.A. Memorial Coliseum"],
    city: "Los Angeles",
    state: "CA",
    summary: "USC's home and a two-time (soon three-time) Olympic stadium — the peristyle arches, the Olympic torch, and a century of history in Exposition Park.",
    bestFor: ["college football", "Olympics 2028 events"],
    atmosphere: {
      vibe: "Trojan pageantry — Traveler the horse charging after scores under the peristyle",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Exposition Park lots shared with BMO Stadium and museums; prebook.",
      rideshare: "Figueroa corridor drops.",
      transit: "Metro E Line to Expo Park/USC — same easy access as BMO Stadium.",
    },
    seating: {
      bestValueSections: ["North uppers (peristyle view)", "Corners"],
      avoidIfPossible: ["Low rows far from midfield (shallow old bowl)"],
      accessibilityNote: "Renovated accessibility; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Mercado La Paloma and USC Village nearby lift the day.",
      nearbyPregame: ["Mercado La Paloma", "USC Village", "Exposition Park lawns"],
    },
    fanTips: [
      "Watch Traveler (the white horse) run after USC scores — the signature image.",
      "The torch lights for the fourth quarter — look up.",
      "Notre Dame and Big Ten-era marquee visits price high; September non-conference is the value."
    ],
    officialLinks: {
      website: "https://www.lacoliseum.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "husky-stadium-seattle-wa": {
    name: "Husky Stadium",
    aliases: ["Alaska Airlines Field at Husky Stadium"],
    city: "Seattle",
    state: "WA",
    summary: "Washington's lakeside cathedral — cantilevered roofs trap the noise, Lake Washington sits behind the east end, and sailgating (arriving by boat) is a real thing.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "The roofs make 70,000 sound like 100,000 — a top-tier West Coast environment",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (roofs over sidelines)"
    },
    arrival: {
      parking: "Campus lots (E1 tailgating) and UW garages; Montlake traffic chokes.",
      rideshare: "Montlake drops; the light rail changed everything though.",
      transit: "Link light rail's U District/UW stations serve the stadium directly.",
    },
    seating: {
      bestValueSections: ["Covered sideline uppers", "East end (lake view)"],
      avoidIfPossible: ["Uncovered rows in November rain"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard-plus with Seattle touches; U District's Ave and boats handle pregame.",
      nearbyPregame: ["Sailgate flotilla (watch even if you're not aboard)", "The Ave (U District)", "Fremont breweries (short ride)"],
    },
    fanTips: [
      "Walk to the east concourse to see the boat tailgates on Lake Washington — unique in sports.",
      "October rain is a certainty at some point — covered sideline seats are worth the delta.",
      "'Bow Down to Washington' with the roofs echoing is the sound to be inside for."
    ],
    officialLinks: {
      website: "https://gohuskies.com/facilities/husky-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "camp-randall-stadium-madison-wi": {
    name: "Camp Randall Stadium",
    aliases: ["Camp Randall"],
    city: "Madison",
    state: "WI",
    summary: "Wisconsin's 1917-vintage home on a Civil War training ground — 'Jump Around' between the third and fourth quarters literally shakes the structure.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Beer-and-brats joy — the Big Ten's best party crowd, and the Fifth Quarter band show afterward",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Neighborhood yards and campus ramps; Madison's isthmus compresses everything.",
      rideshare: "Regent Street drops.",
      transit: "Madison Metro; most stay walkable near the isthmus.",
    },
    seating: {
      bestValueSections: ["Upper center", "Corners"],
      avoidIfPossible: ["Adjacent to student sections if you want calm"],
      accessibilityNote: "Older bowl — accessible seating exists; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Brats and cheese curds, obviously; State Street and the Union Terrace complete the weekend.",
      nearbyPregame: ["Regent Street bars", "The Great Dane", "Memorial Union Terrace (postgame sunset)"],
    },
    fanTips: [
      "Stay for Jump Around (between Q3 and Q4) and the Fifth Quarter after — leaving early misses half the show.",
      "Madison Saturdays are as much about the town as the game — build the full day.",
      "November games are Wisconsin-cold; the crowd's solution is historically liquid."
    ],
    officialLinks: {
      website: "https://uwbadgers.com/facilities/camp-randall-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
