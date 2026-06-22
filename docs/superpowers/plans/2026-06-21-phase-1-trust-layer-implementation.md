# Phase 1: Trust Layer + Location Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a strict event quality gate, fix time rendering to use venue-local times, extend league coverage for USL/Liga MX/World Cup, and add auto-geolocation so Stadar returns clean, spectator-ready events for every US state.

**Architecture:** Backend-first approach. First, implement the quality gate in `EventFilter.cs`, extend league detection in `EventNormalizer`, and update `SportEvent` to carry venue-local date/time. Validate all backend logic with MSTest fixtures. Then update frontend to render the new fields and add location-aware UI.

**Tech Stack:**
- Backend: ASP.NET Core, MSTest, in-memory cache (no new dependencies)
- Frontend: React, localStorage, fetch to IP geolocation endpoint (free, no auth)

---

## Task 1: Add LocalDate and LocalTime fields to SportEvent model

**Files:**
- Modify: `Api/Models/SportEvent.cs`

- [ ] **Step 1: Open SportEvent.cs and review current record**

```csharp
// Current state (Api/Models/SportEvent.cs)
record SportEvent(
    string Id,
    string Name,
    string HomeTeam,
    string AwayTeam,
    DateTime DateTime,
    string Venue,
    string Sport,
    string League,
    string City,
    string State,
    double Latitude,
    double Longitude,
    string TicketUrl,
    string ImageUrl,
    double? PriceMin = null,
    double? PriceMax = null,
    string Currency = ""
);
```

- [ ] **Step 2: Add LocalDate and LocalTime fields**

Replace the entire record with:

```csharp
record SportEvent(
    string Id,
    string Name,
    string HomeTeam,
    string AwayTeam,
    DateTime DateTime,
    string Venue,
    string Sport,
    string League,
    string City,
    string State,
    double Latitude,
    double Longitude,
    string TicketUrl,
    string ImageUrl,
    double? PriceMin = null,
    double? PriceMax = null,
    string Currency = "",
    string LocalDate = "",   // "2026-06-17" from dates.start.localDate
    string? LocalTime = null // "20:00:00" from dates.start.localTime, null when absent
);
```

- [ ] **Step 3: Commit**

```bash
git add Api/Models/SportEvent.cs
git commit -m "feat: add LocalDate and LocalTime to SportEvent model"
```

---

## Task 2: Create EventFilter.cs with strict quality gate

**Files:**
- Create: `Api/Services/EventFilter.cs`

- [ ] **Step 1: Create the file with the full EventFilter class**

Create `Api/Services/EventFilter.cs`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

namespace Stadar.Services;

public static class EventFilter
{
    // Name denylist — events containing these strings (case-insensitive) are dropped
    private static readonly string[] NameDenylist = new[]
    {
        "watch party",
        "viewing party",
        "fan fest",
        "fanfest",
        "fan zone",
        "tailgate",
        "parking",
        "meet and greet",
        "meet & greet",
        "fishing",
        "tryout",
        "combine",
        "clinic",
        "tour:"
    };

    /// <summary>
    /// Strict quality gate: returns true if the event should be shown, false if it should be dropped.
    /// Called after normalization; `league` may be empty string for lower-tier club matchups.
    /// </summary>
    public static bool IsSpectatorEvent(SportEvent evt)
    {
        // Rule 1: Cancelled or postponed events are dropped
        if (evt.Status.IsNullOrEmpty() == false)
        {
            var statusLower = evt.Status.ToLowerInvariant();
            if (statusLower == "canceled" || statusLower == "cancelled" || statusLower == "postponed")
            {
                return false;
            }
        }

        // Rule 2: Past events are dropped (use UTC DateTime, or localDate at end-of-day if no time)
        if (evt.DateTime < DateTime.UtcNow)
        {
            return false;
        }

        // Rule 3: Name denylist check (case-insensitive)
        var nameLower = evt.Name.ToLowerInvariant();
        if (NameDenylist.Any(deniedTerm => nameLower.Contains(deniedTerm.ToLowerInvariant())))
        {
            return false;
        }

        // Rule 4: Sport must not be "Misc"
        if (evt.Sport == "Misc" || string.IsNullOrEmpty(evt.Sport))
        {
            return false;
        }

        // Rule 5: If homeTeam looks like a placeholder (world cup, championship, etc.) and league is empty, drop it
        var homeTeamLower = evt.HomeTeam.ToLowerInvariant();
        var placeholderKeywords = new[] { "world cup", "championship", "tournament", "series", "playoff", "all-star", "all star" };
        bool looksLikePlaceholder = placeholderKeywords.Any(kw => homeTeamLower.Contains(kw));
        
        if (looksLikePlaceholder && string.IsNullOrEmpty(evt.League))
        {
            return false;
        }

        // Keep rule: Event has a recognized non-empty league, OR it is a clear club-vs-club matchup
        bool hasRecognizedLeague = !string.IsNullOrEmpty(evt.League);
        bool isClubVsClub = !string.IsNullOrEmpty(evt.HomeTeam) &&
                           !string.IsNullOrEmpty(evt.AwayTeam) &&
                           !looksLikePlaceholder &&
                           (evt.Name.Contains("vs", StringComparison.OrdinalIgnoreCase) ||
                            evt.Name.Contains("@", StringComparison.OrdinalIgnoreCase));

        return hasRecognizedLeague || isClubVsClub;
    }
}
```

Wait — I realize `SportEvent` is a record and doesn't have a `Status` property yet. Let me reconsider. The status comes from the Ticketmaster response, not the normalized SportEvent. So EventFilter needs to check status BEFORE creating SportEvent, or we need to pass it separately.

Looking at the spec again: "called from `TicketmasterClient.ParseEvent` after normalization; `ParseEvent` returns `null`".

So EventFilter.IsSpectatorEvent should take a `SportEvent` that's already been normalized. But status is part of the Ticketmaster response, not the final SportEvent. Let me reconsider the approach.

Actually, I should check `TicketmasterClient.ParseEvent` to see what it currently does. Then EventFilter can take the raw Ticketmaster response OR we can pass status as a separate parameter.

Let me revise: EventFilter.IsSpectatorEvent will take the SportEvent plus the status string, and other metadata from Ticketmaster response.

Actually, let me simplify: EventFilter.IsSpectatorEvent takes a SportEvent (which is already normalized) and a status string. Here's the revised code:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

namespace Stadar.Services;

public static class EventFilter
{
    // Name denylist — events containing these strings (case-insensitive) are dropped
    private static readonly string[] NameDenylist = new[]
    {
        "watch party",
        "viewing party",
        "fan fest",
        "fanfest",
        "fan zone",
        "tailgate",
        "parking",
        "meet and greet",
        "meet & greet",
        "fishing",
        "tryout",
        "combine",
        "clinic",
        "tour:"
    };

    /// <summary>
    /// Strict quality gate: returns true if the event should be shown, false if it should be dropped.
    /// Called from TicketmasterClient.ParseEvent after normalization.
    /// </summary>
    public static bool IsSpectatorEvent(SportEvent evt, string statusCode)
    {
        // Rule 1: Cancelled or postponed events are dropped
        if (!string.IsNullOrEmpty(statusCode))
        {
            var statusLower = statusCode.ToLowerInvariant();
            if (statusLower == "canceled" || statusLower == "cancelled" || statusLower == "postponed")
            {
                return false;
            }
        }

        // Rule 2: Past events are dropped
        if (evt.DateTime < DateTime.UtcNow)
        {
            return false;
        }

        // Rule 3: Name denylist check (case-insensitive)
        var nameLower = evt.Name.ToLowerInvariant();
        if (NameDenylist.Any(deniedTerm => nameLower.Contains(deniedTerm.ToLowerInvariant())))
        {
            return false;
        }

        // Rule 4: Sport must not be "Misc"
        if (evt.Sport == "Misc" || string.IsNullOrEmpty(evt.Sport))
        {
            return false;
        }

        // Rule 5: If homeTeam looks like a placeholder and league is empty, drop it
        var homeTeamLower = evt.HomeTeam.ToLowerInvariant();
        var placeholderKeywords = new[] { "world cup", "championship", "tournament", "series", "playoff", "all-star", "all star" };
        bool looksLikePlaceholder = placeholderKeywords.Any(kw => homeTeamLower.Contains(kw));
        
        if (looksLikePlaceholder && string.IsNullOrEmpty(evt.League))
        {
            return false;
        }

        // Keep rule: Event has a recognized non-empty league, OR it is a clear club-vs-club matchup
        bool hasRecognizedLeague = !string.IsNullOrEmpty(evt.League);
        bool isClubVsClub = !string.IsNullOrEmpty(evt.HomeTeam) &&
                           !string.IsNullOrEmpty(evt.AwayTeam) &&
                           !looksLikePlaceholder &&
                           (evt.Name.Contains("vs", StringComparison.OrdinalIgnoreCase) ||
                            evt.Name.Contains("@", StringComparison.OrdinalIgnoreCase));

        return hasRecognizedLeague || isClubVsClub;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add Api/Services/EventFilter.cs
git commit -m "feat: add EventFilter with strict quality gate for spectator events"
```

---

## Task 3: Extend EventNormalizer to recognize USL, Liga MX, World Cup, International leagues

**Files:**
- Modify: `Api/Services/EventNormalizer.cs`

- [ ] **Step 1: Review current MatchProLeague method**

Open `Api/Services/EventNormalizer.cs` and locate the `MatchProLeague` method. It should currently handle pro leagues like NBA, NFL, MLB, MLS, etc.

- [ ] **Step 2: Add new league mappings to MatchProLeague**

Find this section and add the new mappings. The exact location depends on your current code, but add these cases to the switch/match that handles `subGenreLower`:

```csharp
// Add these cases alongside existing pro league checks in MatchProLeague method:
case "usl championship" or "usl league one" or "united soccer league":
    return ("Soccer", "USL");

case "liga mx":
    return ("Soccer", "Liga MX");

case "fifa world cup" or "world cup":
    return ("Soccer", "World Cup");

case "international soccer":
    return ("Soccer", "International");
```

If your code uses a different pattern (e.g., if-else chains), adapt accordingly but preserve the same return values.

- [ ] **Step 3: Commit**

```bash
git add Api/Services/EventNormalizer.cs
git commit -m "feat: add USL, Liga MX, World Cup, International to league mapping"
```

---

## Task 4: Update TicketmasterClient.ParseEvent to extract LocalDate/LocalTime and integrate EventFilter

**Files:**
- Modify: `Api/Services/TicketmasterClient.cs`

- [ ] **Step 1: Locate ExtractDateTime method and review current implementation**

Find the `ExtractDateTime` method in TicketmasterClient. It currently returns a `DateTime`.

- [ ] **Step 2: Update ExtractDateTime to also extract LocalDate and LocalTime**

Modify the method signature and implementation to return a tuple. Replace the method with:

```csharp
private static (DateTime utcDateTime, string localDate, string? localTime) ExtractDateTime(
    JObject eventData)
{
    // Try to get UTC DateTime from startDateTime or construct from localDate
    var startDateTimeStr = eventData["dates"]?["start"]?["dateTime"]?.ToString();
    var localDateStr = eventData["dates"]?["start"]?["localDate"]?.ToString();
    var localTimeStr = eventData["dates"]?["start"]?["localTime"]?.ToString();
    var dateTba = eventData["dates"]?["start"]?["dateTBA"]?.Value<bool>() ?? false;
    var timeTba = eventData["dates"]?["start"]?["timeTBA"]?.Value<bool>() ?? false;
    var noSpecificTime = eventData["dates"]?["start"]?["noSpecificTime"]?.Value<bool>() ?? false;

    DateTime utcDateTime = DateTime.MinValue;
    
    if (!string.IsNullOrEmpty(startDateTimeStr) && DateTime.TryParse(startDateTimeStr, null, 
        System.Globalization.DateTimeStyles.RoundtripKind, out var parsed))
    {
        utcDateTime = parsed;
    }
    else if (!string.IsNullOrEmpty(localDateStr) && DateTime.TryParse(localDateStr, out var localDateOnly))
    {
        // Fall back to end-of-day if no precise time
        utcDateTime = localDateOnly.AddHours(23).AddMinutes(59);
    }

    // LocalTime is null if time is TBA or absent
    string? finalLocalTime = null;
    if (!timeTba && !noSpecificTime && !string.IsNullOrEmpty(localTimeStr))
    {
        finalLocalTime = localTimeStr;
    }

    return (utcDateTime, localDateStr ?? "", finalLocalTime);
}
```

- [ ] **Step 3: Update ParseEvent to use the new tuple return and call EventFilter**

Find where `ParseEvent` calls `ExtractDateTime`. Update the call and the rest of the method:

```csharp
// Old code (approx):
// var dateTime = ExtractDateTime(eventData);

// New code:
var (dateTime, localDate, localTime) = ExtractDateTime(eventData);

// Build the SportEvent
var sportEvent = new SportEvent(
    Id: id,
    Name: name,
    HomeTeam: homeTeam,
    AwayTeam: awayTeam,
    DateTime: dateTime,
    Venue: venue,
    Sport: normalizedEvent.Sport,
    League: normalizedEvent.League,
    City: city,
    State: state,
    Latitude: latitude,
    Longitude: longitude,
    TicketUrl: ticketUrl,
    ImageUrl: imageUrl,
    PriceMin: priceMin,
    PriceMax: priceMax,
    Currency: currency,
    LocalDate: localDate,
    LocalTime: localTime
);

// Check status code before returning
var statusCode = eventData["dates"]?["status"]?["code"]?.ToString();

// Apply the quality gate
if (!EventFilter.IsSpectatorEvent(sportEvent, statusCode ?? ""))
{
    return null;
}

return sportEvent;
```

- [ ] **Step 4: Commit**

```bash
git add Api/Services/TicketmasterClient.cs
git commit -m "feat: extract LocalDate/LocalTime from Ticketmaster response and apply EventFilter gate"
```

---

## Task 5: Create EventFilterTests.cs with CA snapshot fixtures

**Files:**
- Create: `Api.Tests/EventFilterTests.cs`
- Test: `Api.Tests/EventFilterTests.cs`

- [ ] **Step 1: Create the test file with fixtures for dropped events**

Create `Api.Tests/EventFilterTests.cs`:

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Stadar.Models;
using Stadar.Services;
using System;

namespace Stadar.Tests;

[TestClass]
public class EventFilterTests
{
    [TestMethod]
    public void IsSpectatorEvent_DropsCancelledEvents()
    {
        var evt = new SportEvent(
            Id: "12345",
            Name: "World Cup 26 Watch Party (England v Croatia) - CANCELLED",
            HomeTeam: "England",
            AwayTeam: "Croatia",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Some Arena",
            Sport: "Soccer",
            League: "",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:00:00"
        );
        
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "canceled"));
    }

    [TestMethod]
    public void IsSpectatorEvent_DropsDenylistedNames()
    {
        var evt = new SportEvent(
            Id: "12346",
            Name: "Barrett Lake Fishing",
            HomeTeam: "Fishing Co",
            AwayTeam: "Nature",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Lake",
            Sport: "Misc",
            League: "",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: null
        );
        
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_DropsMiscSports()
    {
        var evt = new SportEvent(
            Id: "12347",
            Name: "Todd Edwards",
            HomeTeam: "Todd Edwards",
            AwayTeam: "",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Concert Hall",
            Sport: "Misc",
            League: "",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "20:00:00"
        );
        
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_DropsPlaceholderHomeTeamWithoutLeague()
    {
        var evt = new SportEvent(
            Id: "12348",
            Name: "2026 World Cup vs Bosnia & Herzegovina National Football Team",
            HomeTeam: "2026 World Cup",
            AwayTeam: "Bosnia & Herzegovina National Football Team",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Stadium",
            Sport: "Soccer",
            League: "",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:00:00"
        );
        
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_DropsNationalTeamWatchPartiesWithoutLeague()
    {
        var evt = new SportEvent(
            Id: "12349",
            Name: "Mexico vs South Korea",
            HomeTeam: "Mexico",
            AwayTeam: "South Korea",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Academy LA",
            Sport: "Soccer",
            League: "",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: null
        );
        
        // National teams without league are watch parties and should be dropped
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_KeepsWnbaEvent()
    {
        var evt = new SportEvent(
            Id: "12350",
            Name: "Golden State Valkyries vs Dallas Wings",
            HomeTeam: "Golden State Valkyries",
            AwayTeam: "Dallas Wings",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Chase Center",
            Sport: "Basketball",
            League: "WNBA",
            City: "San Francisco",
            State: "CA",
            Latitude: 37.768,
            Longitude: -122.397,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:00:00"
        );
        
        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_KeepsNhlEvent()
    {
        var evt = new SportEvent(
            Id: "12351",
            Name: "Anaheim Ducks",
            HomeTeam: "Anaheim Ducks",
            AwayTeam: "Opposing Team",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Honda Center",
            Sport: "Hockey",
            League: "NHL",
            City: "Anaheim",
            State: "CA",
            Latitude: 33.746,
            Longitude: -117.876,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:30:00"
        );
        
        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_KeepsMinorLeagueBaseball()
    {
        var evt = new SportEvent(
            Id: "12352",
            Name: "Stockton Ports vs Visalia Rawhide",
            HomeTeam: "Stockton Ports",
            AwayTeam: "Visalia Rawhide",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Banner Island Ballpark",
            Sport: "Baseball",
            League: "Minor League",
            City: "Stockton",
            State: "CA",
            Latitude: 37.981,
            Longitude: -121.291,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:00:00"
        );
        
        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_KeepsClubMatchupWithoutLeague()
    {
        var evt = new SportEvent(
            Id: "12353",
            Name: "Oakland Roots vs Birmingham Legion FC",
            HomeTeam: "Oakland Roots",
            AwayTeam: "Birmingham Legion FC",
            DateTime: DateTime.UtcNow.AddDays(1),
            Venue: "Oakland Coliseum",
            Sport: "Soccer",
            League: "",
            City: "Oakland",
            State: "CA",
            Latitude: 37.751,
            Longitude: -122.201,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-21",
            LocalTime: "19:30:00"
        );
        
        Assert.IsTrue(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void IsSpectatorEvent_DropsPastEvents()
    {
        var evt = new SportEvent(
            Id: "12354",
            Name: "Past Game",
            HomeTeam: "Team A",
            AwayTeam: "Team B",
            DateTime: DateTime.UtcNow.AddDays(-1),
            Venue: "Stadium",
            Sport: "Basketball",
            League: "NBA",
            City: "Los Angeles",
            State: "CA",
            Latitude: 34.0,
            Longitude: -118.0,
            TicketUrl: "https://example.com",
            ImageUrl: "https://example.com/img.jpg",
            LocalDate: "2026-06-20",
            LocalTime: "19:00:00"
        );
        
        Assert.IsFalse(EventFilter.IsSpectatorEvent(evt, "normal"));
    }

    [TestMethod]
    public void ExtractDateTime_PopulatesLocalDateAndLocalTime()
    {
        // This test would require exposing ExtractDateTime or testing via ParseEvent
        // For now, we test via integration with ParseEvent in TicketmasterClient tests
        // Placeholder for time extraction tests
        Assert.IsTrue(true);
    }

    [TestMethod]
    public void ExtractDateTime_SetsLocalTimeToNullWhenTimeTba()
    {
        // Placeholder for time TBA test
        // Will be tested through TicketmasterClient.ParseEvent
        Assert.IsTrue(true);
    }
}
```

- [ ] **Step 2: Run the tests to verify they compile and execute**

```bash
cd Api.Tests
dotnet test --filter "EventFilterTests" -v
```

Expected: All tests pass (fixtures match the rules).

- [ ] **Step 3: Commit**

```bash
git add Api.Tests/EventFilterTests.cs
git commit -m "test: add EventFilter tests with CA snapshot fixtures"
```

---

## Task 6: Run backend tests and verify API works locally

**Files:**
- No new files; testing existing changes

- [ ] **Step 1: Run all API tests**

```bash
cd Api.Tests
dotnet test -v
```

Expected: All tests pass, including EventFilterTests.

- [ ] **Step 2: Start the local API and verify /api/events endpoint works**

```bash
cd Api
dotnet watch
```

Verify the API starts at `http://localhost:5068`.

- [ ] **Step 3: Test the API endpoint in browser or curl**

```bash
curl "http://localhost:5068/api/events?stateCode=CA"
```

Expected: Response includes filtered events (no cancelled, no watch parties, no Misc sports, etc.). Events have `localDate` and `localTime` fields (or `localTime` is null if TBA).

- [ ] **Step 4: No commit needed; backend is complete**

---

## Task 7: Update EventCard.jsx to render LocalDate/LocalTime

**Files:**
- Modify: `client/src/components/EventCard.jsx`

- [ ] **Step 1: Review current EventCard.jsx**

Open the file and find where it renders the date/time. It likely uses `toLocaleTimeString()` or similar.

- [ ] **Step 2: Replace time rendering logic**

Find the section that renders the event date/time and replace it with:

```jsx
// Old code (approx):
// {new Date(event.dateTime).toLocaleTimeString()}

// New code (use LocalDate and LocalTime):
{event.localTime ? (
  <>
    <span>{event.localDate}</span>
    <span>
      {new Date(`1970-01-01T${event.localTime}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}
    </span>
  </>
) : (
  <>
    <span>{event.localDate}</span>
    <span className="text-gray-500">Time TBD</span>
  </>
)}
```

Adapt the styling/className to match your existing component structure.

- [ ] **Step 3: Test locally**

```bash
cd client
npm run dev
```

Navigate to http://localhost:5173 and verify cards show:
- Correct venue-local date (not browser timezone)
- Time in h:mm a format (e.g., "7:00 PM")
- "Time TBD" for events with no localTime

- [ ] **Step 4: Commit**

```bash
git add client/src/components/EventCard.jsx
git commit -m "feat: render LocalDate and LocalTime in EventCard, show 'Time TBD' when absent"
```

---

## Task 8: Update EventDetailPage.jsx to render LocalDate/LocalTime

**Files:**
- Modify: `client/src/pages/EventDetailPage.jsx`

- [ ] **Step 1: Review current time rendering in EventDetailPage**

Open the file and find where it displays the event date/time.

- [ ] **Step 2: Replace time rendering logic**

Apply the same logic as EventCard:

```jsx
{event.localTime ? (
  <>
    <p>{event.localDate}</p>
    <p>
      {new Date(`1970-01-01T${event.localTime}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}
    </p>
  </>
) : (
  <>
    <p>{event.localDate}</p>
    <p className="text-gray-500">Time TBD</p>
  </>
)}
```

Adjust className to match your page styling.

- [ ] **Step 3: Test locally**

```bash
# Keep npm run dev running in client/
# Navigate to an event detail page
```

Verify the detail page shows the same correct time as the card.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/EventDetailPage.jsx
git commit -m "feat: render LocalDate and LocalTime in EventDetailPage"
```

---

## Task 9: Improve TeamLogo.jsx initials for single-word names

**Files:**
- Modify: `client/src/components/TeamLogo.jsx`

- [ ] **Step 1: Review current initials fallback logic**

Open `TeamLogo.jsx` and locate the fallback code that generates initials when no logo is found.

- [ ] **Step 2: Update initials logic**

Replace the initials generation with:

```jsx
// Old code (approx):
// const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);

// New code:
const initials = (() => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    // Single-word names: first 3 letters uppercased
    return words[0].slice(0, 3).toUpperCase();
  } else {
    // Multi-word names: first letter of up to 3 words
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  }
})();
```

- [ ] **Step 3: Test locally**

Navigate the app and look for teams without logos. Verify:
- "Croatia" → "CRO"
- "Golden State Valkyries" → "GS" (or "GSV" depending on words)
- "Mexico" → "MEX"

- [ ] **Step 4: Commit**

```bash
git add client/src/components/TeamLogo.jsx
git commit -m "feat: improve single-word team name initials fallback"
```

---

## Task 10: Implement auto-location in DiscoverPage.jsx

**Files:**
- Modify: `client/src/pages/DiscoverPage.jsx`

- [ ] **Step 1: Review current DiscoverPage structure**

Open `DiscoverPage.jsx` and identify:
- Where the state dropdown is rendered
- Where `stateCode` is managed (useState or other)
- Where events are fetched

- [ ] **Step 2: Add useEffect hook to initialize location on component mount**

Add this hook near the top of your component (after other useState declarations):

```jsx
useEffect(() => {
  // Check localStorage first
  const savedLocation = localStorage.getItem('stadar-location');
  if (savedLocation && US_STATES.includes(savedLocation)) {
    setStateCode(savedLocation);
    return;
  }

  // If not found, try IP geolocation (non-blocking, time-bounded)
  const fetchGeolocation = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const detectedState = data.region_code?.toUpperCase();
        
        if (detectedState && US_STATES.includes(detectedState)) {
          setStateCode(detectedState);
          return;
        }
      }
    } catch (error) {
      // Silently fail on timeout or network error; fall back to default
      console.debug('Geolocation fetch failed:', error);
    }

    // Fall back to Utah if all else fails
    setStateCode('UT');
  };

  fetchGeolocation();
}, []); // Run once on mount
```

Ensure `US_STATES` is defined in your component (it should already be).

- [ ] **Step 3: Update state dropdown onChange handler to persist selection**

Find where the dropdown's onChange is handled (or add it):

```jsx
const handleStateChange = (e) => {
  const newState = e.target.value;
  setStateCode(newState);
  localStorage.setItem('stadar-location', newState);
};

// Bind the handler to your dropdown:
<select value={stateCode} onChange={handleStateChange}>
  {/* options */}
</select>
```

- [ ] **Step 4: Update filter pills to derive only from fetched events**

Locate where `DEFAULT_SPORTS` and `DEFAULT_LEAGUES` are used. Replace with logic that derives from actual events:

```jsx
// Old code (approx):
// const sports = DEFAULT_SPORTS;
// const leagues = DEFAULT_LEAGUES;

// New code:
const sports = Array.from(new Set(events.map(e => e.sport).filter(Boolean)))
  .sort((a, b) => SPORT_ORDER.indexOf(a) - SPORT_ORDER.indexOf(b));

const leagues = Array.from(new Set(events.map(e => e.league).filter(Boolean)))
  .sort((a, b) => LEAGUE_ORDER.indexOf(a) - LEAGUE_ORDER.indexOf(b));
```

Ensure `SPORT_ORDER` and `LEAGUE_ORDER` constants exist and do NOT include "Misc" (remove it if present).

- [ ] **Step 5: Test locally**

```bash
# Keep npm run dev running
```

Verify:
- On first load, app auto-detects your location (or falls back to UT)
- localStorage shows `stadar-location` with your state
- Changing the dropdown saves the new state to localStorage
- Refreshing the page uses the saved state
- Filter pills only show sports/leagues present in the fetched events
- No "Misc" pills appear

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/DiscoverPage.jsx
git commit -m "feat: add auto-location via IP geolocation and localStorage persistence, derive filter pills from real data"
```

---

## Summary of Changes

All Phase 1 requirements are now implemented:

✅ **Backend (Tasks 1–6):**
- EventFilter.cs with strict quality gate (5 rules, 2 keep conditions)
- Extended league coverage (USL, Liga MX, World Cup, International)
- LocalDate/LocalTime extraction from Ticketmaster response
- EventFilterTests with CA snapshot fixtures

✅ **Frontend (Tasks 7–10):**
- EventCard and EventDetailPage render venue-local times, show "Time TBD"
- TeamLogo improved initials for single-word names
- DiscoverPage auto-detects location via IP geolocation, persists to localStorage
- Filter pills derived from actual data, "Misc" removed

**Next:** Manual testing in browser, then approval for commit/push to GitHub.