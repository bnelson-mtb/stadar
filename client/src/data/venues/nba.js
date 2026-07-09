// NBA arenas (all 30). Eleven of these are shared with NHL tenants
// (noted in bestFor) — nhl.js only contains the 21 NHL-exclusive buildings.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const NBA_VENUES = {
  "delta-center-salt-lake-city-ut": {
    name: "Delta Center",
    aliases: ["Vivint Arena", "Vivint Smart Home Arena", "EnergySolutions Arena"],
    city: "Salt Lake City",
    state: "UT",
    summary: "Downtown SLC home of the Jazz and NHL's Utah Mammoth — steep bowl with famously close sightlines, mid-renovation to better fit hockey, and TRAX light rail at the door.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Loud, engaged small-market crowd that travels well from across the state",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages within 2-3 blocks (The Gateway, City Creek); event pricing near the arena.",
      rideshare: "Easy drops on 300 W; post-game surge is mild by big-city standards.",
      transit: "TRAX (Blue/Green) stops at Arena station directly outside — the best option from anywhere on the line.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Lower bowl corners"],
      avoidIfPossible: ["Obstructed-view hockey seats flagged at checkout (bowl retrofit)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Local vendors (Cupbop, R&R BBQ) alongside standard fare; alcohol served despite the stereotypes.",
      nearbyPregame: ["The Gateway", "City Creek Center", "Beer Bar / Bar-X (10-min walk)"],
    },
    fanTips: [
      "Mammoth games sell separately from Jazz — same building, different sightline economics; center-ice uppers beat low corners for hockey.",
      "TRAX is free within the downtown fare-free zone — check if your stop qualifies.",
      "Jazz upper-bowl tickets are among the league's cheapest ways to sit close to an NBA floor."
    ],
    officialLinks: {
      website: "https://www.deltacenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "crypto-com-arena-los-angeles-ca": {
    name: "Crypto.com Arena",
    aliases: ["Staples Center", "Crypto Arena"],
    city: "Los Angeles",
    state: "CA",
    summary: "The Lakers' and Kings' downtown LA home at L.A. Live — celebrity row, banner-heavy rafters, and the busiest arena calendar in the country.",
    bestFor: ["NBA", "NHL", "WNBA", "concerts"],
    atmosphere: {
      vibe: "Show-business crowd for Lakers; Kings games are grittier and cheaper",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "L.A. Live and surrounding garages; prices climb the closer you get — prebook.",
      rideshare: "Designated zones around L.A. Live; expect slow post-game pickups.",
      transit: "Metro A/E lines to Pico station, one block away — genuinely convenient.",
    },
    seating: {
      bestValueSections: ["300-level center", "Lower bowl corners (Kings games)"],
      avoidIfPossible: ["Upper corners behind the baskets for basketball"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Upgraded LA food-hall options inside; L.A. Live next door is wall-to-wall restaurants.",
      nearbyPregame: ["L.A. Live", "Tom's Watch Bar", "Arts District breweries (short ride)"],
    },
    fanTips: [
      "Kings tickets are routinely a third the price of Lakers tickets for the same seat.",
      "With Lakers, Kings, Sparks and concerts, the building turns over nightly — double-check your event's date and time.",
      "Arrive before doors for Lakers games if you want to see warmups — celebrity row fills late but lines run long."
    ],
    officialLinks: {
      website: "https://www.cryptoarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "intuit-dome-inglewood-ca": {
    name: "Intuit Dome",
    aliases: ["Clippers Arena"],
    city: "Inglewood",
    state: "CA",
    summary: "The Clippers' $2B tech showcase (opened 2024) next to SoFi Stadium — the all-standing Wall, halo scoreboard, and grab-and-go checkout-free concessions.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Designed-for-noise; The Wall's 51 rows of standing die-hards set the tone",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "On-site garages need advance booking; Hollywood Park overflow lots also work.",
      rideshare: "Designated lots; post-game surge mirrors SoFi's problems on shared event nights.",
      transit: "K Line to Downtown Inglewood + shuttle/walk; improving corridor but plan buffer time.",
    },
    seating: {
      bestValueSections: ["Upper corners", "The Wall (if you'll stand all game)"],
      avoidIfPossible: ["The Wall if you want to sit — it's literally not allowed"],
      accessibilityNote: "Modern ADA design throughout; accessible rows on every level."
    },
    foodAndDrink: {
      summary: "Checkout-free markets everywhere — link a card on entry and food lines mostly disappear.",
      nearbyPregame: ["Hollywood Park complex", "downtown Inglewood", "Three Weavers Brewing"],
    },
    fanTips: [
      "Halftime free-throw challenges and in-app engagement are part of the building — download the app before you go.",
      "Clippers tickets run well below Lakers prices for comparable quality basketball.",
      "The Wall requires facial-recognition enrollment and Clippers fandom pledges — read the rules before buying there."
    ],
    officialLinks: {
      website: "https://www.intuitdome.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "chase-center-san-francisco-ca": {
    name: "Chase Center",
    aliases: ["Warriors Arena"],
    city: "San Francisco",
    state: "CA",
    summary: "Warriors' bayfront palace in Mission Bay — pricey, polished, with Thrive City plaza dining and Muni T-line service to the door.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Tech-money polished; still erupts properly for big moments",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Limited on-site at premium prices; Mission Bay lots fill on game nights.",
      rideshare: "Designated zones on Terry Francois Blvd; surge is standard.",
      transit: "Muni T Third line stops at UCSF/Chase Center; Caltrain to Mission Bay a short walk.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Upper corners"],
      avoidIfPossible: ["Nothing structurally — just mind the prices"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "SF-quality food (Tartine, local ramen) at SF prices; Thrive City plaza has full restaurants.",
      nearbyPregame: ["Thrive City", "Spark Social food trucks", "Dogpatch bars"],
    },
    fanTips: [
      "This is one of the NBA's most expensive tickets — weeknight non-marquee games are the value window.",
      "The bayfront walk from the Ferry Building is a great pregame if the weather cooperates.",
      "Warriors resale drops closest to tip for non-rival games; patience pays here."
    ],
    officialLinks: {
      website: "https://www.chasecenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "golden-1-center-sacramento-ca": {
    name: "Golden 1 Center",
    aliases: ["G1C"],
    city: "Sacramento",
    state: "CA",
    summary: "Kings' downtown arena attached to the DOCO plaza — loud, purple, famous for the beam, and among the greenest arenas in sports.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Starved-then-fed fanbase energy — Kings crowds punch above the market size",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "DOCO garage above the arena plus downtown lots; prebook for weekends.",
      rideshare: "Easy grid drops a block or two out.",
      transit: "SacRT light rail St. Rose of Lima station is a block away.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Lower corners"],
      avoidIfPossible: ["Top corner rows if you're sensitive to steepness"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Farm-to-fork local vendors — legitimately one of the NBA's best food programs.",
      nearbyPregame: ["DOCO restaurants", "Punch Bowl Social", "R Street Corridor"],
    },
    fanTips: [
      "Light the beam nights — stick around after wins; the crowd celebration is part of the ticket.",
      "Sacramento summers are hot but the arena sits right off the freeway grid — evening arrival is easy.",
      "Kings tickets are reasonable by California standards; lower-bowl corners often go mid-week cheap."
    ],
    officialLinks: {
      website: "https://www.golden1center.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "moda-center-portland-or": {
    name: "Moda Center",
    aliases: ["Rose Garden", "Rose Garden Arena"],
    city: "Portland",
    state: "OR",
    summary: "Trail Blazers home in the Rose Quarter on the east bank of the Willamette — Rip City faithful, MAX light rail at the door, and Portland food inside.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Rip City loyalty runs deep — strong crowds even in down years",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Rose Quarter garages; prices reasonable by NBA standards.",
      rideshare: "Fine, but MAX is right there.",
      transit: "MAX Red/Blue/Green to Rose Quarter TC — arguably the NBA's best transit access.",
    },
    seating: {
      bestValueSections: ["300-level center", "Lower corners"],
      avoidIfPossible: ["300-level behind-basket top rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Portland food-cart culture inside — local carts rotate through, plus serious craft beer taps.",
      nearbyPregame: ["Widmer/Interurban on N Williams", "Moda Center food carts", "Lloyd District spots"],
    },
    fanTips: [
      "Blazers tickets are among the West's most affordable — good spontaneous-night-out value.",
      "The beer list inside is genuinely good; treat concessions as a feature here.",
      "Rain doesn't matter — MAX station to seat without meaningful outdoor exposure."
    ],
    officialLinks: {
      website: "https://www.rosequarter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mortgage-matchup-center-phoenix-az": {
    name: "Mortgage Matchup Center",
    aliases: ["PHX Arena", "Footprint Center", "Talking Stick Resort Arena", "US Airways Center", "America West Arena"],
    city: "Phoenix",
    state: "AZ",
    summary: "Suns and Mercury home in downtown Phoenix (renamed from Footprint Center via PHX Arena in 2025) — light-rail friendly with a walkable bar district around it.",
    bestFor: ["NBA", "WNBA", "concerts"],
    atmosphere: {
      vibe: "Loud when the Suns are rolling; Mercury games have their own devoted following",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages within 3 blocks; event pricing near Jefferson Street.",
      rideshare: "Easy grid drops; short waits by big-market standards.",
      transit: "Valley Metro light rail to Washington/3rd St or Jefferson/1st Ave, both steps away.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Lower corners"],
      avoidIfPossible: ["Top rows behind baskets"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Renovation brought local vendors (tacos, fry bread) up to modern standards.",
      nearbyPregame: ["Downtown Phoenix bars on 1st/2nd Street", "Chase Field-area spots", "Roosevelt Row (short ride)"],
    },
    fanTips: [
      "The arena name changed twice in 2025 (Footprint → PHX Arena → Mortgage Matchup Center) — listings may use any of them.",
      "Summer Mercury games: the walk from light rail is short but brutal in 110°F — time it tightly.",
      "Suns lower-bowl resale softens midweek against non-contenders."
    ],
    officialLinks: {
      website: "https://www.mortgagematchupcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ball-arena-denver-co": {
    name: "Ball Arena",
    aliases: ["Pepsi Center"],
    city: "Denver",
    state: "CO",
    summary: "Nuggets and Avalanche share this workhorse arena between downtown and the South Platte — two championship-caliber tenants and easy light-rail access.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Altitude-fueled and loud for both tenants; Avs games skew rowdier",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Big on-site lots (prepay); Auraria campus garages are the budget alternative.",
      rideshare: "Standard zones; downtown drop + 10-minute walk is often faster.",
      transit: "RTD E/W lines to Ball Arena–Elitch Gardens station right outside.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Lower corners"],
      avoidIfPossible: ["Upper end rows for hockey (puck-tracking distance)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard arena fare with local beer taps; downtown/LoDo pregame is a 15-minute walk.",
      nearbyPregame: ["LoDo bars", "Larimer Square", "Union Station hall"],
    },
    fanTips: [
      "Nuggets and Avs both price like contenders now — weeknight games against bottom teams are the value window.",
      "The arena sits in a parking moat: budget 10-15 minutes from any gate to any transit/pickup point.",
      "Visiting-altitude note applies indoors too — pace the beers."
    ],
    officialLinks: {
      website: "https://www.ballarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "paycom-center-oklahoma-city-ok": {
    name: "Paycom Center",
    aliases: ["Chesapeake Energy Arena", "Ford Center"],
    city: "Oklahoma City",
    state: "OK",
    summary: "Thunder home in downtown OKC next to Bricktown — a small-market crowd with big-market noise, and a new arena already approved to replace it (~2028-29).",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Loud OKC blue loyalty — among the NBA's most engaged home crowds",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Bricktown and downtown garages within a few blocks; cheap by NBA standards.",
      rideshare: "Painless — OKC scale keeps waits short.",
      transit: "OKC Streetcar loops Bricktown and downtown past the arena.",
    },
    seating: {
      bestValueSections: ["Loud City center (300s)", "Lower corners"],
      avoidIfPossible: ["Top behind-basket rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare inside; Bricktown across the street is the real pregame district.",
      nearbyPregame: ["Bricktown canal restaurants", "Toby Keith's", "Prairie Artisan taproom"],
    },
    fanTips: [
      "Thunder playoff-era demand has repriced everything — buy early for marquee opponents.",
      "A new downtown arena is coming (~2028-29); this building's window is closing.",
      "OKC is a driving city but the streetcar + Bricktown combo makes gameday car-free easily."
    ],
    officialLinks: {
      website: "https://www.paycomcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "target-center-minneapolis-mn": {
    name: "Target Center",
    aliases: ["Target Center Arena"],
    city: "Minneapolis",
    state: "MN",
    summary: "Timberwolves and Lynx home in the North Loop-adjacent downtown core, skyway-connected and next to Target Field.",
    bestFor: ["NBA", "WNBA", "concerts"],
    atmosphere: {
      vibe: "Wolves crowds have grown loud with the winning era; Lynx games are a WNBA standard-bearer",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Ramp A/B/C attached via skyway; prebook on Wild/Twins overlap nights.",
      rideshare: "First Avenue drops work; post-game surge is moderate.",
      transit: "Blue/Green lines to Target Field station, a block away.",
    },
    seating: {
      bestValueSections: ["Lower corners", "200-level center"],
      avoidIfPossible: ["Top corner rows (distant in this bowl shape)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Local additions (Red Cow, Soul Bowl) upgraded the standard fare.",
      nearbyPregame: ["North Loop bars", "Fulton Brewing taproom", "First Avenue block"],
    },
    fanTips: [
      "Lynx games are elite basketball at a fraction of Wolves prices.",
      "The North Loop neighborhood is the best eat-drink area, 5-10 minutes' walk.",
      "Check the Twins schedule — shared-block event nights strain parking."
    ],
    officialLinks: {
      website: "https://www.targetcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fiserv-forum-milwaukee-wi": {
    name: "Fiserv Forum",
    aliases: ["The Forum"],
    city: "Milwaukee",
    state: "WI",
    summary: "Bucks' modern home with the Deer District plaza out front — the outdoor watch-party culture is as famous as the building.",
    bestFor: ["NBA", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Milwaukee shows up — title-era energy stuck around",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "5th Street garages and surface lots; cheaper north of the arena.",
      rideshare: "Easy drops around the Deer District perimeter.",
      transit: "The Hop streetcar and MCTS buses serve downtown; most visitors walk from central hotels.",
    },
    seating: {
      bestValueSections: ["Upper bowl center", "Lower corners"],
      avoidIfPossible: ["Very top rows if steep bothers you"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Wisconsin does concessions right — cheese curds, brats, and a deep local tap list.",
      nearbyPregame: ["Deer District (Good City, Punch Bowl)", "Old World Third Street", "Milwaukee Brat House"],
    },
    fanTips: [
      "Marquette basketball plays here too — cheap way into the building in winter.",
      "Playoff watch parties in the Deer District (free) are a phenomenon of their own.",
      "Giannis-era pricing eased somewhat — midweek games are reasonable again."
    ],
    officialLinks: {
      website: "https://www.fiservforum.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "united-center-chicago-il": {
    name: "United Center",
    aliases: ["UC", "Madhouse on Madison"],
    city: "Chicago",
    state: "IL",
    summary: "The Madhouse on Madison — Bulls and Blackhawks under one massive roof on the Near West Side, with the Jordan statue out front.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "The Blackhawks anthem roar and Bulls intro lights are both bucket-list moments",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Official lots surround the building; prepay saves meaningfully.",
      rideshare: "Standard zones on Damen/Wood; postgame waits are manageable.",
      transit: "CTA Pink/Green lines to Ashland-Lake + walk, or the #19/#20 buses down Madison.",
    },
    seating: {
      bestValueSections: ["300-level center", "100-level corners (hockey)"],
      avoidIfPossible: ["300-level behind-net top rows for hockey"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Italian beef and deep local beer; the atrium added modern options.",
      nearbyPregame: ["Randolph Street (West Loop)", "Billy Goat West", "Park Tavern"],
    },
    fanTips: [
      "Arrive early for the Jordan statue photo — the atrium queue is shorter pregame than postgame.",
      "Blackhawks rebuild-era tickets are cheap; the anthem alone is worth it.",
      "The neighborhood is fine on event nights but plan your exact postgame route — it's not a wander-around area."
    ],
    officialLinks: {
      website: "https://www.unitedcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "gainbridge-fieldhouse-indianapolis-in": {
    name: "Gainbridge Fieldhouse",
    aliases: ["Bankers Life Fieldhouse", "Conseco Fieldhouse"],
    city: "Indianapolis",
    state: "IN",
    summary: "The best-designed basketball building in America by many accounts — a retro fieldhouse downtown, home of the Pacers and Fever, walkable from everything in Indy.",
    bestFor: ["NBA", "WNBA", "concerts"],
    atmosphere: {
      vibe: "Basketball-state reverence; Fever games now draw some of the loudest crowds in the WNBA",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages everywhere; Virginia Avenue garage connects via skywalk.",
      rideshare: "Easy — downtown Indy traffic is gentle.",
      transit: "Walkable from all downtown hotels; IndyGo Red Line nearby.",
    },
    seating: {
      bestValueSections: ["Balcony center", "Lower corners"],
      avoidIfPossible: ["Nothing structural — it's a fair bowl top to bottom"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid arena fare; the surrounding blocks have Indy's best bars within 5 minutes.",
      nearbyPregame: ["Georgia Street", "Kilroy's", "Sun King taproom"],
    },
    fanTips: [
      "Fever games sell out now — treat them like marquee events, not walk-ups.",
      "Pacers tickets remain among the NBA's most affordable for the quality of the building.",
      "Big Ten tournament weeks take over the building and downtown — check the calendar."
    ],
    officialLinks: {
      website: "https://www.gainbridgefieldhouse.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "rocket-arena-cleveland-oh": {
    name: "Rocket Arena",
    aliases: ["Rocket Mortgage FieldHouse", "Quicken Loans Arena", "The Q", "Gund Arena"],
    city: "Cleveland",
    state: "OH",
    summary: "Cavs home on Gateway Plaza downtown (renamed Rocket Arena in 2025), sharing the block with Progressive Field and connected to the casino district.",
    bestFor: ["NBA", "AHL", "concerts"],
    atmosphere: {
      vibe: "Loud and loyal — Cleveland treats the Cavs as civic property",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Gateway garages shared with the ballpark; prebook when the Guardians overlap.",
      rideshare: "East 4th Street drops put you a block away.",
      transit: "RTA Rapid to Tower City, then a 5-minute indoor-ish walk.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Top behind-basket rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Local vendors (Mabel's BBQ presence) upgraded the fare; East 4th is steps away.",
      nearbyPregame: ["East 4th Street", "Flannery's", "Winking Lizard"],
    },
    fanTips: [
      "Listings may still say Rocket Mortgage FieldHouse — same building, renamed 2025.",
      "Monsters (AHL) games here are a cheap, high-energy alternative in winter.",
      "Guardians playoff overlap turns the Gateway district into a crush — check both schedules in October."
    ],
    officialLinks: {
      website: "https://www.rocketarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "little-caesars-arena-detroit-mi": {
    name: "Little Caesars Arena",
    aliases: ["LCA"],
    city: "Detroit",
    state: "MI",
    summary: "Pistons and Red Wings share this District Detroit anchor — a gondola-seated, deconstructed-roof design that's among the best modern arenas in the league.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Red Wings tradition meets rebuilding Pistons energy; concerts fill the gaps loudly",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "District garages via ParkWhiz presale; street options thin out fast.",
      rideshare: "Woodward Ave drops; the QLine streetcar is right there too.",
      transit: "QLine streetcar down Woodward stops at the door; People Mover a few blocks off.",
    },
    seating: {
      bestValueSections: ["Gondola/via level", "Upper center"],
      avoidIfPossible: ["Upper corners for hockey if you struggle tracking the puck at distance"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Detroit vendors (Buddy's pizza) and a big central concourse; the District's restaurants surround it.",
      nearbyPregame: ["Union Assembly", "Hockeytown Cafe", "Midtown bars up Woodward"],
    },
    fanTips: [
      "Red Wings and Pistons the same week is common — the arena flips overnight; confirm which sport you're buying.",
      "Pistons games run cheap; it's one of the best value tickets in the NBA for a top-tier building.",
      "The bowl was designed hockey-first — sightlines for the Wings are excellent everywhere."
    ],
    officialLinks: {
      website: "https://www.313presents.com/venue/little-caesars-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "state-farm-arena-atlanta-ga": {
    name: "State Farm Arena",
    aliases: ["Philips Arena"],
    city: "Atlanta",
    state: "GA",
    summary: "Hawks home next to the Georgia World Congress Center downtown — heavily renovated with courtside barbershop-style experiences and MARTA at the door.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Atlanta showtime — music-heavy production and a lively crowd",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "CNN Center-area decks; prebook on Falcons/concert overlap nights.",
      rideshare: "Downtown drops fine; MARTA is easier.",
      transit: "MARTA to GWCC/CNN Center or Five Points — both a short walk.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["Top behind-basket rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Atlanta-priced-fair food program modeled on the Falcons' approach — cheaper than league norm.",
      nearbyPregame: ["Marietta Street", "Centennial Olympic Park district", "Castleberry Hill"],
    },
    fanTips: [
      "Hawks tickets are soft outside marquee opponents — same-week resale is a buyer's market.",
      "Combined State Farm Arena + Mercedes-Benz Stadium event nights strain the whole district — check both.",
      "The zone-entry concessions pricing makes eating inside reasonable, unusual for the NBA."
    ],
    officialLinks: {
      website: "https://www.statefarmarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "spectrum-center-charlotte-nc": {
    name: "Spectrum Center",
    aliases: ["Time Warner Cable Arena", "Charlotte Bobcats Arena"],
    city: "Charlotte",
    state: "NC",
    summary: "Hornets home in Uptown Charlotte — an easy, walkable arena with light rail beneath it and a mid-renovation refresh keeping it current.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Patient fanbase waiting on a winner; buzzes properly for stars and rivals",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Uptown decks in all directions; cheaper a couple blocks out.",
      rideshare: "Trade Street drops are simple.",
      transit: "LYNX Blue Line's CTC/Arena station is directly beneath the building.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with Carolina touches; Uptown's options are all within blocks.",
      nearbyPregame: ["South End breweries (Blue Line)", "Uptown bar row", "7th Street Public Market"],
    },
    fanTips: [
      "Hornets tickets are among the cheapest in the NBA — star road teams are the exception.",
      "ACC/CIAA tournament weeks own this building in March — plan around them.",
      "South End pre/postgame via the Blue Line is the local pattern worth copying."
    ],
    officialLinks: {
      website: "https://www.spectrumcentercharlotte.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kaseya-center-miami-fl": {
    name: "Kaseya Center",
    aliases: ["FTX Arena", "AmericanAirlines Arena", "American Airlines Arena"],
    city: "Miami",
    state: "FL",
    summary: "Heat home on Biscayne Bay downtown — white-hot playoff culture, bayfront views from the upper concourse, and Metromover access.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Arrives late, stays loud — Heat culture is real once the building fills",
      noiseLevel: "High (playoffs) / Medium (regular season)",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "On-site and Bayside garages; downtown Miami traffic demands buffer time.",
      rideshare: "Biscayne Blvd drops; postgame surge is real.",
      transit: "Metromover (free) Freedom Tower station is adjacent; Metrorail connects via Government Center.",
    },
    seating: {
      bestValueSections: ["Lower corners", "300-level center"],
      avoidIfPossible: ["400-level behind baskets"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cuban coffee and croquetas inside; Bayside Marketplace next door for pregame.",
      nearbyPregame: ["Bayside Marketplace", "downtown Flagler district", "Wynwood (short ride)"],
    },
    fanTips: [
      "Regular-season crowds arrive in the second quarter — playoff Miami is a different animal entirely.",
      "Brightline from Fort Lauderdale/West Palm + Metromover is the best regional arrival in Florida sports.",
      "The building has cycled names (AAA → FTX → Kaseya) — old listings persist everywhere."
    ],
    officialLinks: {
      website: "https://www.kaseyacenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kia-center-orlando-fl": {
    name: "Kia Center",
    aliases: ["Amway Center", "Orlando Arena"],
    city: "Orlando",
    state: "FL",
    summary: "Magic home in downtown Orlando's Church Street district (renamed from Amway Center in late 2023) — tall atrium design with a rooftop bar overlooking the city.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Young-core excitement building as the Magic contend again",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "City garages on Church/South Street; prebook for weekend games.",
      rideshare: "Church Street drops are the standard.",
      transit: "SunRail's Church Street station is two blocks away (limited evening service — check return times).",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["Very top rows (the bowl runs tall)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid fare; hit the Church Street bars before and the rooftop Sky Bar inside.",
      nearbyPregame: ["Church Street Station bars", "Wall Street Plaza", "The Boheme (dinner)"],
    },
    fanTips: [
      "Magic tickets remain affordable for a rising team — buy before the breakout fully prices in.",
      "Listings still show Amway Center in older feeds — same building.",
      "Downtown Orlando (not the tourist corridor) — I-4 traffic from the parks takes longer than maps claim at rush hour."
    ],
    officialLinks: {
      website: "https://www.kiacenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "smoothie-king-center-new-orleans-la": {
    name: "Smoothie King Center",
    aliases: ["New Orleans Arena", "The Blender"],
    city: "New Orleans",
    state: "LA",
    summary: "Pelicans home next door to the Superdome in the CBD — 'The Blender' shares all the Dome's logistics with a fraction of the crowd.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Easygoing NOLA crowd that turns raucous when Zion-era basketball clicks",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Superdome garages serve both buildings; walkable from CBD hotels.",
      rideshare: "Poydras Street drops; easy by NOLA standards.",
      transit: "Streetcar lines through the CBD; most visitors walk from downtown/Quarter lodging.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "NOLA flavors inside, and the best food city in the league right outside.",
      nearbyPregame: ["Warehouse District restaurants", "Poydras bars", "French Quarter (15-min walk)"],
    },
    fanTips: [
      "Pelicans tickets are among the league's cheapest — great spontaneous outing when visiting NOLA.",
      "Mardi Gras season games come with parade street closures — check the krewe calendar.",
      "Saints home Sundays next door change all parking math; check the NFL slate."
    ],
    officialLinks: {
      website: "https://www.smoothiekingcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fedexforum-memphis-tn": {
    name: "FedExForum",
    aliases: ["FedEx Forum"],
    city: "Memphis",
    state: "TN",
    summary: "Grizzlies home one block off Beale Street — grit-and-grind culture with the best pregame street in the NBA outside the doors.",
    bestFor: ["NBA", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Chip-on-shoulder loud — Memphis identifies with this team hard",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Arena garage plus Beale-area lots; cheap by league standards.",
      rideshare: "Easy drops on Fourth Street.",
      transit: "MATA trolleys on Main Street a short walk away.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Memphis BBQ inside (Central BBQ presence) — and Rendezvous ribs two blocks away.",
      nearbyPregame: ["Beale Street", "Charlie Vergos' Rendezvous", "Ghost River taproom"],
    },
    fanTips: [
      "Memphis Tigers college games share the building and sell hot — check which team the listing is for.",
      "Grizzlies tickets are affordable; Beale Street makes it the best cheap night out in the league.",
      "Walk Main Street's trolley corridor postgame rather than waiting in the garage queue."
    ],
    officialLinks: {
      website: "https://www.fedexforum.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "toyota-center-houston-tx": {
    name: "Toyota Center",
    aliases: ["Toyota Center Houston"],
    city: "Houston",
    state: "TX",
    summary: "Rockets home in downtown Houston's southeast quadrant — an unflashy but comfortable arena walkable from the Main Street rail spine.",
    bestFor: ["NBA", "concerts"],
    atmosphere: {
      vibe: "Quiet baseline, loud ceiling — Houston shows up when the Rockets matter",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Tundra garage attached; downtown lots cheaper 3-4 blocks out.",
      rideshare: "Easy drops; downtown clears fast post-game.",
      transit: "METRORail Red/Purple/Green lines converge a few blocks west.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["Top behind-basket rows"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare plus Houston taco/BBQ stands; downtown's food scene is a short walk.",
      nearbyPregame: ["Discovery Green area", "Main Street bars", "EaDo breweries (short ride)"],
    },
    fanTips: [
      "Rockets rebuild-to-contender pricing is climbing — buy earlier each season.",
      "Toyota Center and Daikin Park (Astros) events overlap in October — check both schedules.",
      "Houston humidity makes even the walk from parking sweaty until November — dress accordingly."
    ],
    officialLinks: {
      website: "https://www.toyotacenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "frost-bank-center-san-antonio-tx": {
    name: "Frost Bank Center",
    aliases: ["AT&T Center", "SBC Center"],
    city: "San Antonio",
    state: "TX",
    summary: "Spurs home on the east side of San Antonio — a rodeo-sharing barn with a devoted crowd, likely to be replaced by a downtown arena in the coming years.",
    bestFor: ["NBA", "rodeo", "concerts"],
    atmosphere: {
      vibe: "Family-dynasty loyalty; the Wemby era re-electrified the building",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Big on-site lots — this is a drive-to arena; prepay for quicker exit lanes.",
      rideshare: "Designated zones; waits after big games run long.",
      transit: "VIA bus routes only; effectively car country.",
    },
    seating: {
      bestValueSections: ["Balcony center", "Lower corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Tex-Mex heavy and proud of it — brisket tacos are the move.",
      nearbyPregame: ["On-site lots", "Eastside spots on Houston St", "downtown/Pearl before driving out"],
    },
    fanTips: [
      "A downtown San Antonio arena is in the works — this building's Spurs era has a horizon (~2032 target).",
      "Wembanyama games price like playoff games — weekday non-marquee dates are the value.",
      "February rodeo weeks displace everything; the Spurs go on long road trips — check the schedule pattern."
    ],
    officialLinks: {
      website: "https://www.frostbankcenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "american-airlines-center-dallas-tx": {
    name: "American Airlines Center",
    aliases: ["AAC", "American Airlines Center Dallas"],
    city: "Dallas",
    state: "TX",
    summary: "Mavericks and Stars share this Victory Park anchor north of downtown Dallas — a handsome brick hangar with the DART rail a short walk away.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Corporate-polished with real playoff bite for both tenants",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Victory Park garages; prebook — event pricing is steep.",
      rideshare: "Victory Ave drops; postgame surge standard.",
      transit: "DART Green/Orange lines to Victory station, steps from the plaza.",
    },
    seating: {
      bestValueSections: ["Upper center", "Platinum corners"],
      avoidIfPossible: ["Upper behind-net rows for hockey (distance)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with Tex-Mex; Victory Park's restaurants surround the plaza.",
      nearbyPregame: ["Victory Park bars", "Happiest Hour", "Katy Trail Ice House (short walk)"],
    },
    fanTips: [
      "Stars games often run cheaper than Mavs for equivalent seats — hockey is the value ticket here.",
      "Mavs and Stars can play back-to-back nights; hotel + two-game weekends work well.",
      "Victory Park pregame gets crowded — Katy Trail Ice House a 10-minute walk north is the local escape."
    ],
    officialLinks: {
      website: "https://www.americanairlinescenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "madison-square-garden-new-york-ny": {
    name: "Madison Square Garden",
    aliases: ["MSG", "The Garden"],
    city: "New York",
    state: "NY",
    summary: "The world's most famous arena, above Penn Station in Midtown — Knicks and Rangers under the iconic ceiling, with the best transit access in sports.",
    bestFor: ["NBA", "NHL", "college basketball", "boxing", "concerts"],
    atmosphere: {
      vibe: "Celebrity-row theater for Knicks; Rangers crowds are the louder, saltier sibling",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Don't. Midtown garages run $50-80 on event nights.",
      rideshare: "Slower than the subway in Midtown, always.",
      transit: "It sits on top of Penn Station (LIRR, NJ Transit, Amtrak, subway 1/2/3/A/C/E) — unmatched.",
    },
    seating: {
      bestValueSections: ["200-level corners", "Upper bowl center"],
      avoidIfPossible: ["Obstructed rows flagged at checkout (older bowl quirks)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "NY-priced everything; eat in Koreatown (one block) or anywhere in Midtown first.",
      nearbyPregame: ["Koreatown (32nd St)", "Stout NYC", "The Pennsy-area spots"],
    },
    fanTips: [
      "Knicks and Rangers prices are top-3 in their leagues — St. John's college games are the budget way in.",
      "Playoff MSG is a bucket-list sports experience worth the premium once.",
      "Post-game, walk a few blocks before hailing anything — Penn district congestion is instant."
    ],
    officialLinks: {
      website: "https://www.msg.com/madison-square-garden",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "barclays-center-brooklyn-ny": {
    name: "Barclays Center",
    aliases: ["Barclays"],
    city: "Brooklyn",
    state: "NY",
    summary: "Nets home at Atlantic Terminal — the rusted-steel oculus building with nearly MSG-level transit access and Brooklyn's food scene around it.",
    bestFor: ["NBA", "WNBA", "boxing", "concerts"],
    atmosphere: {
      vibe: "Event-crowd cool for Nets; Liberty games bring the borough's loudest sports energy now",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Minimal — this venue assumes transit.",
      rideshare: "Flatbush/Atlantic drops are chaotic; the subway wins.",
      transit: "Atlantic Av–Barclays Ctr station (2/3/4/5/B/D/N/Q/R + LIRR) directly below.",
    },
    seating: {
      bestValueSections: ["Upper center", "Lower corners"],
      avoidIfPossible: ["Top rows behind baskets"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Brooklyn-vendor program (Junior's cheesecake, local slices) is better than standard arena fare.",
      nearbyPregame: ["Fifth Avenue (Park Slope) bars", "Dekalb Market Hall", "Fort Greene spots"],
    },
    fanTips: [
      "Liberty games are the hot ticket in this building now — buy WNBA earlier than you'd think.",
      "Nets non-marquee games are quietly one of NYC's cheapest pro tickets.",
      "Postgame, walk into Park Slope or Fort Greene instead of fighting Atlantic Terminal crowds."
    ],
    officialLinks: {
      website: "https://www.barclayscenter.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "td-garden-boston-ma": {
    name: "TD Garden",
    aliases: ["Boston Garden", "FleetCenter", "The Garden (Boston)"],
    city: "Boston",
    state: "MA",
    summary: "Celtics and Bruins over North Station — banner-saturated rafters, a compact loud bowl, and commuter rail literally beneath the seats.",
    bestFor: ["NBA", "NHL", "college hockey (Beanpot)", "concerts"],
    atmosphere: {
      vibe: "Championship-entitled and loud — both tenants' crowds punish mistakes and reward effort",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Garden garage is pricey; North End/Government Center garages a walk away.",
      rideshare: "Causeway Street is a crawl post-game; the T wins.",
      transit: "North Station (Orange/Green lines + commuter rail) is in the building.",
    },
    seating: {
      bestValueSections: ["Balcony center", "Loge corners"],
      avoidIfPossible: ["Balcony corners behind the net for hockey (angle)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Upgraded Hub Hall options downstairs; the North End's Italian food is a 5-minute walk.",
      nearbyPregame: ["The Fours' successors on Canal St", "North End (Regina, Neptune)", "Hub Hall"],
    },
    fanTips: [
      "Celtics and Bruins tickets both run top-5 expensive — the Beanpot (college hockey, February) is the atmospheric bargain.",
      "Same-day Celtics/Bruins flips happen — verify the sport on your ticket's date.",
      "Canal Street pregame bars hit capacity 90 minutes out — go earlier or eat in the North End."
    ],
    officialLinks: {
      website: "https://www.tdgarden.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "xfinity-mobile-arena-philadelphia-pa": {
    name: "Xfinity Mobile Arena",
    aliases: ["Wells Fargo Center", "Wachovia Center", "First Union Center", "CoreStates Center"],
    city: "Philadelphia",
    state: "PA",
    summary: "76ers and Flyers home in the South Philly sports complex (renamed from Wells Fargo Center in August 2025) — with the Sixers planning a move around 2031.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Philly hostile-passionate for both tenants; Flyers crowds are the old-school heart",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Sports-complex lots shared with the Linc and CBP.",
      rideshare: "Designated zones; the subway is faster.",
      transit: "SEPTA Broad Street Line to NRG station — direct from Center City.",
    },
    seating: {
      bestValueSections: ["Mezzanine center", "Lower corners"],
      avoidIfPossible: ["Upper behind-net rows for hockey"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Cheesesteak-and-crab-fries standard; Xfinity Live! across the lot for pre/post.",
      nearbyPregame: ["Xfinity Live!", "Chickie's & Pete's", "South Philly rowhouse bars on Oregon Ave"],
    },
    fanTips: [
      "Most listings and locals still say Wells Fargo Center — renamed Xfinity Mobile Arena in 2025.",
      "Check all four Philly teams' schedules — complex event stacking changes everything about arrival.",
      "Flyers tickets generally undercut Sixers for equivalent seats."
    ],
    officialLinks: {
      website: "https://www.xfinitymobilearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "capital-one-arena-washington-dc": {
    name: "Capital One Arena",
    aliases: ["Verizon Center", "MCI Center"],
    city: "Washington",
    state: "DC",
    summary: "Wizards and Capitals home in Chinatown/Gallery Place — mid-major renovation through 2027 after the teams committed to staying downtown, with Metro directly below.",
    bestFor: ["NBA", "NHL", "college basketball", "concerts"],
    atmosphere: {
      vibe: "Caps crowds ('Rock the Red') carry the building; Wizards games are quieter",
      noiseLevel: "High (NHL) / Medium (NBA)",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Gallery Place garages are pricey; Metro makes them unnecessary.",
      rideshare: "7th Street drops; Chinatown congestion post-game.",
      transit: "Metro Gallery Place-Chinatown (Red/Green/Yellow) exits into the building.",
    },
    seating: {
      bestValueSections: ["100-level corners", "400-level center"],
      avoidIfPossible: ["400-level behind-net top rows for hockey"],
      accessibilityNote: "Accessible seating on all levels; renovation may shift locations — verify at purchase."
    },
    foodAndDrink: {
      summary: "Improving with the renovation; Chinatown and Penn Quarter restaurants surround it.",
      nearbyPregame: ["Chinatown spots", "Penn Quarter bars", "The Wharf (pre-Metro ride)"],
    },
    fanTips: [
      "Renovation work (through ~2027) shifts entrances and closes concourse sections — read the event-day email.",
      "Caps tickets outdraw and outprice Wizards; Georgetown college games are the budget option.",
      "Gallery Place after games is crowded but the Metro swallows it fast — don't bother with a car."
    ],
    officialLinks: {
      website: "https://www.capitalonearena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "scotiabank-arena-toronto-on": {
    name: "Scotiabank Arena",
    aliases: ["Air Canada Centre", "ACC"],
    city: "Toronto",
    state: "ON",
    summary: "Raptors and Maple Leafs share Canada's busiest arena at Union Station — Jurassic Park plaza culture outside, hockey-cathedral pricing inside.",
    bestFor: ["NBA", "NHL", "concerts"],
    atmosphere: {
      vibe: "Leafs games are reverent and corporate low, loud up top; Raptors crowds are younger and rowdier",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown garages at premium prices; transit city logic applies.",
      rideshare: "Bay/Lakeshore drops crawl post-game.",
      transit: "Union Station (TTC subway, GO Transit, UP Express) connects underground via the PATH.",
    },
    seating: {
      bestValueSections: ["Upper center (300s)", "Lower corners (Raptors)"],
      avoidIfPossible: ["Upper behind-net rows for hockey"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid but pricey; the surrounding downtown core has everything within blocks.",
      nearbyPregame: ["Real Sports Bar (adjacent)", "St. Lawrence Market area", "King West"],
    },
    fanTips: [
      "Leafs tickets are the most expensive in the NHL — Raptors games are the affordable way into the building.",
      "US visitors: prices list in CAD — the exchange rate is a quiet discount.",
      "Maple Leaf Square ('Jurassic Park') playoff watch parties are free and legendary."
    ],
    officialLinks: {
      website: "https://www.scotiabankarena.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
