// ACC men's basketball arenas + Notre Dame (a full ACC member in basketball).
// NC State plays at Lenovo Center (in nhl.js, shared with the Hurricanes) and
// Syracuse at the JMA Wireless Dome (in cfbAcc.js) — both omitted here.
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const CBB_ACC_VENUES = {
  "conte-forum-chestnut-hill-ma": {
    name: "Conte Forum",
    aliases: ["Silvio O. Conte Forum"],
    city: "Chestnut Hill",
    state: "MA",
    summary: "Boston College's 8,600-seat arena — a shared hockey/basketball building on a leafy campus, T-accessible and intimate when the Eagles draw a marquee ACC visitor.",
    bestFor: ["college basketball", "college hockey"],
    atmosphere: {
      vibe: "Quiet for cupcakes, loud for Duke/UNC; hockey nights are the rowdier draw",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Very limited campus parking — the T is the answer.",
      rideshare: "Commonwealth Ave drops.",
      transit: "MBTA Green Line B branch to Boston College terminus.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Behind-basket top rows"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Cleveland Circle and Chestnut Hill spots carry pregame.",
      nearbyPregame: ["Mary Ann's", "Cleveland Circle", "Roggie's"],
    },
    fanTips: [
      "BC hockey often outdraws basketball — confirm which sport your event is.",
      "Duke and UNC visits are the games that fill it.",
      "Easy tickets otherwise, and easy T access from Boston."
    ],
    officialLinks: {
      website: "https://bceagles.com/facilities/conte-forum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "haas-pavilion-berkeley-ca": {
    name: "Haas Pavilion",
    aliases: ["Harmon Gym", "Haas"],
    city: "Berkeley",
    state: "CA",
    summary: "California's 11,800-seat arena — a renovated historic gym in the Berkeley hills where the Bench student section supplies the noise for Golden Bear hoops.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Bay Area mellow with bursts of energy for ranked ACC visitors",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Scarce campus/hill parking — BART is the answer.",
      rideshare: "Bancroft Way drops.",
      transit: "BART to Downtown Berkeley + a campus walk.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Berkeley's food scene is a short trip.",
      nearbyPregame: ["Telegraph Ave", "Gourmet Ghetto", "downtown Berkeley"],
    },
    fanTips: [
      "The ACC move brought Duke, UNC, and other blue-bloods to Berkeley — a novelty for Bay Area fans.",
      "BART access makes it an easy no-car trip.",
      "Cal tickets are among the ACC's easier gets."
    ],
    officialLinks: {
      website: "https://calbears.com/facilities/haas-pavilion",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "littlejohn-coliseum-clemson-sc": {
    name: "Littlejohn Coliseum",
    aliases: ["Littlejohn"],
    city: "Clemson",
    state: "SC",
    summary: "Clemson's renovated 9,000-seat coliseum — orange-clad and increasingly loud as the Tigers' basketball program rose to ACC contention.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Rising-program energy; loud for Duke, UNC, and marquee ACC nights",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent — easier than football.",
      rideshare: "Perimeter Road drops; thin market.",
      transit: "CATbus campus routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; downtown Clemson and the Esso Club carry pregame.",
      nearbyPregame: ["Esso Club", "downtown Clemson", "campus-area spots"],
    },
    fanTips: [
      "Clemson basketball became an ACC contender — the building is loud for big games.",
      "Duke and UNC visits are the hardest tickets.",
      "The renovation modernized a classic coliseum."
    ],
    officialLinks: {
      website: "https://clemsontigers.com/facilities/littlejohn-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "cameron-indoor-stadium-durham-nc": {
    name: "Cameron Indoor Stadium",
    aliases: ["Cameron Indoor", "Cameron"],
    city: "Durham",
    state: "NC",
    summary: "The most famous small arena in sports — Duke's 9,300-seat 1940 Gothic gym where the Cameron Crazies press against the court and the volume is physically overwhelming.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "The gold standard for intimate intensity — the Crazies are inches from the action; nothing in the sport is louder per square foot",
      noiseLevel: "Very high (deafening at close range)",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Limited campus lots — arrive early or use shuttles.",
      rideshare: "Towerview Drive drops.",
      transit: "Duke and GoDurham shuttles.",
    },
    seating: {
      bestValueSections: ["Anywhere you can get in", "Lower sidelines"],
      avoidIfPossible: ["Nothing — it's all part of the experience"],
      accessibilityNote: "A 1940 building — accessible options are limited and specific; verify carefully at purchase."
    },
    foodAndDrink: {
      summary: "Minimal concessions in a historic gym; Durham's excellent food scene is nearby.",
      nearbyPregame: ["Brightleaf/downtown Durham", "Fullsteam Brewery", "American Tobacco Campus"],
    },
    fanTips: [
      "Cameron is the #1 college basketball bucket-list building alongside Allen Fieldhouse — but tickets are brutally scarce.",
      "The Duke-UNC game here is the sport's ultimate rivalry ticket; plan far ahead and expect a premium.",
      "Even a non-conference game inside Cameron is worth the effort — the acoustics are unmatched."
    ],
    officialLinks: {
      website: "https://goduke.com/facilities/cameron-indoor-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "donald-l-tucker-center-tallahassee-fl": {
    name: "Donald L. Tucker Center",
    aliases: ["Tucker Center", "Leon County Civic Center", "The Tuck"],
    city: "Tallahassee",
    state: "FL",
    summary: "Florida State's 12,000-seat downtown arena — a civic-center building shared with the city that fills for Seminole hoops against ACC contenders.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Garnet-and-gold energy on marquee nights; a football-first school's hoops home",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown Tallahassee garages adjacent.",
      rideshare: "Pensacola Street drops.",
      transit: "StarMetro downtown routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; College Town district handles pregame.",
      nearbyPregame: ["College Town", "Madison Social", "downtown Tallahassee"],
    },
    fanTips: [
      "Duke and UNC visits are the games that fill it.",
      "The downtown location makes for an easier pregame than FSU football.",
      "FSU tickets are otherwise among the ACC's easier gets."
    ],
    officialLinks: {
      website: "https://seminoles.com/facilities/donald-l-tucker-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mccamish-pavilion-atlanta-ga": {
    name: "McCamish Pavilion",
    aliases: ["Alexander Memorial Coliseum", "The Thrillerdome"],
    city: "Atlanta",
    state: "GA",
    summary: "Georgia Tech's renovated 8,600-seat arena in Midtown Atlanta — a modern, intimate building (once 'The Thrillerdome') that's MARTA-accessible in the heart of the city.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Urban-campus intimate; loud for Duke, UNC, and marquee ACC visits",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus decks and Midtown garages; MARTA makes them optional.",
      rideshare: "Fowler Street drops.",
      transit: "MARTA to Midtown or North Avenue stations.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Tech Square and Midtown handle pregame.",
      nearbyPregame: ["Tech Square", "Midtown bars", "Antico Pizza"],
    },
    fanTips: [
      "One of the most transit-accessible ACC arenas — MARTA to the door area.",
      "Duke and UNC visits are the hardest tickets.",
      "The Midtown location makes for a great city-night pregame."
    ],
    officialLinks: {
      website: "https://ramblinwreck.com/facilities/mccamish-pavilion",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "kfc-yum-center-louisville-ky": {
    name: "KFC Yum! Center",
    aliases: ["Yum Center", "KFC Yum Center"],
    city: "Louisville",
    state: "KY",
    summary: "Louisville's 22,000-seat downtown arena — one of the largest and best on-campus-adjacent buildings in college basketball, on the Ohio River waterfront.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Big-city arena energy; Cardinal red fills it for marquee ACC and rivalry games",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown Louisville garages adjacent.",
      rideshare: "Main Street drops.",
      transit: "TARC downtown routes.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Lower corners"],
      avoidIfPossible: ["Highest upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard-plus fare; downtown Louisville's NuLu and bourbon scene handle the rest.",
      nearbyPregame: ["NuLu district", "downtown bourbon bars", "Main Street spots"],
    },
    fanTips: [
      "One of the best big arenas in college basketball — a genuine pro-level building.",
      "Kentucky (the rivalry) and Duke/UNC visits are the hardest tickets.",
      "Pair with a bourbon-trail day — Louisville is the gateway."
    ],
    officialLinks: {
      website: "https://gocards.com/facilities/kfc-yum-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "watsco-center-coral-gables-fl": {
    name: "Watsco Center",
    aliases: ["BankUnited Center", "Miami Convocation Center", "The Watsco"],
    city: "Coral Gables",
    state: "FL",
    summary: "Miami's 8,000-seat on-campus arena — an intimate building that filled and buzzed during the Hurricanes' Final Four era.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Laid-back Miami energy that spikes for Duke/UNC and NCAA-run seasons",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus garages in Coral Gables.",
      rideshare: "San Amaro Drive drops.",
      transit: "Metrorail to University station, a walk from campus.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Coral Gables and Coconut Grove nearby.",
      nearbyPregame: ["Coral Gables (Miracle Mile)", "Coconut Grove", "campus-area spots"],
    },
    fanTips: [
      "Miami's Final Four-era teams made the Watsco a genuine hot ticket.",
      "Duke and UNC visits fill it.",
      "Metrorail access is a rare Miami convenience."
    ],
    officialLinks: {
      website: "https://miamihurricanes.com/facilities/watsco-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "dean-e-smith-center-chapel-hill-nc": {
    name: "Dean E. Smith Center",
    aliases: ["The Dean Dome", "Smith Center", "Dean Smith Center"],
    city: "Chapel Hill",
    state: "NC",
    summary: "The Dean Dome — North Carolina's 21,000-seat shrine to Tar Heel basketball, its rafters heavy with retired jerseys and national-title banners.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Reverent and enormous — quieter than Cameron by design, but electric for Duke and marquee games",
      noiseLevel: "High (very high for Duke)",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots and park-and-rides; Chapel Hill compresses on game nights.",
      rideshare: "Skipper Bowles Drive drops.",
      transit: "Chapel Hill Transit (fare-free) + gameday routes.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Lower corners"],
      avoidIfPossible: ["Highest upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Franklin Street's college-town strip is the pregame.",
      nearbyPregame: ["Franklin Street", "Top of the Hill", "He's Not Here (blue cups)"],
    },
    fanTips: [
      "Look up at the retired jerseys and championship banners — the rafters are a museum of the sport.",
      "The Duke game is the ultimate rivalry ticket; Franklin Street erupts after wins.",
      "The Dean Dome is a bucket-list building, and easier to get into than tiny Cameron across town."
    ],
    officialLinks: {
      website: "https://goheels.com/facilities/dean-e-smith-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "purcell-pavilion-notre-dame-in": {
    name: "Purcell Pavilion at the Joyce Center",
    aliases: ["Joyce Center", "Purcell Pavilion", "The Joyce"],
    city: "Notre Dame",
    state: "IN",
    summary: "Notre Dame's 9,100-seat arena inside the Joyce Center — a renovated, intimate building where the Irish (a full ACC member in basketball) host the conference's blue-bloods.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Loud and close for marquee ACC visits; Notre Dame tradition throughout",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent — far easier than football.",
      rideshare: "Juniper Road drops.",
      transit: "South Shore Line from Chicago + shuttle for big events.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Eddy Street Commons handles pregame.",
      nearbyPregame: ["Eddy Street Commons", "Legends of Notre Dame", "campus spots"],
    },
    fanTips: [
      "Unlike football (independent), Notre Dame plays basketball fully in the ACC — Duke and UNC visit here.",
      "The renovated Purcell Pavilion is intimate and loud for big games.",
      "Pair with the campus traditions (the Grotto, the Golden Dome)."
    ],
    officialLinks: {
      website: "https://fightingirish.com/facilities/purcell-pavilion",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "petersen-events-center-pittsburgh-pa": {
    name: "Petersen Events Center",
    aliases: ["The Pete", "Petersen Events Center Pittsburgh"],
    city: "Pittsburgh",
    state: "PA",
    summary: "Pitt's 12,500-seat arena atop Cardiac Hill — 'The Pete' and the Oakland Zoo student section made it one of the Big East/ACC's toughest home courts in its heyday.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "The Oakland Zoo brings loud, organized intensity; Pitt protects home court hard",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Oakland garages; the hilltop location means climbing.",
      rideshare: "Terrace Street drops.",
      transit: "Pittsburgh Port Authority buses up Fifth/Forbes into Oakland.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Oakland's student-district eats are nearby.",
      nearbyPregame: ["Oakland (Forbes/Fifth)", "The O (Original Hot Dog Shop)", "Primanti's"],
    },
    fanTips: [
      "The Oakland Zoo is one of the sport's better student sections.",
      "Duke, UNC, and Big East-rivalry-adjacent games are the hardest tickets.",
      "Oakland's student neighborhood makes for a lively pregame."
    ],
    officialLinks: {
      website: "https://pittsburghpanthers.com/facilities/petersen-events-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "moody-coliseum-university-park-tx": {
    name: "Moody Coliseum",
    aliases: ["Moody Coliseum SMU"],
    city: "University Park",
    state: "TX",
    summary: "SMU's renovated 7,000-seat coliseum in affluent Park Cities — an intimate, modernized building energized by the Mustangs' ACC arrival.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Intimate and upscale; loud for marquee ACC visitors as SMU builds its profile",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus and Park Cities garages; tight neighborhood streets.",
      rideshare: "Mockingbird Lane drops.",
      transit: "DART Red/Blue to Mockingbird station.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Snider Plaza and Mockingbird Station handle pregame.",
      nearbyPregame: ["Snider Plaza", "Mockingbird Station", "Park Cities spots"],
    },
    fanTips: [
      "The ACC move brought Duke, UNC, and other blue-bloods to Dallas.",
      "At 7,000 seats, marquee visits sell out fast.",
      "DART access makes it an easy no-car trip."
    ],
    officialLinks: {
      website: "https://smumustangs.com/facilities/moody-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "maples-pavilion-stanford-ca": {
    name: "Maples Pavilion",
    aliases: ["Maples"],
    city: "Stanford",
    state: "CA",
    summary: "Stanford's 7,300-seat arena — an intimate, historically springy-floored gym on the Farm, home to the Cardinal men and a storied women's program.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Tech-campus calm that livens for the women's powerhouse and marquee ACC visits",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Ample campus lots — easy.",
      rideshare: "Campus Drive drops.",
      transit: "Caltrain to Palo Alto + a walk/shuttle.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Nothing — it's small and close"],
      accessibilityNote: "Renovated historic gym; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Palo Alto's University Ave is a short trip.",
      nearbyPregame: ["University Avenue (Palo Alto)", "Town & Country Village", "campus spots"],
    },
    fanTips: [
      "Stanford women's basketball (a national power) often outdraws the men.",
      "The ACC move brought Duke and UNC to the Farm.",
      "Easy tickets and easy parking most nights."
    ],
    officialLinks: {
      website: "https://gostanford.com/facilities/maples-pavilion",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "john-paul-jones-arena-charlottesville-va": {
    name: "John Paul Jones Arena",
    aliases: ["JPJ", "John Paul Jones Arena Charlottesville"],
    city: "Charlottesville",
    state: "VA",
    summary: "Virginia's 14,600-seat arena — a modern, comfortable building where the Cavaliers' grind-it-out defense turned home games into tense, loud affairs during their title run.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Orange-and-blue tension; the low-scoring style makes late possessions deafening",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "On-site garage and campus lots — easy.",
      rideshare: "Massie Road drops.",
      transit: "CAT and UVA shuttles.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; the Corner and downtown Mall handle pregame.",
      nearbyPregame: ["The Corner (University Ave)", "Downtown Mall", "local wineries (a Cville must)"],
    },
    fanTips: [
      "Duke and UNC visits are the hardest tickets; UVA's 2019 title raised the program's profile.",
      "Charlottesville is a great game-weekend town — wineries and the Downtown Mall.",
      "The on-site garage is a rare college-arena convenience."
    ],
    officialLinks: {
      website: "https://virginiasports.com/facilities/john-paul-jones-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "cassell-coliseum-blacksburg-va": {
    name: "Cassell Coliseum",
    aliases: ["The Cassell", "Cassell Coliseum Blacksburg"],
    city: "Blacksburg",
    state: "VA",
    summary: "Virginia Tech's 9,300-seat coliseum — an old-school Hokie basketball barn in the Blue Ridge that gets loud when the maroon-and-orange crowd is fired up.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Old-arena intimacy; loud for Duke, UNC, and the UVA rivalry",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent — easier than football.",
      rideshare: "Spring Road drops; thin market.",
      transit: "Blacksburg Transit campus routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Historic building with retrofits; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; downtown Blacksburg's strip carries pregame.",
      nearbyPregame: ["Main Street Blacksburg", "Cabo Fish Taco", "campus spots"],
    },
    fanTips: [
      "The UVA rivalry (Commonwealth Clash) and Duke/UNC visits are the marquee games.",
      "Blacksburg's mountain isolation means a full driving day — plan ahead.",
      "The old-barn feel is part of the charm."
    ],
    officialLinks: {
      website: "https://hokiesports.com/facilities/cassell-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "lawrence-joel-veterans-memorial-coliseum-winston-salem-nc": {
    name: "Lawrence Joel Veterans Memorial Coliseum",
    aliases: ["LJVM Coliseum", "The Joel", "Lawrence Joel Coliseum"],
    city: "Winston-Salem",
    state: "NC",
    summary: "Wake Forest's 14,600-seat coliseum — an off-campus civic building where the Demon Deacons host ACC blue-bloods and Tim Duncan's jersey hangs in the rafters.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Black-and-gold energy on marquee nights; a civic-arena setting",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Coliseum lots adjacent — easy.",
      rideshare: "University Parkway drops.",
      transit: "WSTA routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; downtown Winston-Salem's Fourth Street is a short drive.",
      nearbyPregame: ["Downtown Winston-Salem (Fourth Street)", "Foothills Brewing", "coliseum lots"],
    },
    fanTips: [
      "Duke and UNC visits are the games that fill it.",
      "Tim Duncan's Wake Forest legacy is honored in the rafters.",
      "Wake tickets are among the ACC's easier gets most nights."
    ],
    officialLinks: {
      website: "https://godeacs.com/facilities/lawrence-joel-veterans-memorial-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  }
}
