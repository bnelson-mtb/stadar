using System.Text.Json;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class TicketmasterClientParseTests
{
    private static JsonElement Parse(string json) => JsonDocument.Parse(json).RootElement;

    [TestMethod]
    public void SportEventContract_DoesNotExposeTicketPriceFields()
    {
        var fields = typeof(Api.Models.SportEvent).GetProperties().Select(p => p.Name).ToList();

        CollectionAssert.DoesNotContain(fields, "PriceMin");
        CollectionAssert.DoesNotContain(fields, "PriceMax");
        CollectionAssert.DoesNotContain(fields, "Currency");
    }

    [TestMethod]
    public void ParseEvent_FullEvent_MapsAllFields()
    {
        // Keep the event in the future so the past-event gate doesn't drop it.
        var start = DateTime.UtcNow.AddDays(30);
        var localDate = start.ToString("yyyy-MM-dd");
        var json = Parse($$"""
        {
          "id": "abc123",
          "name": "Utah Jazz vs. Denver Nuggets",
          "url": "https://www.ticketmaster.com/event/abc123",
          "dates": {
            "start": {
              "dateTime": "{{localDate}}T02:00:00Z",
              "localDate": "{{localDate}}",
              "localTime": "20:00:00"
            }
          },
          "classifications": [
            { "genre": { "name": "Basketball" }, "subGenre": { "name": "NBA" } }
          ],
          "images": [
            { "ratio": "3_2", "url": "https://img.example/3_2.jpg" },
            { "ratio": "16_9", "url": "https://img.example/16_9.jpg" }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Jazz" },
              { "name": "Denver Nuggets" }
            ],
            "venues": [
              {
                "name": "Delta Center",
                "city": { "name": "Salt Lake City" },
                "state": { "stateCode": "UT" },
                "location": { "latitude": "40.7683", "longitude": "-111.9011" }
              }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("abc123", ev.Id);
        Assert.AreEqual("Utah Jazz", ev.HomeTeam);
        Assert.AreEqual("Denver Nuggets", ev.AwayTeam);
        Assert.AreEqual("Basketball", ev.Sport);
        Assert.AreEqual("NBA", ev.League);
        Assert.AreEqual("Delta Center", ev.Venue);
        Assert.AreEqual("Salt Lake City", ev.City);
        Assert.AreEqual("UT", ev.State);
        Assert.AreEqual(40.7683, ev.Latitude, 0.0001);
        Assert.AreEqual(-111.9011, ev.Longitude, 0.0001);
        Assert.AreEqual("https://www.ticketmaster.com/event/abc123", ev.TicketUrl);
        Assert.AreEqual("https://img.example/16_9.jpg", ev.ImageUrl, "Should prefer the 16:9 image");
        Assert.AreEqual(localDate, ev.LocalDate);
        Assert.AreEqual("20:00:00", ev.LocalTime);
    }

    [TestMethod]
    public void ParseEvent_NoAttractions_FallsBackToVsParsing()
    {
        var json = Parse("""
        {
          "id": "x1",
          "name": "Salt Lake Bees vs. Reno Aces",
          "classifications": [
            { "genre": { "name": "Baseball" }, "subGenre": { "name": "Minor League Baseball" } }
          ]
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("Salt Lake Bees", ev.HomeTeam);
        Assert.AreEqual("Reno Aces", ev.AwayTeam);
        Assert.AreEqual("Triple-A", ev.League);
    }

    [TestMethod]
    public void ParseEvent_NoAttractions_FallsBackToSingleVParsing()
    {
        var json = Parse("""
        {
          "id": "x1b",
          "name": "Utah Utes v BYU Cougars",
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ]
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("Utah Utes", ev.HomeTeam);
        Assert.AreEqual("BYU Cougars", ev.AwayTeam);
        Assert.AreEqual("NCAAF", ev.League);
    }

    [TestMethod]
    public void ParseEvent_MultipleAttractionsNoVsInTitle_DoesNotInventAwayTeam()
    {
        var json = Parse("""
        {
          "id": "mj1",
          "name": "Utah Jazz Season Opener",
          "dates": { "start": { "dateTime": "2026-10-01T02:00:00Z" } },
          "classifications": [
            { "genre": { "name": "Basketball" }, "subGenre": { "name": "NBA" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Jazz" },
              { "name": "Denver Nuggets" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("Utah Jazz", ev.HomeTeam);
        Assert.AreEqual("", ev.AwayTeam);
    }

    [TestMethod]
    public void ParseEvent_MultipleAttractionsSingleVTitle_UsesSecondAttractionAsAwayTeam()
    {
        var json = Parse("""
        {
          "id": "mj2",
          "name": "Utah Utes v BYU Cougars",
          "dates": { "start": { "dateTime": "2026-10-01T02:00:00Z" } },
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Utes Football" },
              { "name": "BYU Cougars Football" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("Utah Utes", ev.HomeTeam);
        Assert.AreEqual("BYU Cougars", ev.AwayTeam);
    }

    [TestMethod]
    public void ParseEvent_NoIdentifiableTeams_ReturnsNull()
    {
        var json = Parse("""
        {
          "id": "x2",
          "name": "Supercross Championship"
        }
        """);

        Assert.IsNull(TicketmasterClient.ParseEvent(json));
    }

    [TestMethod]
    public void ParseEvent_MiscEventGenre_UsesAttractionClassification()
    {
        var json = Parse("""
        {
          "id": "x3",
          "name": "Utah Royals vs Angel City FC",
          "classifications": [
            { "genre": { "name": "Miscellaneous" }, "subGenre": { "name": "Miscellaneous" } }
          ],
          "_embedded": {
            "attractions": [
              {
                "name": "Utah Royals",
                "classifications": [
                  { "genre": { "name": "Soccer" }, "subGenre": { "name": "NWSL" } }
                ]
              },
              { "name": "Angel City FC" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("Soccer", ev.Sport);
        Assert.AreEqual("NWSL", ev.League);
    }

    [TestMethod]
    public void ParseEvent_LocalDateOnly_UsesVenueTimezoneEndOfDay()
    {
        // Dynamic future date so the past-event gate never drops the fixture.
        var localDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");
        var json = Parse($$"""
        {
          "id": "x4",
          "name": "Utah Utes vs BYU Cougars",
          "dates": { "timezone": "America/Denver", "start": { "localDate": "{{localDate}}" } },
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Utes Football" },
              { "name": "BYU Cougars Football" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual(localDate, ev.LocalDate);
        Assert.IsNull(ev.LocalTime);

        // End of the *venue-local* day converted to UTC — strictly later than
        // plain UTC end-of-day, so the event no longer vanishes from the feed
        // on game-day afternoon.
        var tz = TimeZoneInfo.FindSystemTimeZoneById("America/Denver");
        var endOfLocalDay = DateTime.Parse(localDate).Date.AddDays(1).AddTicks(-1);
        var expected = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(endOfLocalDay, DateTimeKind.Unspecified), tz);
        Assert.AreEqual(expected, ev.DateTime);
        Assert.IsTrue(ev.DateTime > DateTime.SpecifyKind(endOfLocalDay, DateTimeKind.Utc));
    }

    [TestMethod]
    public void ParseEvent_LocalDateOnlyNoTimezone_PadsPastUtcMidnight()
    {
        var localDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");
        var json = Parse($$"""
        {
          "id": "x5",
          "name": "Utah Utes vs BYU Cougars",
          "dates": { "start": { "localDate": "{{localDate}}" } },
          "classifications": [
            { "genre": { "name": "Football" }, "subGenre": { "name": "College Football" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Utes Football" },
              { "name": "BYU Cougars Football" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        var endOfLocalDay = DateTime.Parse(localDate).Date.AddDays(1).AddTicks(-1);
        Assert.AreEqual(
            DateTime.SpecifyKind(endOfLocalDay.AddHours(12), DateTimeKind.Utc),
            ev.DateTime);
    }

    [TestMethod]
    public void ParseEvent_TimeTba_SetsLocalTimeNull()
    {
        var json = Parse("""
        {
          "id": "x7",
          "name": "Utah Jazz vs. Denver Nuggets",
          "dates": {
            "start": {
              "localDate": "2026-10-01",
              "localTime": "19:30:00",
              "timeTBA": true
            }
          },
          "classifications": [
            { "genre": { "name": "Basketball" }, "subGenre": { "name": "NBA" } }
          ],
          "_embedded": {
            "attractions": [
              { "name": "Utah Jazz" },
              { "name": "Denver Nuggets" }
            ]
          }
        }
        """);

        var ev = TicketmasterClient.ParseEvent(json);

        Assert.IsNotNull(ev);
        Assert.AreEqual("2026-10-01", ev.LocalDate);
        Assert.IsNull(ev.LocalTime);
    }

}
