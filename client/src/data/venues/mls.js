// MLS soccer-specific stadiums (24). Six MLS clubs play in shared buildings
// covered elsewhere: Atlanta United (Mercedes-Benz), Charlotte FC (Bank of
// America), Chicago Fire (Soldier Field), New England (Gillette), Seattle
// (Lumen Field) in nfl.js; NYCFC (Yankee Stadium) in mlb.js.
// Inter Miami moved into Nu Stadium at Miami Freedom Park in April 2026.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const MLS_VENUES = {
  "america-first-field-sandy-ut": {
    name: "America First Field",
    aliases: ["Rio Tinto Stadium", "The RioT"],
    city: "Sandy",
    state: "UT",
    summary: "Real Salt Lake's home in Sandy with Wasatch Mountains rising behind the south end is one of MLS's original soccer-specific stadiums and still one of its best-set.",
    bestFor: ["MLS", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Believe-chanting RSL faithful; La Barra Real and the supporters' end keep it loud",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site and nearby business lots including the paid MACU Expo Center lot; exits onto State Street back up briefly.",
      rideshare: "Simple drops on State Street.",
      transit: "TRAX Blue Line to Sandy Expo station, a 10-minute walk.",
    },
    seating: {
      bestValueSections: ["West sideline uppers (mountain view)", "Corners near the supporters' end"],
      avoidIfPossible: ["East side at sunset (you face the sun over the valley)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard stadium fare with local touches; Sandy's chain corridor is nearby for pregame.",
      nearbyPregame: ["Bout Time Pub (Sandy)", "Lucky 13 (downtown, pre-TRAX)", "State Street spots"],
    },
    fanTips: [
      "Summer evening games with alpenglow on the Wasatch are the signature RSL experience.",
      "The supporters' south end is standing-and-drumming all match — sit near it for energy, away for calm.",
      "July/August afternoon games are hot and high-altitude — hydrate more than usual."
    ],
    officialLinks: {
      website: "https://www.rsl.com/americafirstfield",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "manual" }
  },

  "q2-stadium-austin-tx": {
    name: "Q2 Stadium",
    aliases: ["Q2"],
    city: "Austin",
    state: "TX",
    summary: "Austin FC's verde-and-black fortress in North Austin — sold out since day one, with the Violet Crown supporters setting one of MLS's best atmospheres.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "Full-throated from kickoff — Austin treats this as the city's team in a pro-sports-scarce town",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy covers most seats)"
    },
    arrival: {
      parking: "Limited on-site — the district around McKalla Place is still building out; prebook or transit.",
      rideshare: "Designated zones; surge after final whistle.",
      transit: "CapMetro Red Line's McKalla station is at the gates — built for the stadium.",
    },
    seating: {
      bestValueSections: ["Upper corners", "North end (calmer)"] ,
      avoidIfPossible: ["South end if you want to sit (standing culture)"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Austin-quality program — breakfast tacos, smoked meats, and deep local beer taps.",
      nearbyPregame: ["The Domain (10 min)", "Little Woodrow's Burnet", "food trucks near McKalla"],
    },
    fanTips: [
      "Sellouts are standard — resale is the realistic entry for most matches.",
      "Texas summer evening kickoffs are still 95°F+ at start; the canopy helps but hydrate.",
      "Verde smoke and the Q2 roar after goals are worth positioning near the south end once."
    ],
    officialLinks: {
      website: "https://www.austinfc.com/q2stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "tql-stadium-cincinnati-oh": {
    name: "TQL Stadium",
    aliases: ["West End Stadium"],
    city: "Cincinnati",
    state: "OH",
    summary: "FC Cincinnati's steep-banked West End cauldron — a canopy that traps noise, The Bailey's smoke-and-drums, and among the best soccer atmospheres in the country.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "Bundesliga-styled intensity — The Bailey's standing wall drives 90 minutes of noise",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over all seats)"
    },
    arrival: {
      parking: "West End lots and OTR garages; prebook for rivalry matches.",
      rideshare: "Central Parkway drops.",
      transit: "Cincinnati streetcar to Findlay Market/Brewery District stops, a short walk.",
    },
    seating: {
      bestValueSections: ["Upper corners", "East sideline uppers"],
      avoidIfPossible: ["The Bailey if you want to sit"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Cincinnati chili presence and solid local beer; OTR's food scene is the real star nearby.",
      nearbyPregame: ["Over-the-Rhine (Rhinegeist, Taft's)", "Findlay Market", "Washington Park"],
    },
    fanTips: [
      "Hell is Real derby (vs Columbus) is one of American soccer's best events — buy months early.",
      "The canopy means rain rarely ruins a match here.",
      "Rhinegeist's rooftop pre-match is the local institution."
    ],
    officialLinks: {
      website: "https://www.fccincinnati.com/tqlstadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "dicks-sporting-goods-park-commerce-city-co": {
    name: "Dick's Sporting Goods Park",
    aliases: ["DSG Park", "DSGP"],
    city: "Commerce City",
    state: "CO",
    summary: "Colorado Rapids' home northeast of Denver — an early-generation soccer-specific stadium surrounded by fields, with mountain views and a low-key crowd.",
    bestFor: ["MLS"],
    atmosphere: {
      vibe: "Mellow by MLS standards; Centennial 38 supporters carry the noise",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Large free-ish on-site lots — one of MLS's easiest parking situations.",
      rideshare: "Works, but it's a hike from Denver; budget the fare.",
      transit: "Limited — RTD buses only; effectively a driving venue.",
    },
    seating: {
      bestValueSections: ["West sideline", "Corners"],
      avoidIfPossible: ["East side at sunset (sun in eyes)"],
      accessibilityNote: "Accessible seating available; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Basic stadium fare; pregame in Denver/RiNo before driving out.",
      nearbyPregame: ["RiNo breweries (pre-drive)", "Bison grill spots on the way", "tailgate lots"],
    },
    fanTips: [
      "Rapids tickets are among MLS's cheapest — easy spontaneous soccer.",
      "Summer evening matches with mountain sunsets are the park at its best.",
      "The stadium anchors a huge youth-field complex — expect tournament traffic some weekends."
    ],
    officialLinks: {
      website: "https://www.coloradorapids.com/dsgpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lower-com-field-columbus-oh": {
    name: "Lower.com Field",
    aliases: ["New Crew Stadium", "Lower.com Field Columbus"],
    city: "Columbus",
    state: "OH",
    summary: "Columbus Crew's Astor Park home (2021) — the club that saved itself built one of MLS's best modern grounds, with the Nordecke supporters' corner in full voice.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "Save-the-Crew energy institutionalized — the Nordecke is among MLS's loudest corners",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Astor Park garages and Arena District overflow; prebook rivalry nights.",
      rideshare: "Nationwide Blvd drops.",
      transit: "COTA buses; walkable from the Arena District and downtown.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners near the Nordecke"],
      avoidIfPossible: ["Nordecke itself if you want to sit"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Columbus food-scene vendors; the Arena District and North Market are close.",
      nearbyPregame: ["Land-Grant Brewing", "North Market", "Arena District bars"],
    },
    fanTips: [
      "Hell is Real weekends (vs Cincinnati) are the calendar highlight — plan ahead.",
      "The Crew's trophy-era consistency keeps demand high; weeknight matches are the value entry.",
      "Historic Crew Stadium (the original 1999 ground) still hosts other events nearby — don't confuse venues."
    ],
    officialLinks: {
      website: "https://www.columbuscrew.com/lowerfield",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "toyota-stadium-frisco-tx": {
    name: "Toyota Stadium",
    aliases: ["FC Dallas Stadium", "Pizza Hut Park"],
    city: "Frisco",
    state: "TX",
    summary: "FC Dallas's Frisco home, mid-renovation to modernize the 2005-vintage ground — also hosts the National Soccer Hall of Fame behind the south goal.",
    bestFor: ["MLS", "college football (Frisco Bowl)", "international soccer"],
    atmosphere: {
      vibe: "Family-suburban with pockets of supporter noise; heat defines the calendar",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Ample on-site lots — a comfortable suburban drive-to venue.",
      rideshare: "Works fine; Frisco sprawl means real fares from Dallas.",
      transit: "None practical — drive.",
    },
    seating: {
      bestValueSections: ["West sideline", "Corners"],
      avoidIfPossible: ["East side for summer evening kickoffs (sun)"],
      accessibilityNote: "Accessible seating available; renovation may relocate sections — verify at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Frisco's restaurant sprawl (The Star nearby) covers pregame.",
      nearbyPregame: ["The Star district (Cowboys HQ)", "Frisco Square", "Tupps Brewery area (McKinney)"],
    },
    fanTips: [
      "The National Soccer Hall of Fame inside the south end is worth the add-on for soccer fans.",
      "Summer matches are brutal until sundown — night kickoffs only, June-September.",
      "FCD's academy pipeline means you're often watching future USMNT players early."
    ],
    officialLinks: {
      website: "https://www.fcdallas.com/toyotastadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "audi-field-washington-dc": {
    name: "Audi Field",
    aliases: ["Audi Field DC"],
    city: "Washington",
    state: "DC",
    summary: "D.C. United's Buzzard Point home near Nationals Park — a compact urban ground with the Screaming Eagles' end and the Anacostia waterfront developing around it.",
    bestFor: ["MLS", "NWSL"],
    atmosphere: {
      vibe: "District-diverse crowd; supporters' end keeps old RFK traditions alive",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Limited nearby garages — this is a transit/rideshare ground.",
      rideshare: "Potomac Ave drops standard.",
      transit: "Metro Green Line to Navy Yard-Ballpark or Waterfront, ~10-minute walk.",
    },
    seating: {
      bestValueSections: ["East sideline uppers", "Corners"],
      avoidIfPossible: ["North end if you want quiet"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "DC-vendor program (half-smokes, empanadas); Navy Yard's bars are the pregame.",
      nearbyPregame: ["Navy Yard (Bluejacket)", "The Wharf", "Buzzard Point spots as they open"],
    },
    fanTips: [
      "Spirit (NWSL) matches here draw big — check which team's fixture you're buying.",
      "Nats/United same-day events crowd the Green Line — check both schedules.",
      "Summer evening river breezes make this one of DC's more pleasant outdoor venues."
    ],
    officialLinks: {
      website: "https://www.dcunited.com/audifield",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "shell-energy-stadium-houston-tx": {
    name: "Shell Energy Stadium",
    aliases: ["BBVA Stadium", "BBVA Compass Stadium", "PNC Stadium"],
    city: "Houston",
    state: "TX",
    summary: "Houston Dynamo's orange-clad EaDo ground east of downtown — compact, loud when full, and part of the East Downtown bar district's rise.",
    bestFor: ["MLS", "NWSL", "college football"],
    atmosphere: {
      vibe: "El Batallón and Latino soccer culture give it real derby-night bite",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "EaDo lots and street options; cheaper than downtown proper.",
      rideshare: "Easy drops on Texas Ave.",
      transit: "METRORail Green/Purple lines stop at the stadium's corner (EaDo/Stadium station).",
    },
    seating: {
      bestValueSections: ["Upper corners", "West sideline"],
      avoidIfPossible: ["East side for summer evening kickoffs"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Tacos and micheladas done right; EaDo's breweries surround it.",
      nearbyPregame: ["8th Wonder Brewery", "Truck Yard Houston", "EaDo bar row"],
    },
    fanTips: [
      "Texas derby (vs FC Dallas/Austin) nights bring the building alive — target those.",
      "Dash (NWSL) matches share the ground — verify the fixture.",
      "Summer day matches are a genuine heat risk — evening only, May through September."
    ],
    officialLinks: {
      website: "https://www.houstondynamofc.com/shellenergystadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nu-stadium-miami-fl": {
    name: "Nu Stadium",
    aliases: ["Miami Freedom Park", "Miami Freedom Park Stadium"],
    city: "Miami",
    state: "FL",
    summary: "Inter Miami's brand-new home at Miami Freedom Park (opened April 2026) — a 26,700-seat ground by the airport anchoring a 131-acre park/retail district, built for the Messi era and beyond.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "Global-event glamour — the Messi effect makes every match a destination fixture",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site garages within the Freedom Park district; prebook — demand is global-tourist heavy.",
      rideshare: "Designated zones; expect surge after every match.",
      transit: "Near MIA airport transit connections; check current shuttle/Metrorail links as the district builds out.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End opposite supporters (calmer)"],
      avoidIfPossible: ["Nothing structural — pricing is the obstacle"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Miami-caliber food program in the stadium and the surrounding Freedom Park retail village.",
      nearbyPregame: ["Freedom Park district venues", "Wynwood (short ride)", "Doral spots"],
    },
    fanTips: [
      "As long as Messi plays, this is one of the toughest tickets in world sport — resale far above face is normal.",
      "The club moved here from Chase Stadium (Fort Lauderdale) in April 2026 — old listings may show the wrong venue.",
      "Summer afternoon storms are a Miami certainty — evening fixtures fare better."
    ],
    officialLinks: {
      website: "https://www.intermiamicf.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "dignity-health-sports-park-carson-ca": {
    name: "Dignity Health Sports Park",
    aliases: ["StubHub Center", "Home Depot Center"],
    city: "Carson",
    state: "CA",
    summary: "LA Galaxy's veteran Carson ground on the CSU Dominguez Hills campus — MLS's flagship stadium of the 2000s, still a great sightline venue with SoCal weather.",
    bestFor: ["MLS", "international soccer", "rugby"],
    atmosphere: {
      vibe: "Galaxy tradition (the league's old money) with the Riot Squad and Victoria Block supplying edge",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Big campus lots; prepay for El Tráfico and big matches.",
      rideshare: "Standard zones; Carson is car country.",
      transit: "Minimal — buses only; plan to drive.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["East side for late-afternoon kickoffs"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "SoCal standard with taco stands; nothing walkable outside — eat before driving.",
      nearbyPregame: ["Tailgate lots", "South Bay spots pre-drive", "Torrance breweries"],
    },
    fanTips: [
      "El Tráfico (vs LAFC) is the fixture — everything else is a relaxed evening.",
      "Galaxy history (Beckham-Zlatan-etc.) makes the stadium tour/plaza worth a look.",
      "Evening marine layer cools it fast — bring a layer even after hot days."
    ],
    officialLinks: {
      website: "https://www.dignityhealthsportspark.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bmo-stadium-los-angeles-ca": {
    name: "BMO Stadium",
    aliases: ["Banc of California Stadium", "Banc of California"],
    city: "Los Angeles",
    state: "CA",
    summary: "LAFC's black-and-gold Exposition Park fortress — the 3252 supporters' wall, a design-forward bowl, and the loudest sustained soccer atmosphere on the West Coast.",
    bestFor: ["MLS", "NWSL", "international soccer", "concerts"],
    atmosphere: {
      vibe: "The 3252's drum-and-flag wall never sits, never stops — a top-2 MLS atmosphere",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Exposition Park lots shared with the Coliseum and museums; prebook.",
      rideshare: "Figueroa drops; Expo Line beats it.",
      transit: "Metro E (Expo) Line to Expo Park/USC station, a short walk.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "South corners"],
      avoidIfPossible: ["North end unless you're standing with the 3252"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "LA-quality vendors (birria, elote, craft beer) — one of MLS's best food programs.",
      nearbyPregame: ["Exposition Park lawns", "USC Village spots", "Mercado La Paloma (10-min walk, elite)"],
    },
    fanTips: [
      "Mercado La Paloma pregame is the local secret — some of LA's best food two blocks away.",
      "El Tráfico at BMO is the hottest ticket in MLS — buy early or pay heavily.",
      "Angel City FC (NWSL) shares the ground with big crowds — verify the fixture."
    ],
    officialLinks: {
      website: "https://www.bmostadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "allianz-field-saint-paul-mn": {
    name: "Allianz Field",
    aliases: ["The Loons' Nest"],
    city: "Saint Paul",
    state: "MN",
    summary: "Minnesota United's shimmering wing-clad ground in the Midway — the Wonderwall supporters' end and a stainless-mesh facade that glows on match nights.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "The Wonderwall's post-win Oasis singalong is one of MLS's best traditions",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over all seats)"
    },
    arrival: {
      parking: "Midway lots are limited — the club pushes transit hard.",
      rideshare: "Snelling Ave drops.",
      transit: "Green Line LRT to Snelling Avenue station, one block away.",
    },
    seating: {
      bestValueSections: ["Upper corners", "West sideline"],
      avoidIfPossible: ["Wonderwall if you want to sit"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Strong local program with Minnesota craft taps; the Midway's options keep growing.",
      nearbyPregame: ["Black Hart of St. Paul (the soccer bar)", "Allianz-adjacent beer hall", "University Ave spots"],
    },
    fanTips: [
      "Stay for Wonderwall after wins — the crowd sings the whole song, every time.",
      "Early/late-season matches are cold; the canopy blocks rain, not Minnesota.",
      "Loons tickets are mid-priced MLS with genuine atmosphere — good value overall."
    ],
    officialLinks: {
      website: "https://www.mnufc.com/allianzfield",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "stade-saputo-montreal-qc": {
    name: "Stade Saputo",
    aliases: ["Saputo Stadium"],
    city: "Montreal",
    state: "QC",
    summary: "CF Montréal's home next to the Olympic Stadium — a European-feeling ground with bilingual chants and Ultras Montréal driving the east end.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "French-inflected ultra culture — flags, flares (occasionally), and continental songcraft",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Olympic Park garages; straightforward.",
      rideshare: "Sherbrooke Est drops.",
      transit: "Métro Green Line to Pie-IX or Viau, both a short walk.",
    },
    seating: {
      bestValueSections: ["West sideline (tower view)", "Corners"],
      avoidIfPossible: ["East end unless joining the ultras"],
      accessibilityNote: "Accessible seating available; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard fare with Québécois touches; Hochelaga's restaurants line Ontario Street nearby.",
      nearbyPregame: ["Rue Ontario Est spots", "Marché Maisonneuve", "Plateau pre-Métro"],
    },
    fanTips: [
      "Early-season (Feb-Apr) matches move indoors to Olympic Stadium when it's freezing — check the venue on your ticket.",
      "CAD pricing is friendly for US visitors.",
      "The 1642MTL/Ultras end delivers the atmosphere — sit near, not in, for the best of both."
    ],
    officialLinks: {
      website: "https://www.cfmontreal.com/en/stade-saputo",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "geodis-park-nashville-tn": {
    name: "Geodis Park",
    aliases: ["Nashville SC Stadium"],
    city: "Nashville",
    state: "TN",
    summary: "The largest soccer-specific stadium in the US (30,000) at the Fairgrounds — Nashville SC's gold wall and The Backline supporters giving it real voice.",
    bestFor: ["MLS", "international soccer", "concerts"],
    atmosphere: {
      vibe: "Big-bowl soccer with honky-tonk energy imported from Broadway",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "Fairgrounds lots; prebook — the neighborhood streets are permit-tight.",
      rideshare: "Designated zones off Nolensville Pike.",
      transit: "WeGo buses along Nolensville Pike; mostly a driving venue.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["The Backline end if you want to sit"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Hot chicken and local brews — a solid Nashville-flavored program.",
      nearbyPregame: ["Nolensville Pike's international food row (elite, underrated)", "12 South", "Plaza Mariachi"],
    },
    fanTips: [
      "Nolensville Pike pregame (Kurdish, Mexican, Vietnamese) is Nashville's best-kept food secret.",
      "Summer evening matches still start hot — the canopy helps once the sun drops.",
      "NSC tickets are reasonable; big-name visitors (Messi) reprice the building overnight."
    ],
    officialLinks: {
      website: "https://www.nashvillesc.com/geodispark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "sports-illustrated-stadium-harrison-nj": {
    name: "Sports Illustrated Stadium",
    aliases: ["Red Bull Arena", "SI Stadium"],
    city: "Harrison",
    state: "NJ",
    summary: "The Red Bulls' Harrison ground (renamed from Red Bull Arena in 2025) — still one of America's best pure soccer venues, one PATH stop from Newark and 20 minutes from Manhattan.",
    bestFor: ["MLS", "NWSL", "international soccer"],
    atmosphere: {
      vibe: "South Ward loyalists in a European-style shed; Gotham FC matches add NWSL star power",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over all seats)"
    },
    arrival: {
      parking: "Harrison garages next door; fine but the PATH is better.",
      rideshare: "Frank E. Rodgers Blvd drops.",
      transit: "PATH to Harrison station, a 5-minute walk — direct from WTC.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["South Ward if you want to sit"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard-plus fare; Newark's Ironbound is one PATH stop or a walk over the bridge.",
      nearbyPregame: ["Ironbound district (Ferry St)", "Harrison's growing apartment-district spots", "Tops Diner (legendary)"],
    },
    fanTips: [
      "Listings may still say Red Bull Arena — renamed Sports Illustrated Stadium (13-year deal).",
      "Gotham FC (NWSL) shares the ground — check the fixture.",
      "Hudson River Derby (vs NYCFC) is the match to target."
    ],
    officialLinks: {
      website: "https://www.newyorkredbulls.com/sistadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "inter-co-stadium-orlando-fl": {
    name: "Inter&Co Stadium",
    aliases: ["Exploria Stadium", "Orlando City Stadium"],
    city: "Orlando",
    state: "FL",
    summary: "Orlando City's purple Parramore ground downtown — The Wall's standing end, Pride matches, and one of MLS's better urban-stadium settings.",
    bestFor: ["MLS", "NWSL", "international soccer"],
    atmosphere: {
      vibe: "Purple smoke and Latin-inflected supporter culture; Pride crowds add NWSL heat",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "Downtown garages a few blocks east; church-lot options nearby.",
      rideshare: "Church Street drops.",
      transit: "SunRail to Church Street (weekday service caveats); LYMMO downtown circulator.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["The Wall if you want a seat (it has none)"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Solid Florida-Latin program; Church Street's bars are blocks away.",
      nearbyPregame: ["Church Street Station", "Wall Street Plaza", "The Milk District (short ride)"],
    },
    fanTips: [
      "Summer storms hit like clockwork at 5pm — the canopy handles most of it, but arrive dry.",
      "Pride (NWSL) matches here have championship pedigree and real crowds — worth targeting.",
      "It's genuinely downtown — pair with an evening out, unlike most Florida venues."
    ],
    officialLinks: {
      website: "https://www.orlandocitysc.com/stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "subaru-park-chester-pa": {
    name: "Subaru Park",
    aliases: ["Talen Energy Stadium", "PPL Park"],
    city: "Chester",
    state: "PA",
    summary: "Philadelphia Union's riverside ground under the Commodore Barry Bridge — the Sons of Ben's River End and Delaware River sunsets, 30 minutes south of Philly.",
    bestFor: ["MLS"],
    atmosphere: {
      vibe: "Sons of Ben bring Philly edge to a scenic riverside bowl",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site lots are the default — Chester is a driving destination.",
      rideshare: "Works; fares from Philly add up.",
      transit: "SEPTA Wilmington/Newark line to Highland Ave + a walk/shuttle — limited but exists.",
    },
    seating: {
      bestValueSections: ["East sideline", "Corners"],
      avoidIfPossible: ["River End if you want to sit"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Philly staples (cheesesteaks, soft pretzels) done respectably.",
      nearbyPregame: ["Tailgate lots", "Media, PA spots pre-drive", "South Philly before the ride"],
    },
    fanTips: [
      "The Union's homegrown pipeline means young-star sightings before they're sold to Europe.",
      "Sunset over the Commodore Barry Bridge is the stadium's postcard — west-facing seats get it.",
      "Union tickets are among the best atmosphere-per-dollar buys in the league."
    ],
    officialLinks: {
      website: "https://www.philadelphiaunion.com/subarupark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "providence-park-portland-or": {
    name: "Providence Park",
    aliases: ["Jeld-Wen Field", "PGE Park", "Civic Stadium"],
    city: "Portland",
    state: "OR",
    summary: "A 1926 ground rebuilt into America's best soccer venue — the Timbers Army's north end, log slabs for goals, and a downtown Portland location with MAX at the door.",
    bestFor: ["MLS", "NWSL"],
    atmosphere: {
      vibe: "The Timbers Army is the American gold standard — 90 minutes of coordinated noise; Thorns crowds are the NWSL's benchmark",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (covered on most sides)"
    },
    arrival: {
      parking: "Minimal — a deliberately transit-first venue in a neighborhood.",
      rideshare: "Burnside drops; MAX is right there.",
      transit: "MAX Blue/Red to Providence Park station, at the gate.",
    },
    seating: {
      bestValueSections: ["East side uppers (the 2019 addition)", "South corners"],
      avoidIfPossible: ["North end unless standing with the Army"],
      accessibilityNote: "Historic structure — accessible seating exists but verify specific sections at purchase."
    },
    foodAndDrink: {
      summary: "Portland food-cart quality inside; the surrounding blocks are all bars and restaurants.",
      nearbyPregame: ["Goose Hollow Inn (the classic)", "21st Ave bars", "downtown breweries"],
    },
    fanTips: [
      "Timbers and Thorns matches both sell strong — this is a two-team soccer city like nowhere else in the US.",
      "Watch for Timber Joey cutting the log slab after goals — the league's best tradition.",
      "Rain is ambient here; most seats are covered and nobody cares."
    ],
    officialLinks: {
      website: "https://www.timbers.com/providencepark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "snapdragon-stadium-san-diego-ca": {
    name: "Snapdragon Stadium",
    aliases: ["SDSU Mission Valley Stadium"],
    city: "San Diego",
    state: "CA",
    summary: "San Diego FC's home (and SDSU football's) in Mission Valley — a 2022-built 35k stadium with trolley access and the expansion club's instant sellout culture.",
    bestFor: ["MLS", "college football", "NWSL", "rugby"],
    atmosphere: {
      vibe: "New-club enthusiasm meets San Diego chill; Aztecs Saturdays bring the college edge",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Mission Valley lots; prebook for SDFC matches.",
      rideshare: "Friars Road drops.",
      transit: "San Diego Trolley Green Line to Stadium station, at the gate.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["East side for late-afternoon kickoffs"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "San Diego craft beer and taco program worthy of the city.",
      nearbyPregame: ["Mission Valley spots", "North Park breweries (pre-trolley)", "Old Town (trolley line)"],
    },
    fanTips: [
      "SDFC's debut seasons sold out regularly — treat tickets as advance purchases.",
      "SDSU football, Wave FC, and rugby share the calendar — verify which event you're buying.",
      "San Diego evenings cool fast — a light layer even after warm days."
    ],
    officialLinks: {
      website: "https://www.snapdragonstadium.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "paypal-park-san-jose-ca": {
    name: "PayPal Park",
    aliases: ["Avaya Stadium", "Earthquakes Stadium"],
    city: "San Jose",
    state: "CA",
    summary: "San Jose Earthquakes' compact ground by the airport — Europe's steep-stand feel, the giant outdoor bar behind the north goal, and Quakes history running back to the NASL.",
    bestFor: ["MLS", "NWSL", "international soccer"],
    atmosphere: {
      vibe: "Intimate and steep — the 1906 Ultras bring noise disproportionate to capacity",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "On-site lots; airport-adjacent access is straightforward.",
      rideshare: "Coleman Ave drops.",
      transit: "Caltrain/ACE to Santa Clara station + a walk; VTA buses on Coleman.",
    },
    seating: {
      bestValueSections: ["Upper rows anywhere (still close)", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Solid Bay Area program; the outfield bar claims to be North America's longest.",
      nearbyPregame: ["The north-end bar itself", "Santana Row (15 min)", "downtown San Jose"],
    },
    fanTips: [
      "Cali Clásico vs the Galaxy — especially the annual Stanford Stadium edition — is the fixture to know.",
      "Airport flight paths overhead are part of the venue's character.",
      "Quakes tickets are Bay Area's cheapest pro soccer by far."
    ],
    officialLinks: {
      website: "https://www.sjearthquakes.com/paypalpark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "childrens-mercy-park-kansas-city-ks": {
    name: "Children's Mercy Park",
    aliases: ["Sporting Park", "Livestrong Sporting Park"],
    city: "Kansas City",
    state: "KS",
    summary: "Sporting KC's Village West ground — the 2011 stadium that set MLS's modern standard, with the Cauldron's noise and the Legends district around it.",
    bestFor: ["MLS", "international soccer"],
    atmosphere: {
      vibe: "The Cauldron's sustained noise in a compact, canopy-topped bowl — a soccer-first city block",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "Big Village West lots shared with the Legends district.",
      rideshare: "Standard zones; it's a highway-junction location.",
      transit: "Minimal — drive; it's in Kansas City, Kansas at the speedway junction.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["Cauldron end if you want to sit"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "KC BBQ presence; the Legends outlets and restaurants surround the lot.",
      nearbyPregame: ["The Legends district", "Yard House", "BBQ in KCMO before the drive"],
    },
    fanTips: [
      "SKC's long sellout heritage faded — good seats are gettable most matches now.",
      "Combine with the speedway/Legends complex for a full-day outing with kids.",
      "Evening thunderstorm season (May-June) is real; the canopy earns its keep."
    ],
    officialLinks: {
      website: "https://www.sportingkc.com/childrensmercypark",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "energizer-park-st-louis-mo": {
    name: "Energizer Park",
    aliases: ["CityPark", "CITYPARK", "St. Louis City Stadium"],
    city: "St. Louis",
    state: "MO",
    summary: "St. Louis City SC's downtown-west ground (renamed from CityPark in 2024) — a sunken pitch, curated local-only food program, and a fanbase that sold the place out from day one.",
    bestFor: ["MLS"],
    atmosphere: {
      vibe: "Soccer-heritage city finally given its team — the CITY Faithful end never sits",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (canopy over most seats)"
    },
    arrival: {
      parking: "Downtown-west garages; Union Station decks a short walk.",
      rideshare: "Market Street drops.",
      transit: "MetroLink to Union Station, a 5-10 minute walk.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Corners"],
      avoidIfPossible: ["North end if you want to sit"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "All-local vendor policy (Balkan Treat Box, Steve's Hot Dogs) — a top-3 MLS food program.",
      nearbyPregame: ["Union Station", "Schlafly Tap Room", "The Grove (short ride)"],
    },
    fanTips: [
      "Listings may still say CityPark — renamed Energizer Park in 2024.",
      "The local-only food program is genuinely worth arriving hungry for.",
      "Sellout culture persists — buy ahead rather than gambling on walk-up."
    ],
    officialLinks: {
      website: "https://www.stlcitysc.com/stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bmo-field-toronto-on": {
    name: "BMO Field",
    aliases: ["Exhibition Stadium site", "BMO Field Toronto"],
    city: "Toronto",
    state: "ON",
    summary: "Toronto FC's lakeside ground at Exhibition Place — the south end's flag-waving culture, Lake Ontario behind, and a 2026 World Cup host venue.",
    bestFor: ["MLS", "international soccer", "CFL"],
    atmosphere: {
      vibe: "TFC's supporters set MLS's early standard — still loud, banner-heavy, and bilingual in song",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor (partial roof over sides)"
    },
    arrival: {
      parking: "Exhibition Place lots; event pricing on big days.",
      rideshare: "Princes' Blvd drops.",
      transit: "GO Transit's Exhibition station and the 509/511 streetcars serve the grounds directly.",
    },
    seating: {
      bestValueSections: ["East sideline uppers", "North end"],
      avoidIfPossible: ["South end if you want calm"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Improved with World Cup-era upgrades; Liberty Village's bars are a walk away.",
      nearbyPregame: ["Liberty Village", "King West", "Ossington strip (short ride)"],
    },
    fanTips: [
      "The 2026 World Cup expansion work upgraded capacity and facilities — the building is at its best.",
      "Lake wind makes spring/fall evenings colder than forecast — layer.",
      "Canadian Classique vs CF Montréal is the derby to target."
    ],
    officialLinks: {
      website: "https://www.bmofield.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bc-place-vancouver-bc": {
    name: "BC Place",
    aliases: ["BC Place Stadium"],
    city: "Vancouver",
    state: "BC",
    summary: "Whitecaps home downtown under the world's largest cable-supported retractable roof — a 2026 World Cup host with SkyTrain at the door and mountains out every gate.",
    bestFor: ["MLS", "international soccer", "CFL", "concerts"],
    atmosphere: {
      vibe: "Big-building soccer — the Southsiders concentrate the noise; internationals fill it properly",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Retractable roof"
    },
    arrival: {
      parking: "Downtown garages at Vancouver prices; transit wins.",
      rideshare: "Terry Fox Plaza drops.",
      transit: "SkyTrain to Stadium–Chinatown, steps away.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners near the Southsiders"],
      avoidIfPossible: ["Upper deck when open but sparse (energy thins)"],
      accessibilityNote: "Accessible seating on all levels; check the venue map before buying."
    },
    foodAndDrink: {
      summary: "Standard stadium fare; Yaletown and Chinatown surround it with better options.",
      nearbyPregame: ["Yaletown", "The Pint", "Rogers Arena-shared bar row"],
    },
    fanTips: [
      "The roof means weather never cancels — rare and valuable in Vancouver.",
      "Cascadia derbies (Seattle, Portland) are the crowd-filling fixtures.",
      "CAD pricing helps US visitors; internationals and World Cup legacy events sell fastest."
    ],
    officialLinks: {
      website: "https://www.bcplace.com/",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
