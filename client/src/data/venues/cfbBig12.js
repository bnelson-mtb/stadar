// Big 12 football stadiums (16 schools). Houston's stadium becomes
// Space City Financial Stadium for 2026 (was TDECU Stadium).
// Shape: docs/superpowers/userprompts/venue-knowledge.md

export const CFB_BIG_12_VENUES = {
  "rice-eccles-stadium-salt-lake-city-ut": {
    name: "Rice-Eccles Stadium",
    aliases: ["Rice Eccles Stadium", "Rice Stadium"],
    city: "Salt Lake City",
    state: "UT",
    summary: "Utah's 51,000-seat home on the hill above downtown SLC — stunning Wasatch views over the east rim, the home of the 2002 (and 2034) Olympic cauldron, and the MUSS student section driving one of the West's best atmospheres.",
    bestFor: ["college football", "Olympics ceremonies"],
    atmosphere: {
      vibe: "Feels bigger and louder than 51k — third-down jumps and sustained noise",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots are permit-heavy; free street parking is avaliable further from the stadium.",
      rideshare: "South campus drops; expect post-game waits on 500 South.",
      transit: "TRAX Red Line to Stadium station, drops you right in front of the main lot and entrance.",
    },
    seating: {
      bestValueSections: ["East uppers (mountain view)", "North end zone"],
      avoidIfPossible: ["West lowers for early-September afternoon kicks (sun)"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare with local vendors; the pregame scene lives in the surrounding lots and downtown.",
      nearbyPregame: ["Guardsman Way tailgates", "9th & 9th neighborhood", "downtown SLC (TRAX ride)"],
    },
    fanTips: [
      "Evening kicks with alpenglow on the Wasatch behind the east stands are the signature Utah football image.",
      "Utah-BYU (the Holy War) reprices everything — buy at schedule release.",
      "Altitude + dry heat: hydrate for September day games."
    ],
    officialLinks: {
      website: "https://utahutes.com/facilities/rice-eccles-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "manual" }
  },

  "lavell-edwards-stadium-provo-ut": {
    name: "LaVell Edwards Stadium",
    aliases: ["Cougar Stadium", "LaVell Edwards"],
    city: "Provo",
    state: "UT",
    summary: "BYU's 63,000-seat home framed by the Wasatch's steepest faces — of one the best mountain backdrops in college football, with a notably family-heavy crowd.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Huge, clean-cut, and loud — the Cougar crowd travels from the whole Mormon corridor",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Ample campus and church-lot parking by P4 standards.",
      rideshare: "Canyon Road drops.",
      transit: "UVX bus rapid transit connects the Provo/Orem FrontRunner stations to campus.",
    },
    seating: {
      bestValueSections: ["East uppers (mountain view)", "Corners"],
      avoidIfPossible: ["West lowers for afternoon sun in September"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Famously good concessions program (Cougar Tails — the giant maple bars) in a dry-campus environment.",
      nearbyPregame: ["Cougar Tail lines inside", "Provo's Center Street", "Brick Oven"],
    },
    fanTips: [
      "Try a Cougar Tail. It's a foot-long maple bar and the best-known concession in the conference.",
      "No alcohol is sold — plan accordingly; the crowd energy is loud anyway.",
      "Mountain sunsets behind the east rim make evening kicks the aesthetic pick."
    ],
    officialLinks: {
      website: "https://byucougars.com/facilities/lavell-edwards-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "manual" }
  },

  "arizona-stadium-tucson-az": {
    name: "Arizona Stadium",
    aliases: ["Arizona Stadium Tucson"],
    city: "Tucson",
    state: "AZ",
    summary: "Arizona's on-campus bowl in midtown Tucson — desert-sunset backdrops, and a schedule where September games start at furnace temperatures.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Basketball-school football that wakes up for Territorial Cup season",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus garages with gameday rates; the Tucson streetcar helps.",
      rideshare: "University Blvd drops.",
      transit: "Sun Link streetcar from downtown/4th Ave to campus.",
    },
    seating: {
      bestValueSections: ["East sideline", "North end"],
      avoidIfPossible: ["West side before sundown, September-October"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Sonoran dogs near campus beat anything inside.",
      nearbyPregame: ["4th Avenue", "University Blvd strip", "El Guero Canelo (Sonoran dogs)"],
    },
    fanTips: [
      "Night games only until mid-October if you value comfort — Tucson September is 100°F+.",
      "Territorial Cup (vs ASU) is among the oldest rivalry trophies — the ticket to target.",
      "Tucson's food scene (a UNESCO gastronomy city) makes the trip regardless of the score."
    ],
    officialLinks: {
      website: "https://arizonawildcats.com/facilities/arizona-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mountain-america-stadium-tempe-az": {
    name: "Mountain America Stadium",
    aliases: ["Sun Devil Stadium", "Frank Kush Field"],
    city: "Tempe",
    state: "AZ",
    summary: "Arizona State's home carved between two desert buttes in Tempe — renovated, light-rail served, and dramatic at sunset.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Pitchfork-up party school energy; the Big 12 title run era brought real heat back",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Tempe garages and ASU lots; Mill Avenue's district absorbs the pregame.",
      rideshare: "Mill Ave drops and walk in between the buttes.",
      transit: "Valley Metro light rail to Veterans Way/College Ave, blocks away.",
    },
    seating: {
      bestValueSections: ["Upper corners", "North end"],
      avoidIfPossible: ["East lowers for day games early season"],
      accessibilityNote: "Renovated accessibility; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Renovation-upgraded fare; Mill Avenue's bars and restaurants are steps away.",
      nearbyPregame: ["Mill Avenue district", "Four Peaks Brewing (the local giant)", "Tempe Marketplace"],
    },
    fanTips: [
      "September games are heat events even at night — hydrate aggressively.",
      "The 'A' on the butte and the sunset over the stadium make west-facing photos the keepers.",
      "Territorial Cup years in Tempe are the hot ticket."
    ],
    officialLinks: {
      website: "https://thesundevils.com/facilities/mountain-america-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "mclane-stadium-waco-tx": {
    name: "McLane Stadium",
    aliases: ["Baylor Stadium"],
    city: "Waco",
    state: "TX",
    summary: "Baylor's 2014-built riverside home on the Brazos — sailgating flotillas, a suspension-bridge walk from campus, and one of the sport's best modern settings.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Green-and-gold family energy with a riverfront festival feel",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Stadium lots plus downtown Waco decks across the river.",
      rideshare: "MLK Blvd drops.",
      transit: "Baylor shuttle services on gamedays.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zone berm/uppers"],
      avoidIfPossible: ["East lowers for afternoon September kicks"],
      accessibilityNote: "Modern ADA design; accessible seating on all levels."
    },
    foodAndDrink: {
      summary: "Solid Texas fare; Magnolia-era downtown Waco handles the rest of the day.",
      nearbyPregame: ["Brazos sailgaters (watch from the bridge)", "Magnolia Market area", "downtown Waco spots"],
    },
    fanTips: [
      "Watch the boat flotilla on the Brazos even if you arrive by land.",
      "September heat is standard-issue Texas — night games preferred.",
      "Baylor tickets outside marquee Big 12 visits are affordable."
    ],
    officialLinks: {
      website: "https://baylorbears.com/facilities/mclane-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "nippert-stadium-cincinnati-oh": {
    name: "Nippert Stadium",
    aliases: ["Nippert"],
    city: "Cincinnati",
    state: "OH",
    summary: "Cincinnati's 1915 on-campus bowl sunken into the middle of the university — one of football's oldest venues, with buildings looming right over the stands.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Compact urban-campus intensity — the closeness makes 40k feel like more",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus garages; Clifton neighborhood streets fill fast.",
      rideshare: "Clifton Ave/MLK drops.",
      transit: "Metro buses up Clifton; short ride from downtown/OTR.",
    },
    seating: {
      bestValueSections: ["Sideline uppers", "Corners"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Historic bowl with renovated access; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Standard fare plus Cincinnati chili; Clifton's Ludlow strip nearby.",
      nearbyPregame: ["Ludlow Avenue (Clifton)", "Mac's Pizza Pub", "OTR before heading up the hill"],
    },
    fanTips: [
      "One of the sport's most underrated venues — the campus-canyon setting is unique.",
      "Crosstown Shootout energy (basketball) spills into football rivalry weeks with Miami (OH) and UC's Big 12 slate.",
      "Bearcats tickets are among the Big 12's cheapest."
    ],
    officialLinks: {
      website: "https://gobearcats.com/facilities/nippert-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "folsom-field-boulder-co": {
    name: "Folsom Field",
    aliases: ["Folsom"],
    city: "Boulder",
    state: "CO",
    summary: "Colorado's 1924 stadium at the foot of the Flatirons — Ralphie the buffalo's charge, mountain light, and the Prime-era spotlight still on it.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Boulder-eclectic meets big-time buzz — Ralphie's Run is the best live entrance in sports",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Scarce on campus — Boulder pushes park-and-rides and bikes.",
      rideshare: "Broadway drops and the walk up the hill.",
      transit: "RTD buses from Denver (Flatiron Flyer) and Boulder park-and-rides.",
    },
    seating: {
      bestValueSections: ["East uppers (Flatiron views)", "Corners"],
      avoidIfPossible: ["Nothing structural — altitude affects the climb though"],
      accessibilityNote: "Historic stadium with renovated access; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Boulder-quality options creeping into a classic bowl; Pearl Street handles the rest.",
      nearbyPregame: ["Pearl Street Mall", "The Hill (student district)", "Avery Brewing (ride away)"],
    },
    fanTips: [
      "Be seated for Ralphie's Run before kickoff — a live buffalo at full gallop never disappoints.",
      "Altitude is real for visitors: 5,430 feet plus stairs — pace yourself.",
      "Fall afternoon light on the Flatirons makes late kicks the photographer's choice."
    ],
    officialLinks: {
      website: "https://cubuffs.com/facilities/folsom-field",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "medium", lastReviewed: "2026-07-09", source: "generated" }
  },

  "space-city-financial-stadium-houston-tx": {
    name: "Space City Financial Stadium",
    aliases: ["TDECU Stadium", "John O'Quinn Field"],
    city: "Houston",
    state: "TX",
    summary: "Houston's on-campus stadium (renamed from TDECU Stadium for 2026) — a compact 40,000-seat venue with downtown skyline views and light rail service.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Commuter-school crowds that spike hard for ranked opponents and rivalry dates",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots with gameday rates; easy by Texas standards.",
      rideshare: "Scott Street drops.",
      transit: "METRORail Purple Line's stadium-adjacent stops serve campus directly.",
    },
    seating: {
      bestValueSections: ["West sideline", "Corners"],
      avoidIfPossible: ["East lowers for afternoon September kicks"],
      accessibilityNote: "Modern ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Standard fare; Third Ward and EaDo options nearby.",
      nearbyPregame: ["EaDo breweries (rail-adjacent)", "Frenchy's Chicken (institution)", "downtown pre-rail"],
    },
    fanTips: [
      "Listings may say TDECU Stadium through the transition — same building, renamed for 2026.",
      "Big 12 marquee visitors (Kansas, Texas Tech, etc.) are the games that fill it.",
      "September Houston humidity says night games only if you can choose."
    ],
    officialLinks: {
      website: "https://uhcougars.com/facilities/football-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "jack-trice-stadium-ames-ia": {
    name: "Jack Trice Stadium",
    aliases: ["Jack Trice", "Cyclone Stadium"],
    city: "Ames",
    state: "IA",
    summary: "Iowa State's home — the only FBS stadium named for a Black athlete, with a farm-belt tailgate scene and Cy-Hawk hostility when Iowa visits.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Loyal-through-everything cardinal-and-gold; the Matt Campbell era made Saturdays matter",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Massive grass lots — among the country's great flat-land tailgate sprawls.",
      rideshare: "University Blvd drops.",
      transit: "CyRide gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Upper corners", "South end"],
      avoidIfPossible: ["West lowers for afternoon sun early season"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Ames's Campustown covers the rest.",
      nearbyPregame: ["Grass-lot tailgates", "Campustown (Welch Ave)", "Hickory Park BBQ (institution)"],
    },
    fanTips: [
      "Hickory Park's post-game BBQ-and-ice-cream is the Ames tradition worth the line.",
      "Cy-Hawk week (Iowa) doubles prices and tension.",
      "November wind across the plains is unimpeded — dress for exposure."
    ],
    officialLinks: {
      website: "https://cyclones.com/facilities/jack-trice-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "david-booth-kansas-memorial-stadium-lawrence-ks": {
    name: "David Booth Kansas Memorial Stadium",
    aliases: ["Kansas Memorial Stadium", "Memorial Stadium Lawrence", "Booth Memorial Stadium"],
    city: "Lawrence",
    state: "KS",
    summary: "Kansas's rebuilt home (major 2024-25 renovation) on the hill below the campanile — the basketball school finally gave football a modern venue.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Renovation-era optimism — KU football crowds grew with the winning and the new building",
      noiseLevel: "Medium-high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots and neighborhood streets; Lawrence compresses on gamedays.",
      rideshare: "11th Street drops.",
      transit: "Lawrence transit + gameday shuttles.",
    },
    seating: {
      bestValueSections: ["East uppers", "Corners"],
      avoidIfPossible: ["Check for any remaining construction-phase sections"],
      accessibilityNote: "Renovation brought modern ADA design; verify sections at purchase."
    },
    foodAndDrink: {
      summary: "Renovation upgraded the program; Mass Street's restaurant row is the real draw.",
      nearbyPregame: ["Massachusetts Street", "Free State Brewing", "The Wheel (campus institution)"],
    },
    fanTips: [
      "The Hill and the campanile walk down to the stadium is the classic KU approach.",
      "Rock Chalk chant at football is borrowed from the fieldhouse but still lands.",
      "Sunflower Showdown (K-State) is the fixture that matters most locally."
    ],
    officialLinks: {
      website: "https://kuathletics.com/facilities/david-booth-kansas-memorial-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "bill-snyder-family-stadium-manhattan-ks": {
    name: "Bill Snyder Family Stadium",
    aliases: ["KSU Stadium", "Wagner Field"],
    city: "Manhattan",
    state: "KS",
    summary: "Kansas State's home in the Little Apple — the Wabash Cannonball tradition and a fanbase that shows up rain, shine, or rebuilding year.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Purple-loyal and family-run-program proud; louder than its size on big nights",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Big stadium lots west of campus; simple by P4 standards.",
      rideshare: "Kimball Ave drops; thin market — plan your own exit.",
      transit: "ATA gameday routes; mostly a driving trip.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Aggieville's bar district is the pregame institution.",
      nearbyPregame: ["Aggieville (Kite's, etc.)", "Call Hall ice cream (campus dairy)", "tailgate lots"],
    },
    fanTips: [
      "The Wabash Cannonball dance (band + crowd) is the tradition to catch.",
      "Sunflower Showdown trips alternate — check whose home year it is.",
      "Flint Hills wind makes November games colder than the thermometer admits."
    ],
    officialLinks: {
      website: "https://kstatesports.com/facilities/bill-snyder-family-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "boone-pickens-stadium-stillwater-ok": {
    name: "Boone Pickens Stadium",
    aliases: ["Lewis Field"],
    city: "Stillwater",
    state: "OK",
    summary: "Oklahoma State's orange-clad home — Pistol Pete, the paddle people, and one of the closest-to-the-field sideline configurations in the sport.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Orange Power chants in a tight, loud box; Bedlam's end refocused rivalry energy on the Big 12 slate",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus and grass lots; Stillwater's two-lane approaches back up — arrive early.",
      rideshare: "Hall of Fame Ave drops; thin market.",
      transit: "OSU gameday shuttles.",
    },
    seating: {
      bestValueSections: ["Lower corners", "Upper center"],
      avoidIfPossible: ["West-facing seats for hot September kicks"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Eskimo Joe's cheese fries two blocks away are the state's second religion.",
      nearbyPregame: ["Eskimo Joe's", "The Strip (Washington St)", "tailgate lots"],
    },
    fanTips: [
      "Eskimo Joe's cheese fries: order them, thank yourself later.",
      "The 'waving wheat' celebration after scores is the local participation move.",
      "OSU tickets are mid-priced Big 12 — good value for the atmosphere delivered."
    ],
    officialLinks: {
      website: "https://okstate.com/facilities/boone-pickens-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "amon-g-carter-stadium-fort-worth-tx": {
    name: "Amon G. Carter Stadium",
    aliases: ["Amon Carter Stadium", "TCU Stadium"],
    city: "Fort Worth",
    state: "TX",
    summary: "TCU's rebuilt art-deco jewel — small (47,000), handsome, and loud when the Frogs are rolling, in Fort Worth's most pleasant campus neighborhood.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Purple-clad boutique-program pride; the 2022 title-game run era reset expectations",
      noiseLevel: "High",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus lots and neighborhood streets; manageable scale.",
      rideshare: "University Dr drops.",
      transit: "Limited — Fort Worth driving is the default.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["West lowers for afternoon September kicks"],
      accessibilityNote: "Rebuilt ADA design; accessible seating available."
    },
    foodAndDrink: {
      summary: "Solid Texas fare; the surrounding University/Magnolia districts eat well.",
      nearbyPregame: ["Magnolia Avenue", "University Drive spots", "Dutch's Hamburgers"],
    },
    fanTips: [
      "The Horned Frog hand sign ('Go Frogs') is easy to learn and universally flashed.",
      "At 47k, marquee visitors sell out fast — small-stadium scarcity is real.",
      "Fort Worth > Dallas for the visiting weekend experience; stay west."
    ],
    officialLinks: {
      website: "https://gofrogs.com/facilities/amon-g-carter-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "jones-att-stadium-lubbock-tx": {
    name: "Jones AT&T Stadium",
    aliases: ["Jones Stadium", "The Jones"],
    city: "Lubbock",
    state: "TX",
    summary: "Texas Tech's West Texas home — tortilla tosses, the Masked Rider's charge, and a Raider Power crowd that turns dust-bowl evenings electric.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Guns Up and chaotic — Lubbock crowds have real menace on big nights",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus commuter lots; everything funnels off Marsha Sharp Freeway.",
      rideshare: "University Ave drops; thin market post-game.",
      transit: "Citibus gameday routes.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["West lowers in September sun"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; Lubbock's Broadway strip and Depot District carry the day.",
      nearbyPregame: ["Depot District", "Broadway strip", "Cook's Garage (drive)"],
    },
    fanTips: [
      "The Masked Rider's full-gallop entrance is one of the sport's best live moments.",
      "Tortillas will fly at kickoff regardless of official policy — tradition finds a way.",
      "West Texas weather swings 40 degrees in a day — layer for night games even in October."
    ],
    officialLinks: {
      website: "https://texastech.com/facilities/jones-at-t-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "fbc-mortgage-stadium-orlando-fl": {
    name: "FBC Mortgage Stadium",
    aliases: ["Spectrum Stadium", "Bright House Networks Stadium", "The Bounce House"],
    city: "Orlando",
    state: "FL",
    summary: "UCF's Bounce House — the stadium that literally sways when the crowd jumps, on the nation's largest campus by enrollment.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Young, loud, and bouncing — the structure's flex is a feature, not a flaw",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Campus garages and lots; East Orlando traffic funnels on Alafaya.",
      rideshare: "Designated campus zones.",
      transit: "Limited — drive or rideshare from Orlando proper (30+ minutes).",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["Nothing structural (the bounce is intentional)"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Standard fare; the campus-adjacent Plaza on University covers pregame.",
      nearbyPregame: ["Plaza on University bars", "Knight's Pub", "Oviedo spots"],
    },
    fanTips: [
      "When 'Zombie Nation' plays and the crowd jumps, the stands move — that's the Bounce House working as designed.",
      "Florida afternoon storms hit like clockwork — evening kicks fare better.",
      "UCF tickets are among the Big 12's most affordable."
    ],
    officialLinks: {
      website: "https://ucfknights.com/facilities/fbc-mortgage-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  },

  "milan-puskar-stadium-morgantown-wv": {
    name: "Milan Puskar Stadium",
    aliases: ["Mountaineer Field", "Mountaineer Field at Milan Puskar Stadium"],
    city: "Morgantown",
    state: "WV",
    summary: "West Virginia's hillside home — 'Take Me Home, Country Roads' sung by 60,000 after wins is one of the sport's genuinely moving traditions.",
    bestFor: ["college football"],
    atmosphere: {
      vibe: "Appalachian-fierce; Morgantown night games have an old-school edge",
      noiseLevel: "Very high",
      familyFriendly: true,
      indoorOutdoor: "Outdoor"
    },
    arrival: {
      parking: "Hospital and campus lots with shuttles; Morgantown's hills compress everything.",
      rideshare: "Van Voorhis drops; thin market.",
      transit: "The PRT (personal rapid transit pods) and Mountain Line shuttles — the PRT is an experience itself.",
    },
    seating: {
      bestValueSections: ["Upper corners", "End zones"],
      avoidIfPossible: ["Nothing structural"],
      accessibilityNote: "Accessible seating available; verify sections with the ticket office."
    },
    foodAndDrink: {
      summary: "Pepperoni rolls — West Virginia's signature food — inside and everywhere.",
      nearbyPregame: ["High Street (downtown)", "Mario's Fishbowl (institution)", "tailgate lots"],
    },
    fanTips: [
      "Stay for Country Roads after a win — full-stadium, full-voice, unforgettable.",
      "Eat a pepperoni roll; it's the state in food form.",
      "The Backyard Brawl (Pitt) revival games are the circle-the-date fixtures."
    ],
    officialLinks: {
      website: "https://wvusports.com/facilities/milan-puskar-stadium",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },
    confidence: { level: "low", lastReviewed: "2026-07-09", source: "generated" }
  }
}
