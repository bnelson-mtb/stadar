// Big 12 men's basketball arenas (16 schools).
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const CBB_BIG_12_VENUES = {
  "jon-m-huntsman-center-salt-lake-city-ut": {
    name: "Jon M. Huntsman Center",
    aliases: ["Huntsman Center", "The Huntsman", "Jon M Huntsman Center"],
    city: "Salt Lake City",
    state: "UT",
    summary: "Utah's 15,000-seat domed arena on the upper campus — a striking circular building with mountain views from the lots, home to Ute basketball and championship gymnastics (the Red Rocks).",
    bestFor: ["college basketball", "college gymnastics"],
    atmosphere: {
      vibe: "Loud on marquee nights; Red Rocks gymnastics meets are among the biggest crowds in the sport",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Upper-campus lots adjacent; TRAX is a short walk downhill.",
      rideshare: "Central Campus Drive drops.",
      transit: "TRAX Red Line to University South Campus station, then a short uphill walk.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper ring"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the 9th & 9th neighborhood and downtown handle pregame.",
      nearbyPregame: ["9th & 9th district", "downtown SLC (TRAX)", "campus-area spots"],
    },
    fanTips: [
      "Utah Red Rocks gymnastics regularly outdraws basketball — a genuine SLC spectacle.",
      "The Big 12 move brought marquee hoops visitors (Kansas, Houston, etc.).",
      "The circular domed design and mountain-backed setting are distinctive."
    ],
    officialLinks: {
      website: "https://utahutes.com/facilities/jon-m-huntsman-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "manual" }
  },

  "marriott-center-provo-ut": {
    name: "Marriott Center",
    aliases: ["The Marriott Center"],
    city: "Provo",
    state: "UT",
    summary: "BYU's cavernous 17,500-seat arena — one of the larger on-campus basketball venues in the country, with the ROC student section and a Wasatch backdrop out the doors.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Big and loud on marquee nights; the ROC drives a devoted, family-heavy crowd",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Ample campus lots — easy by P4 standards.",
      rideshare: "Campus Drive drops.",
      transit: "UVX bus rapid transit connects FrontRunner stations to campus.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Lower corners"],
      avoidIfPossible: ["Upper-deck top rows (it's a big building)"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Concessions in a dry-campus environment; Provo's Center Street handles the rest.",
      nearbyPregame: ["Provo Center Street", "Brick Oven", "Cougar Tail stands"],
    },
    fanTips: [
      "No alcohol is sold — the energy comes from the crowd, not the concourse.",
      "The Big 12 move brought Kansas, Houston, and other marquee visitors.",
      "Try a Cougar Tail. It's a foot-long maple bar and the best-known concession in the conference."
    ],
    officialLinks: {
      website: "https://byucougars.com/facilities/marriott-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "manual" }
  },

  "mckale-center-tucson-az": {
    name: "McKale Center",
    aliases: ["McKale Memorial Center", "McKale"],
    city: "Tucson",
    state: "AZ",
    summary: "Arizona's 14,600-seat fortress — the Zona Zoo student section and a proud basketball tradition make McKale one of the toughest home courts in the West.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Desert basketball devotion — loud, red, and hostile to ranked visitors",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus garages adjacent; the streetcar helps.",
      rideshare: "Enke Drive drops.",
      transit: "Sun Link streetcar connects downtown/4th Ave to campus.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; 4th Avenue and University Blvd carry pregame.",
      nearbyPregame: ["4th Avenue", "University Blvd strip", "El Charro Café (downtown)"],
    },
    fanTips: [
      "Arizona basketball is the marquee program in a football-quiet town — McKale is loud.",
      "The Big 12 move brought Kansas, Houston, and Baylor to Tucson.",
      "Tucson's food scene (UNESCO gastronomy) makes any trip worthwhile."
    ],
    officialLinks: {
      website: "https://arizonawildcats.com/facilities/mckale-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "desert-financial-arena-tempe-az": {
    name: "Desert Financial Arena",
    aliases: ["Wells Fargo Arena (ASU)", "ASU Activity Center"],
    city: "Tempe",
    state: "AZ",
    summary: "Arizona State's 14,000-seat arena (renamed from Wells Fargo Arena) — the '942 Crew' student section and the Curtain of Distraction give ASU hoops a quirky, loud edge.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "The Curtain of Distraction (behind the visitor's free-throw line) is nationally famous; 942 Crew energy",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Tempe campus garages; Mill Avenue is nearby.",
      rideshare: "Veterans Way drops.",
      transit: "Valley Metro light rail to Veterans Way/College Ave.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Mill Avenue's bars and restaurants are steps away.",
      nearbyPregame: ["Mill Avenue district", "Four Peaks Brewing", "Tempe Marketplace"],
    },
    fanTips: [
      "Watch the Curtain of Distraction during opponent free throws — one of the sport's best student-section gags.",
      "Listings may still say Wells Fargo Arena — renamed Desert Financial Arena.",
      "The Big 12 move brought Kansas and Houston to Tempe."
    ],
    officialLinks: {
      website: "https://thesundevils.com/facilities/desert-financial-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "foster-pavilion-waco-tx": {
    name: "Foster Pavilion",
    aliases: ["Paul and Alejandra Foster Pavilion"],
    city: "Waco",
    state: "TX",
    summary: "Baylor's new 7,000-seat riverfront arena (opened 2024) — an intimate downtown-Waco building on the Brazos that replaced the isolated Ferrell Center for the national-champion Bears.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "New-building intimacy — small, loud, and a big upgrade in atmosphere over the old barn",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Downtown Waco garages and riverfront lots.",
      rideshare: "University Parks Drive drops.",
      transit: "Baylor shuttles on game nights.",
    },
    seating: {
      bestValueSections: ["Anywhere lower bowl", "Corners"],
      avoidIfPossible: ["Nothing — it's a small new building"],
      accessibilityNote: "Brand-new ADA design throughout."
    },
    foodAndDrink: {
      summary: "Modern concourse; Magnolia-era downtown Waco is minutes away.",
      nearbyPregame: ["Magnolia Market area", "downtown Waco restaurants", "riverfront spots"],
    },
    fanTips: [
      "Opened in 2024 — a much better atmosphere and location than the old Ferrell Center.",
      "At 7,000 seats, marquee Big 12 visits (Kansas, Houston) sell out fast.",
      "Pair with a Magnolia/downtown Waco day."
    ],
    officialLinks: {
      website: "https://baylorbears.com/facilities/foster-pavilion",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fifth-third-arena-cincinnati-oh": {
    name: "Fifth Third Arena",
    aliases: ["Shoemaker Center", "Fifth Third Arena Cincinnati"],
    city: "Cincinnati",
    state: "OH",
    summary: "Cincinnati's renovated 12,000-seat on-campus arena — a gritty basketball tradition (the Bearcats) with a loud student section and a Big 12-era profile boost.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Blue-collar Bearcat basketball intensity; loud for the Crosstown Shootout and ranked visits",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus garages; Clifton neighborhood streets fill.",
      rideshare: "Jefferson Ave drops.",
      transit: "Metro buses up Clifton from downtown/OTR.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare with Cincinnati chili; Clifton's Ludlow strip and OTR handle pregame.",
      nearbyPregame: ["Ludlow Avenue (Clifton)", "Over-the-Rhine", "Mac's Pizza Pub"],
    },
    fanTips: [
      "The Crosstown Shootout vs Xavier is one of college basketball's most heated rivalries.",
      "The Big 12 move brought Kansas and Houston to Cincinnati.",
      "OTR pregame is one of the best in the conference."
    ],
    officialLinks: {
      website: "https://gobearcats.com/facilities/fifth-third-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "cu-events-center-boulder-co": {
    name: "CU Events Center",
    aliases: ["Coors Events Center", "The Keg"],
    city: "Boulder",
    state: "CO",
    summary: "Colorado's 11,000-seat arena in the shadow of the Flatirons — a renovated bowl where the C-Unit student section brings altitude-fueled noise.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Boulder-eclectic energy; loud for ranked Big 12 visitors",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots; Boulder pushes park-and-rides.",
      rideshare: "Regent Drive drops.",
      transit: "RTD buses from Denver and Boulder park-and-rides.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Pearl Street and The Hill handle pregame.",
      nearbyPregame: ["Pearl Street Mall", "The Hill", "Avery Brewing (a ride away)"],
    },
    fanTips: [
      "Altitude affects visitors — 5,300+ feet plus a loud crowd.",
      "The Big 12 move brought Kansas, Houston, and Baylor to Boulder.",
      "Pair with Pearl Street for a great Boulder evening."
    ],
    officialLinks: {
      website: "https://cubuffs.com/facilities/cu-events-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fertitta-center-houston-tx": {
    name: "Fertitta Center",
    aliases: ["Hofheinz Pavilion", "The Fertitta"],
    city: "Houston",
    state: "TX",
    summary: "Houston's 7,100-seat renovated arena — small, ferociously loud, and home to one of the best programs in the country under Kelvin Sampson.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Tiny and thunderous — a top-tier home court for a national-title-contending program",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus garages adjacent.",
      rideshare: "Cullen Blvd drops.",
      transit: "METRORail Purple Line serves campus.",
    },
    seating: {
      bestValueSections: ["Anywhere lower bowl", "Corners"],
      avoidIfPossible: ["Nothing — it's a small, intense building"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Third Ward and EaDo nearby.",
      nearbyPregame: ["EaDo breweries", "Frenchy's Chicken", "downtown Houston"],
    },
    fanTips: [
      "Houston is a national power — Fertitta Center tickets for marquee games are hard to get.",
      "The small capacity makes it one of the loudest buildings in the Big 12.",
      "The renovation (from Hofheinz Pavilion) modernized a classic."
    ],
    officialLinks: {
      website: "https://uhcougars.com/facilities/fertitta-center",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "hilton-coliseum-ames-ia": {
    name: "Hilton Coliseum",
    aliases: ["Hilton Magic", "Hilton"],
    city: "Ames",
    state: "IA",
    summary: "Iowa State's 14,400-seat coliseum — 'Hilton Magic' is real: the Cyclone Alley student section and a rabid fanbase make it one of the loudest arenas in America.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Hilton Magic — a genuine top-5 national home-court atmosphere; cardinal-and-gold delirium",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Large campus lots adjacent — easy.",
      rideshare: "University Blvd drops.",
      transit: "CyRide gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Campustown and Hickory Park carry the day.",
      nearbyPregame: ["Campustown (Welch Ave)", "Hickory Park BBQ", "Ames spots"],
    },
    fanTips: [
      "Hilton Magic is one of the sport's genuinely elite atmospheres — a bucket-list building.",
      "Kansas, Houston, and rivalry games are the hardest tickets.",
      "Iowa State basketball is the state's passion in winter."
    ],
    officialLinks: {
      website: "https://cyclones.com/facilities/hilton-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "allen-fieldhouse-lawrence-ks": {
    name: "Allen Fieldhouse",
    aliases: ["The Phog", "Allen Field House"],
    city: "Lawrence",
    state: "KS",
    summary: "The most sacred building in college basketball — Kansas's 16,300-seat cathedral where 'Pay Heed, All Who Enter: Beware of the Phog' hangs over a fanbase that invented the sport's rulebook.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "The gold standard — the Rock Chalk Chant and the pregame roar are unmatched anywhere in the sport",
      noiseLevel: "Very high (the loudest, by many measures)",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots and neighborhood streets; Lawrence compresses on game nights.",
      rideshare: "Naismith Drive drops.",
      transit: "Lawrence Transit + gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Upper sidelines", "Lower corners"],
      avoidIfPossible: ["Nothing — every seat is part of the experience"],
      accessibilityNote: "Historic building with retrofits; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Massachusetts Street is one of the best college-town strips in America.",
      nearbyPregame: ["Massachusetts Street", "Free State Brewing", "The Wheel"],
    },
    fanTips: [
      "A Kansas home game at Allen Fieldhouse is the #1 bucket-list venue in college basketball — full stop.",
      "The Rock Chalk Chant (slow, eerie, unison) after wins is unforgettable.",
      "Tickets are scarce and pricey — plan months ahead. Visit the DeBruce Center to see Naismith's original rules."
    ],
    officialLinks: {
      website: "https://kuathletics.com/facilities/allen-fieldhouse",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bramlage-coliseum-manhattan-ks": {
    name: "Bramlage Coliseum",
    aliases: ["The Octagon of Doom", "Bramlage"],
    city: "Manhattan",
    state: "KS",
    summary: "Kansas State's 12,500-seat arena — 'The Octagon of Doom' gets loud enough to give the Wildcats one of the Big 12's better home-court edges, especially against Kansas.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Purple-clad and rowdy; the Octagon of Doom nickname is earned on Sunflower Showdown nights",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent — easy.",
      rideshare: "Kimball Ave drops; thin market.",
      transit: "ATA gameday routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Aggieville handles pregame.",
      nearbyPregame: ["Aggieville", "Call Hall ice cream", "Manhattan spots"],
    },
    fanTips: [
      "The Sunflower Showdown vs Kansas is the loudest night of the year here.",
      "Kansas, Houston, and Baylor visits fill the building.",
      "Aggieville is the college-town pregame institution."
    ],
    officialLinks: {
      website: "https://kstatesports.com/facilities/bramlage-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "gallagher-iba-arena-stillwater-ok": {
    name: "Gallagher-Iba Arena",
    aliases: ["Gallagher Iba Arena", "The Rowdiest Arena in the Country", "GIA"],
    city: "Stillwater",
    state: "OK",
    summary: "Oklahoma State's 13,600-seat classic — 'The Rowdiest Arena in the Country,' a wrestling-and-basketball shrine with historic bones and a devoted orange crowd.",
    bestFor: ["college basketball", "college wrestling"],
    atmosphere: {
      vibe: "Old-school loud; the wrestling heritage and hoops tradition run deep",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent.",
      rideshare: "Hall of Fame Ave drops; thin market.",
      transit: "OSU campus shuttles.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper sections"],
      accessibilityNote: "Historic building with retrofits; verify accessible sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare; Eskimo Joe's and the Strip carry pregame.",
      nearbyPregame: ["Eskimo Joe's", "The Strip (Washington St)", "downtown Stillwater"],
    },
    fanTips: [
      "OSU wrestling (a dynasty) draws huge crowds here too — a genuine spectacle.",
      "The Bedlam rivalry with OU carries over even after conference realignment shuffles.",
      "Eskimo Joe's cheese fries are as mandatory for hoops as for football."
    ],
    officialLinks: {
      website: "https://okstate.com/facilities/gallagher-iba-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "schollmaier-arena-fort-worth-tx": {
    name: "Schollmaier Arena",
    aliases: ["Daniel-Meyer Coliseum", "Ed and Rae Schollmaier Arena"],
    city: "Fort Worth",
    state: "TX",
    summary: "TCU's renovated 8,500-seat arena — an intimate, modernized building where the Frogs pull off memorable upsets in Fort Worth's pleasant campus neighborhood.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Purple-clad and intimate; loud for ranked Big 12 visitors",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent — easy.",
      rideshare: "Stadium Drive drops.",
      transit: "Limited — Fort Worth driving is standard.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Nothing — it's small and close"],
      accessibilityNote: "Renovated ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; the University/Magnolia districts eat well.",
      nearbyPregame: ["Magnolia Avenue", "University Drive spots", "Dutch's Hamburgers"],
    },
    fanTips: [
      "At 8,500 seats it's intimate — marquee Big 12 visits (Kansas, Houston) fill it.",
      "Fort Worth is an underrated game-weekend city.",
      "The renovation modernized the old Daniel-Meyer Coliseum."
    ],
    officialLinks: {
      website: "https://gofrogs.com/facilities/schollmaier-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "united-supermarkets-arena-lubbock-tx": {
    name: "United Supermarkets Arena",
    aliases: ["USA (Texas Tech)", "The USA"],
    city: "Lubbock",
    state: "TX",
    summary: "Texas Tech's 15,000-seat arena — the raucous student section and West Texas basketball passion make it a genuinely tough Big 12 road environment.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Guns-up loud; Red Raider hoops fervor rivals the football crowd on big nights",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus lots adjacent.",
      rideshare: "Marsha Sharp Freeway-area drops; thin market.",
      transit: "Citibus campus routes.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Upper corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; the Depot District and Broadway carry the day.",
      nearbyPregame: ["Depot District", "Broadway strip", "Lubbock spots"],
    },
    fanTips: [
      "Tech hoops became a Big 12 power — the arena is loud for ranked visits.",
      "Kansas, Houston, and Baylor games are the hardest tickets.",
      "West Texas fans travel and show up — expect a full building for marquee games."
    ],
    officialLinks: {
      website: "https://texastech.com/facilities/united-supermarkets-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "addition-financial-arena-orlando-fl": {
    name: "Addition Financial Arena",
    aliases: ["CFE Arena", "UCF Arena", "The Venue"],
    city: "Orlando",
    state: "FL",
    summary: "UCF's 10,000-seat on-campus arena — a modern building on America's largest campus, energized by the Knights' Big 12 arrival.",
    bestFor: ["college basketball", "concerts"],
    atmosphere: {
      vibe: "Young, growing crowd; loud for ranked Big 12 visitors",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Campus garages and lots; East Orlando driving applies.",
      rideshare: "Gemini Blvd drops.",
      transit: "Limited — drive from Orlando proper (30+ minutes).",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top upper corners"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; the campus-adjacent Plaza on University handles pregame.",
      nearbyPregame: ["Plaza on University", "Knight's Pub", "Oviedo spots"],
    },
    fanTips: [
      "The Big 12 move brought Kansas, Houston, and Baylor to Orlando.",
      "UCF tickets are among the conference's most affordable.",
      "It doubles as a campus concert venue."
    ],
    officialLinks: {
      website: "https://ucfknights.com/facilities/addition-financial-arena",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "wvu-coliseum-morgantown-wv": {
    name: "WVU Coliseum",
    aliases: ["West Virginia Coliseum", "The Coliseum"],
    city: "Morgantown",
    state: "WV",
    summary: "West Virginia's 14,000-seat circular coliseum — a 1970 concrete drum where the Mountaineer faithful bring Appalachian intensity to Big 12 hoops.",
    bestFor: ["college basketball"],
    atmosphere: {
      vibe: "Gold-and-blue loud; the round design and passionate crowd make it a tough road trip",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },
    arrival: {
      parking: "Coliseum lots adjacent — easier than football.",
      rideshare: "Patteson Drive drops; thin market.",
      transit: "The PRT (personal rapid transit) connects to the Coliseum station.",
    },
    seating: {
      bestValueSections: ["Lower sidelines", "Corners"],
      avoidIfPossible: ["Top rows of the upper ring"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Pepperoni rolls and standard fare; High Street downtown carries pre/post-game.",
      nearbyPregame: ["High Street (downtown)", "Mario's Fishbowl", "Morgantown spots"],
    },
    fanTips: [
      "The PRT to the Coliseum is worth riding once — a 1970s futurist oddity.",
      "Kansas, Houston, and Baylor visits are the marquee tickets.",
      "Pepperoni rolls are the state's signature food — eat one."
    ],
    officialLinks: {
      website: "https://wvusports.com/facilities/wvu-coliseum",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  }
}
