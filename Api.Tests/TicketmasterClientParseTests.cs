using System.Text.Json;
using Api.Services;

namespace Api.Tests;

[TestClass]
public class TicketmasterClientParseTests
{
    private static JsonElement Parse(string json) => JsonDocument.Parse(json).RootElement;

    [TestMethod]
    public void ParseEvent_FullEvent_MapsAllFields()
    {
        var json = Parse("""
        {
          "id": "abc123",
          "name": "Utah Jazz vs. Denver Nuggets",
          "url": "https://www.ticketmaster.com/event/abc123",
          "dates": { "start": { "dateTime": "2026-07-01T02:00:00Z" } },
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
        Assert.AreEqual("Minor League", ev.League);
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
    public void ParseEvent_LocalDateOnly_StillParsesDate()
    {
        var json = Parse("""
        {
          "id": "x4",
          "name": "Utah Utes vs BYU Cougars",
          "dates": { "start": { "localDate": "2026-09-12" } },
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
        Assert.AreEqual(new DateTime(2026, 9, 12), ev.DateTime.Date);
        Assert.AreEqual("Utah Utes", ev.HomeTeam);
        Assert.AreEqual("BYU Cougars", ev.AwayTeam);
    }

    [TestMethod]
    public void ParseEvent_WithPriceRanges_ExtractsPriceInfo()
    {
        var json = Parse("""
        {
          "id": "x5",
          "name": "Utah Jazz vs. Denver Nuggets",
          "dates": { "start": { "dateTime": "2026-10-01T02:00:00Z" } },
          "classifications": [
            { "genre": { "name": "Basketball" }, "subGenre": { "name": "NBA" } }
          ],
          "priceRanges": [
            {
              "type": "standard",
              "currency": "USD",
              "min": 25.50,
              "max": 150.00
            }
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
        Assert.IsNotNull(ev.PriceMin);
        Assert.IsNotNull(ev.PriceMax);
        Assert.AreEqual(25.50, ev.PriceMin.Value, 0.01);
        Assert.AreEqual(150.00, ev.PriceMax.Value, 0.01);
        Assert.AreEqual("USD", ev.Currency);
    }

    [TestMethod]
    public void ParseEvent_NoPriceRanges_PriceFieldsNull()
    {
        var json = Parse("""
        {
          "id": "x6",
          "name": "Utah Jazz vs. Denver Nuggets",
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
        Assert.IsNull(ev.PriceMin);
        Assert.IsNull(ev.PriceMax);
        Assert.AreEqual("", ev.Currency);
    }
}
