// ACC football stadiums + Notre Dame (independent). Miami plays at Hard Rock
// Stadium and Pitt at Acrisure Stadium — both already in nfl.js as shared
// venues (bestFor includes college football), so they are omitted here.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const CFB_ACC_VENUES = {
  "alumni-stadium-chestnut-hill-ma": {
    name: "Alumni Stadium",
    aliases: ["BC Alumni Stadium"],
    city: "Chestnut Hill",
    state: "MA",
    summary: "Boston College's compact 44,000-seat home on a leafy suburban campus — the smallest Power 4 stadium in the Northeast, with T access and a genuine college-town feel inside a big city.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Superfans-driven and intimate; the closeness makes it loud when BC is bowling",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Very limited campus parking — the school pushes the T hard.",
      rideshare: "Commonwealth Ave drops, then a campus walk.",
      transit: "MBTA Green Line B branch to Boston College terminus, at the campus edge.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Cleveland Circle and Chestnut Hill spots carry pregame.",
      nearbyPregame: ["Mary Ann's (the classic BC bar)", "Cleveland Circle", "Roggie's"],
    },
    fanTips: [
      "Late-season games are cold New England affairs — dress for November on the T platform too.",
      "The Holy War vs Notre Dame is the marquee draw when scheduled.",
      "BC tickets are among the ACC's easier gets outside marquee visitors."
    ],
    officialLinks: {
      website: "https://bceagles.com/facilities/alumni-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "california-memorial-stadium-berkeley-ca": {
    name: "California Memorial Stadium",
    aliases: ["Memorial Stadium Berkeley", "Cal Memorial Stadium"],
    city: "Berkeley",
    state: "CA",
    summary: "Cal's 1923 stadium in the Berkeley hills, straddling the Hayward Fault — Tightwad Hill's free view above the rim and San Francisco Bay panoramas from the west stands.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Bay Area laid-back with real bite for Big Game week vs Stanford",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Scarce campus/hill parking — BART is the answer.",
      rideshare: "Piedmont Ave drops and a climb.",
      transit: "BART to Downtown Berkeley + a 15-minute uphill walk.",
    },
    seating: {
      bestValueSections: ["West uppers (Bay view)", "Corners"],
      avoidIfPossible: ["Low rows midfield (shallow historic bowl)"],
      accessibilityNote: "Retrofitted 1923 stadium; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Berkeley's food scene (Gourmet Ghetto) is a short trip.",
      nearbyPregame: ["Telegraph Ave spots", "Triple Rock Brewery", "Gourmet Ghetto (North Berkeley)"],
    },
    fanTips: [
      "Look up at Tightwad Hill — the free-viewing tradition above the stadium is pure Berkeley.",
      "The Big Game vs Stanford (the Axe) is the fixture that matters most.",
      "Bay fog can roll in fast for night games — bring a layer even after a warm day."
    ],
    officialLinks: {
      website: "https://calbears.com/facilities/california-memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "memorial-stadium-clemson-sc": {
    name: "Memorial Stadium (Clemson)",
    aliases: ["Death Valley (Clemson)", "Clemson Memorial Stadium", "Frank Howard Field"],
    city: "Clemson",
    state: "SC",
    summary: "Death Valley — Clemson's 81,000-seat cathedral where players rub Howard's Rock and run down the hill, one of college football's most iconic entrances.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Orange-soaked and thunderous; the pregame hill run detonates the crowd",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Vast grass lots around the small town; everything is a tailgate field.",
      rideshare: "Thin market — Clemson is rural; plan your own driving.",
      transit: "CATbus gameday shuttles from remote lots.",
    },
    seating: {
      bestValueSections: ["Upper corners", "West uppers"],
      avoidIfPossible: ["Low rows far from the hill if you want to see the entrance"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare inside; the tailgate spreads and downtown Clemson carry the day.",
      nearbyPregame: ["Field tailgates (the main event)", "Esso Club (institution)", "downtown Clemson"],
    },
    fanTips: [
      "Be seated 15 minutes before kickoff for the Howard's Rock touch and hill run — the best entrance in the sport.",
      "The Esso Club is a required pregame stop.",
      "Clemson-South Carolina (Palmetto Bowl) and marquee ACC visits reprice the whole town."
    ],
    officialLinks: {
      website: "https://clemsontigers.com/facilities/memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "wallace-wade-stadium-durham-nc": {
    name: "Wallace Wade Stadium",
    aliases: ["Duke Stadium"],
    city: "Durham",
    state: "NC",
    summary: "Duke's football home on West Campus — a Gothic-adjacent bowl that once hosted a Rose Bowl (1942), still modest but energized in the program's better years.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Basketball-school football that peaks for ranked seasons; intimate scale",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "West Campus lots; manageable by ACC standards.",
      rideshare: "Science Drive drops.",
      transit: "GoDurham + Duke gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Durham's excellent food scene (a real one) is minutes away.",
      nearbyPregame: ["Brightleaf/downtown Durham", "Fullsteam Brewery", "American Tobacco Campus"],
    },
    fanTips: [
      "Combine a football Saturday with Durham's food scene — one of the South's best.",
      "Tickets are among the ACC's easiest and cheapest gets.",
      "The historic 1942 Rose Bowl plaque (the only one played outside Pasadena) is a fun bit of trivia on-site."
    ],
    officialLinks: {
      website: "https://goduke.com/facilities/wallace-wade-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "doak-campbell-stadium-tallahassee-fl": {
    name: "Doak Campbell Stadium",
    aliases: ["Doak Campbell", "Bobby Bowden Field"],
    city: "Tallahassee",
    state: "FL",
    summary: "Florida State's brick-clad 79,000-seat home — Osceola and Renegade planting the flaming spear at midfield, and the War Chant echoing off the largest continuous brick structure in the US.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "War Chant tomahawk-chop fervor; night games in Tallahassee are genuinely intimidating",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus and neighborhood lots; Tallahassee funnels on gameday.",
      rideshare: "Pensacola Street drops.",
      transit: "StarMetro gameday services.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["West lowers for September afternoon sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the Madison Social/College Town district is the modern pregame hub.",
      nearbyPregame: ["College Town district", "Madison Social", "tailgate lots"],
    },
    fanTips: [
      "The flaming-spear plant at midfield before kickoff is unmissable — get seated early.",
      "Florida heat means night games are the comfortable choice through October.",
      "FSU-Miami and FSU-Florida reprice the whole schedule."
    ],
    officialLinks: {
      website: "https://seminoles.com/facilities/doak-campbell-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bobby-dodd-stadium-atlanta-ga": {
    name: "Bobby Dodd Stadium",
    aliases: ["Bobby Dodd Stadium at Hyundai Field", "Grant Field", "Historic Grant Field"],
    city: "Atlanta",
    state: "GA",
    summary: "Georgia Tech's home on Grant Field — the oldest on-campus stadium in FBS (1913), tucked into Midtown Atlanta with skyline views over the north end.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Old-school engineering-school pride in a modern city; the Ramblin' Wreck leads the team out",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Tech campus decks and Midtown garages; MARTA makes them optional.",
      rideshare: "Techwood Drive drops.",
      transit: "MARTA to Midtown or North Avenue stations, both a walk away.",
    },
    seating: {
      bestValueSections: ["Upper corners", "North (skyline view)"],
      avoidIfPossible: ["West lowers for afternoon sun early season"],
      accessibilityNote: "Historic stadium with retrofits; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Midtown and Tech Square restaurants are steps away.",
      nearbyPregame: ["Tech Square", "Midtown bars", "Antico Pizza (nearby institution)"],
    },
    fanTips: [
      "Watch for the Ramblin' Wreck (the 1930 Ford) leading the team out — the school's beloved mascot-car.",
      "'Clean, Old-Fashioned Hate' vs Georgia is the rivalry ticket.",
      "The Midtown location makes it the most walkable-from-a-city ACC stadium."
    ],
    officialLinks: {
      website: "https://ramblinwreck.com/facilities/bobby-dodd-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "ln-federal-credit-union-stadium-louisville-ky": {
    name: "L&N Federal Credit Union Stadium",
    aliases: ["Cardinal Stadium", "Papa John's Cardinal Stadium", "L&N Stadium"],
    city: "Louisville",
    state: "KY",
    summary: "Louisville's home (renamed from Cardinal Stadium in 2023) on the south end of campus — a modern 60,000-seat bowl with strong tailgating and Cardinal-red intensity.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Card-red loud when ranked; the ACC move raised the profile of home Saturdays",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Fairgrounds and campus lots — ample by ACC standards.",
      rideshare: "Central Ave drops.",
      transit: "TARC gameday services.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["West lowers for afternoon September sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Louisville's bourbon-and-food scene downtown handles the rest.",
      nearbyPregame: ["Old Louisville spots", "NuLu district (downtown)", "tailgate lots"],
    },
    fanTips: [
      "Listings may still say Cardinal Stadium — renamed L&N Federal Credit Union Stadium in 2023.",
      "The Governor's Cup vs Kentucky is the rivalry to target.",
      "Pair with a bourbon-trail day — Louisville is the gateway."
    ],
    officialLinks: {
      website: "https://gocards.com/facilities/l-n-federal-credit-union-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kenan-memorial-stadium-chapel-hill-nc": {
    name: "Kenan Memorial Stadium",
    aliases: ["Kenan Stadium"],
    city: "Chapel Hill",
    state: "NC",
    summary: "North Carolina's tree-ringed stadium — one of the sport's prettiest settings, tucked into a pine grove on a classic Southern campus, with the Bell Tower nearby.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Carolina-blue relaxed; big-visitor days and the Bill Belichick-era spotlight raised the volume",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots and park-and-rides; Chapel Hill compresses on gamedays.",
      rideshare: "South Road drops.",
      transit: "Chapel Hill Transit (fare-free) plus gameday routes.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Franklin Street's college-town strip is the pregame.",
      nearbyPregame: ["Franklin Street", "Top of the Hill", "He's Not Here (the blue-cup bar)"],
    },
    fanTips: [
      "Franklin Street pregame is a classic college-town scene — do it.",
      "The stadium's pine-grove setting is genuinely among the prettiest in the sport.",
      "UNC-NC State and UNC-Duke football carry local weight; tickets are otherwise easy."
    ],
    officialLinks: {
      website: "https://goheels.com/facilities/kenan-memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "carter-finley-stadium-raleigh-nc": {
    name: "Carter-Finley Stadium",
    aliases: ["Carter Finley Stadium"],
    city: "Raleigh",
    state: "NC",
    summary: "NC State's home next to Lenovo Center (the Hurricanes' arena) — a shared parking-lot tailgate empire and a red-clad, cowbell-adjacent Wolfpack crowd.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Wolfpack red and rowdy; the shared complex creates one of the ACC's biggest tailgate scenes",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Vast lots shared with Lenovo Center — enormous tailgate real estate.",
      rideshare: "Trinity Road drops.",
      transit: "GoRaleigh gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["East lowers for afternoon September sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the lots and downtown Raleigh carry the day.",
      nearbyPregame: ["Complex tailgate lots", "Backyard Bistro", "downtown Raleigh (Glenwood South)"],
    },
    fanTips: [
      "Wolfpack fans ring cowbells (like their MSU cousins) — expect the metallic soundtrack.",
      "Check the Hurricanes' schedule — shared-complex event overlap changes parking math.",
      "NC State-North Carolina is the rivalry with real local stakes."
    ],
    officialLinks: {
      website: "https://gopack.com/facilities/carter-finley-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "gerald-j-ford-stadium-university-park-tx": {
    name: "Gerald J. Ford Stadium",
    aliases: ["Ford Stadium", "SMU Stadium"],
    city: "University Park",
    state: "TX",
    summary: "SMU's intimate 32,000-seat stadium in affluent University Park — the Mustangs' ACC arrival brought new juice to a small, moneyed, walkable venue near downtown Dallas.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Boulevard tailgate elegance meets rising-program energy after the ACC move and playoff push",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus and Park Cities garages; tight neighborhood streets.",
      rideshare: "Mockingbird Lane drops.",
      transit: "DART Red/Blue to Mockingbird station, a walk from campus.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["East lowers for September afternoon sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the Boulevard tailgate and nearby Snider Plaza handle pregame.",
      nearbyPregame: ["The Boulevard (campus tailgate)", "Snider Plaza", "Mockingbird Station spots"],
    },
    fanTips: [
      "At 32k, marquee ACC visitors sell out fast — small-stadium scarcity is real.",
      "The Boulevard tailgate skews upscale — it's a scene worth arriving early for.",
      "SMU's playoff-era rise repriced tickets; buy ahead for big games."
    ],
    officialLinks: {
      website: "https://smumustangs.com/facilities/gerald-j-ford-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "stanford-stadium-stanford-ca": {
    name: "Stanford Stadium",
    aliases: ["Stanford Stadium Palo Alto"],
    city: "Stanford",
    state: "CA",
    summary: "Stanford's rebuilt 50,000-seat bowl on the Farm — a low, intimate stadium in Silicon Valley, home of the Axe rivalry with Cal and the irreverent Stanford Band.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Tech-campus mellow; the Band's chaos and Big Game week supply the edge",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Ample campus lots and fields — one of the easier P4 parking situations.",
      rideshare: "Galvez Street drops.",
      transit: "Caltrain to Palo Alto + a walk/shuttle; bike culture is strong.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["East lowers for afternoon September kicks"],
      accessibilityNote: "Rebuilt ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Palo Alto's University Avenue is a short trip.",
      nearbyPregame: ["University Avenue (Palo Alto)", "Town & Country Village", "campus tailgates"],
    },
    fanTips: [
      "The Big Game vs Cal (for the Stanford Axe) is the fixture — everything else is relaxed.",
      "Attendance is soft — cheap tickets to a Silicon Valley Saturday most weeks.",
      "The Stanford Band is a chaotic experience unto itself; watch for their halftime antics."
    ],
    officialLinks: {
      website: "https://gostanford.com/facilities/stanford-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "jma-wireless-dome-syracuse-ny": {
    name: "JMA Wireless Dome",
    aliases: ["Carrier Dome", "The Dome", "Loud House"],
    city: "Syracuse",
    state: "NY",
    summary: "Syracuse's domed home (renamed from Carrier Dome in 2022) — the only domed stadium in the Northeast and the largest on-campus dome, hosting both Orange football and basketball.",
    bestFor: ["college football", "college basketball"],
    atmosphere: {
      vibe: "The Loud House lives up to the name indoors — orange-clad and echoing",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor (fixed roof)"
    },
    arrival: {
      parking: "Campus garages and hill lots; Syracuse winters make indoor arrival a blessing.",
      rideshare: "Irving Ave drops.",
      transit: "Centro buses serve the university hill.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Upper end zone rows for football (far)"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Marshall Street (M-Street) is the campus pregame strip.",
      nearbyPregame: ["Marshall Street", "Varsity Pizza", "Chuck's (the dive)"],
    },
    fanTips: [
      "Listings may still say Carrier Dome — renamed JMA Wireless Dome in 2022.",
      "Weatherproof: a great late-season football or winter-hoops destination.",
      "The dome hosts football AND basketball — confirm which sport your event is."
    ],
    officialLinks: {
      website: "https://cuse.com/facilities/jma-wireless-dome",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "scott-stadium-charlottesville-va": {
    name: "Scott Stadium",
    aliases: ["Carl Smith Center", "Scott Stadium Charlottesville"],
    city: "Charlottesville",
    state: "VA",
    summary: "Virginia's home a short walk from Jefferson's Academical Village — the Hoo crowd, blue-and-orange tailgates on the surrounding fields, and Blue Ridge foothills beyond.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Genteel Virginia tailgating with pockets of real noise; the program's rebuild raised stakes",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus/UVA lots and neighborhood options; Charlottesville is small.",
      rideshare: "Alderman Road drops.",
      transit: "CAT and UVA gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Upper corners", "Hill/berm ends"],
      avoidIfPossible: ["West lowers for afternoon sun early season"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the Corner and downtown Mall have Charlottesville's best.",
      nearbyPregame: ["The Corner (University Ave)", "Downtown Mall", "local wineries (a Cville must)"],
    },
    fanTips: [
      "Make a weekend of it — Charlottesville's wineries and the Downtown Mall are destinations.",
      "The Commonwealth Cup vs Virginia Tech is the rivalry ticket.",
      "UVA football tickets are among the ACC's easier gets."
    ],
    officialLinks: {
      website: "https://virginiasports.com/facilities/scott-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lane-stadium-blacksburg-va": {
    name: "Lane Stadium",
    aliases: ["Lane Stadium/Worsham Field", "Worsham Field"],
    city: "Blacksburg",
    state: "VA",
    summary: "Virginia Tech's 65,000-seat home in the Blue Ridge — 'Enter Sandman' shaking the stands as the Hokies jump before kickoff, one of the great entrance traditions in sports.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Maroon-and-orange mayhem; the Enter Sandman jump is a bucket-list college football moment",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus and grass lots; Blacksburg is remote — everyone drives in.",
      rideshare: "Thin market — plan your own transport.",
      transit: "Blacksburg Transit gameday services on campus.",
    },
    seating: {
      bestValueSections: ["Upper corners (mountain views)", "End zones"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; downtown Blacksburg's small strip carries pregame.",
      nearbyPregame: ["Main Street Blacksburg", "Cabo Fish Taco", "tailgate lots"],
    },
    fanTips: [
      "Be seated and jumping for Enter Sandman — the whole stadium bounces; it's the point of the trip.",
      "Mountain elevation makes night games cold from October on.",
      "The Commonwealth Cup vs UVA and marquee ACC visits are the hot tickets."
    ],
    officialLinks: {
      website: "https://hokiesports.com/facilities/lane-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "allegacy-stadium-winston-salem-nc": {
    name: "Allegacy Federal Credit Union Stadium",
    aliases: ["Truist Field (Wake Forest)", "BB&T Field", "Groves Stadium", "Allegacy Stadium"],
    city: "Winston-Salem",
    state: "NC",
    summary: "Wake Forest's intimate 31,000-seat home (renamed from Truist Field in 2024) — the smallest Power 4 stadium, with tight sightlines and Deacon-black tailgates.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Small-school family energy that punches up for ranked Deacons seasons",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Stadium lots north of the main campus; easy by ACC standards.",
      rideshare: "University Parkway drops.",
      transit: "WSTA gameday services.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["East lowers for afternoon September sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Winston-Salem's revitalized downtown is a short drive.",
      nearbyPregame: ["Tailgate lots", "downtown Winston-Salem (Fourth Street)", "Foothills Brewing"],
    },
    fanTips: [
      "Listings may still say Truist Field — renamed Allegacy Federal Credit Union Stadium in 2024.",
      "At 31k it's the smallest P4 stadium — big visitors sell out; the intimacy is the appeal.",
      "Wake tickets are among the ACC's easiest and cheapest most weeks."
    ],
    officialLinks: {
      website: "https://godeacs.com/facilities/allegacy-federal-credit-union-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "notre-dame-stadium-notre-dame-in": {
    name: "Notre Dame Stadium",
    aliases: ["The House That Rockne Built"],
    city: "Notre Dame",
    state: "IN",
    summary: "Notre Dame's 77,000-seat home in the shadow of Touchdown Jesus — the sport's most storied independent program, with the Golden Dome, the leprechaun, and the marching band's Victory March.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "History-soaked and reverent; a Notre Dame home Saturday is a pilgrimage as much as a game",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Vast campus lots; South Bend gears entirely around gameday.",
      rideshare: "Angela Blvd/campus-edge drops.",
      transit: "South Shore Line from Chicago to South Bend + shuttle — a real option.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare inside; the campus tailgate culture and Eddy Street Commons carry the day.",
      nearbyPregame: ["Eddy Street Commons", "Legends of Notre Dame (on campus)", "campus tailgate lots"],
    },
    fanTips: [
      "Do the full pregame ritual: band step-off, the Grotto, and Touchdown Jesus (the library mural over the north end).",
      "USC, Ohio State, and other marquee visitors are the priciest, hardest tickets.",
      "South Shore Line from Chicago is a genuine car-free way in for a big weekend."
    ],
    officialLinks: {
      website: "https://fightingirish.com/facilities/notre-dame-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  }
}
