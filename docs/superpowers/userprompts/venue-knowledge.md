**Recommended Shape**
```js
export const VENUE_KNOWLEDGE = {
  "michelob-ultra-arena-las-vegas-nv": {
    name: "Michelob Ultra Arena",
    aliases: ["Michelob ULTRA Arena", "Mandalay Bay Events Center"],
    city: "Las Vegas",
    state: "NV",

    summary: "Compact arena inside Mandalay Bay with strong sightlines and an easy casino-resort arrival experience.",

    bestFor: ["WNBA", "boxing", "college basketball"],
    atmosphere: {
      vibe: "Resort arena, lively but manageable",
      noiseLevel: "Medium",
      familyFriendly: true,
      indoorOutdoor: "Indoor"
    },

    arrival: {
      parking: "Use Mandalay Bay parking or rideshare if staying on the Strip.",
      rideshare: "Often easiest for visitors not staying nearby.",
      transit: "Walkable from nearby Strip resorts.",
      arrivalTip: "Arrive early if there is another major Mandalay Bay event."
    },

    seating: {
      generalTip: "Lower bowl corners and center sections are usually strong value.",
      bestValueSections: ["Lower bowl corners", "Mid-level sideline"],
      avoidIfPossible: ["Far upper corners"],
      accessibilityNote: "Check venue seating map for accessible rows before buying."
    },

    foodAndDrink: {
      summary: "Typical arena concessions with easy access to Mandalay Bay restaurants before or after.",
      nearbyPregame: ["Mandalay Bay restaurants", "Luxor", "Excalibur"],
      outsideFoodPolicy: "Check official venue policy before event day."
    },

    fanTips: [
      "If prices are close, prioritize lower bowl over floor-end views.",
      "For weekday games, rideshare pickup is usually less painful than after weekend events.",
      "Build in extra walking time because the arena is inside a large resort complex."
    ],

    officialLinks: {
      website: "https://www.mandalaybay.com/en/entertainment/michelob-ultra-arena.html",
      parking: "",
      bagPolicy: "",
      accessibility: ""
    },

    confidence: {
      level: "medium",
      lastReviewed: "2026-07-09",
      source: "manual"
    }
  }
}
```

**Fields I’d Definitely Include**
- `name`: display name.
- `aliases`: critical for matching Ticketmaster venue names that vary slightly.
- `city` / `state`: helps avoid collisions.
- `summary`: one punchy paragraph for the venue card.
- `arrival`: parking, rideshare, transit, and timing tips.
- `seating`: best value areas, avoid areas, accessibility note.
- `foodAndDrink`: quick pregame/concessions context.
- `fanTips`: the “local knowledge” bullets. This is the richest part.
- `officialLinks`: source-of-truth links for policies.
- `confidence`: protects you from presenting stale/manual info as absolute truth.

**Fields I’d Skip At First**
- Exact parking prices.
- Exact bag dimensions.
- Full concession menus.
- Detailed section-by-section reviews.
- Anything that changes event-by-event unless you have a reliable source.

My take: start with a manually curated `.js` file, but structure it like it could later accept community submissions or Gemini enrichment. The killer feature is not “facts about the venue”; it’s “what should I know before I buy or go?”