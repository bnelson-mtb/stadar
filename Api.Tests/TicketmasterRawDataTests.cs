using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

[TestClass]
public class TicketmasterRawDataTests
{
    private const string ApiKey = "7D0obnTksI4MrAQxNosbV3tUiwjyuspr";
    private static readonly HttpClient Client = new();

    // ---- Change this to inspect a different event (0-49) ----
    private const int EventIndex = 1;

    [TestMethod]
    public async Task DumpSingleEvent_RawJson()
    {
        var url = $"https://app.ticketmaster.com/discovery/v2/events.json?apikey={ApiKey}&stateCode=UT&classificationName=sports&size=50&sort=date,asc";

        var response = await Client.GetAsync(url);
        Assert.IsTrue(response.IsSuccessStatusCode, $"API returned {response.StatusCode}");

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.IsTrue(json.TryGetProperty("_embedded", out var embedded), "No _embedded property — zero results?");
        Assert.IsTrue(embedded.TryGetProperty("events", out var events), "No events array in _embedded");

        var eventList = events.EnumerateArray().ToList();
        Console.WriteLine($"=== Total events: {eventList.Count} | Showing index: {EventIndex} ===\n");

        // Print quick index of all events so you can pick
        for (int j = 0; j < eventList.Count; j++)
        {
            var n = eventList[j].TryGetProperty("name", out var np) ? np.GetString() : "?";
            var marker = j == EventIndex ? " <<<" : "";
            Console.WriteLine($"  [{j}] {n}{marker}");
        }
        Console.WriteLine();

        Assert.IsTrue(EventIndex >= 0 && EventIndex < eventList.Count,
            $"EventIndex {EventIndex} out of range (0-{eventList.Count - 1})");

        var ev = eventList[EventIndex];
        Console.WriteLine($"╔══════════════════════════════════════════════════════════════");
        Console.WriteLine($"║ EVENT {EventIndex} — {GetString(ev, "name")}");
        Console.WriteLine($"╚══════════════════════════════════════════════════════════════");

            // Basic info
            var id = GetString(ev, "id");
            var name = GetString(ev, "name");
            var eventUrl = GetString(ev, "url");
            Console.WriteLine($"  ID:   {id}");
            Console.WriteLine($"  Name: {name}");
            Console.WriteLine($"  URL:  {eventUrl}");

            // Dates
            if (ev.TryGetProperty("dates", out var dates))
            {
                Console.WriteLine($"\n  DATES (raw):");
                if (dates.TryGetProperty("start", out var start))
                {
                    Console.WriteLine($"    start.dateTime:  {GetString(start, "dateTime")}");
                    Console.WriteLine($"    start.localDate: {GetString(start, "localDate")}");
                    Console.WriteLine($"    start.localTime: {GetString(start, "localTime")}");
                    Console.WriteLine($"    start.dateTBD:   {GetString(start, "dateTBD")}");
                    Console.WriteLine($"    start.timeTBA:   {GetString(start, "timeTBA")}");
                }
                if (dates.TryGetProperty("status", out var status))
                    Console.WriteLine($"    status.code:     {GetString(status, "code")}");
            }

            // Classifications (sport, genre, subGenre)
            if (ev.TryGetProperty("classifications", out var classifications))
            {
                Console.WriteLine($"\n  CLASSIFICATIONS:");
                int ci = 0;
                foreach (var c in classifications.EnumerateArray())
                {
                    Console.WriteLine($"    [{ci}] segment:  {GetNestedName(c, "segment")}");
                    Console.WriteLine($"    [{ci}] genre:    {GetNestedName(c, "genre")}");
                    Console.WriteLine($"    [{ci}] subGenre: {GetNestedName(c, "subGenre")}");
                    Console.WriteLine($"    [{ci}] type:     {GetNestedName(c, "type")}");
                    Console.WriteLine($"    [{ci}] subType:  {GetNestedName(c, "subType")}");
                    ci++;
                }
            }

            // Attractions (teams)
            if (ev.TryGetProperty("_embedded", out var evEmbedded) &&
                evEmbedded.TryGetProperty("attractions", out var attractions))
            {
                Console.WriteLine($"\n  ATTRACTIONS (teams):");
                int ai = 0;
                foreach (var a in attractions.EnumerateArray())
                {
                    Console.WriteLine($"    [{ai}] name: {GetString(a, "name")}");
                    Console.WriteLine($"    [{ai}] id:   {GetString(a, "id")}");
                    if (a.TryGetProperty("classifications", out var aC))
                    {
                        var first = aC.EnumerateArray().FirstOrDefault();
                        Console.WriteLine($"    [{ai}] genre:    {GetNestedName(first, "genre")}");
                        Console.WriteLine($"    [{ai}] subGenre: {GetNestedName(first, "subGenre")}");
                    }
                    ai++;
                }
            }
            else
            {
                Console.WriteLine($"\n  ATTRACTIONS: (none)");
            }

            // Venues
            if (ev.TryGetProperty("_embedded", out var evEmb2) &&
                evEmb2.TryGetProperty("venues", out var venues))
            {
                Console.WriteLine($"\n  VENUES:");
                int vi = 0;
                foreach (var v in venues.EnumerateArray())
                {
                    Console.WriteLine($"    [{vi}] name:  {GetString(v, "name")}");
                    Console.WriteLine($"    [{vi}] id:    {GetString(v, "id")}");
                    if (v.TryGetProperty("city", out var city))
                        Console.WriteLine($"    [{vi}] city:  {GetString(city, "name")}");
                    if (v.TryGetProperty("state", out var state))
                        Console.WriteLine($"    [{vi}] state: {GetString(state, "stateCode")}");
                    if (v.TryGetProperty("location", out var loc))
                    {
                        Console.WriteLine($"    [{vi}] lat:   {GetString(loc, "latitude")}");
                        Console.WriteLine($"    [{vi}] lng:   {GetString(loc, "longitude")}");
                    }
                    vi++;
                }
            }

            // Images
            if (ev.TryGetProperty("images", out var images))
            {
                var imageList = images.EnumerateArray().ToList();
                Console.WriteLine($"\n  IMAGES ({imageList.Count} total):");
                foreach (var img in imageList.Take(3))
                {
                    var ratio = img.TryGetProperty("ratio", out var r) ? r.GetString() : "?";
                    var w = img.TryGetProperty("width", out var wP) ? wP.ToString() : "?";
                    var h = img.TryGetProperty("height", out var hP) ? hP.ToString() : "?";
                    var imgUrl = GetString(img, "url");
                    Console.WriteLine($"    {ratio} {w}x{h} → {imgUrl}");
                }
                if (imageList.Count > 3)
                    Console.WriteLine($"    ... and {imageList.Count - 3} more");
            }

            // Price ranges
            if (ev.TryGetProperty("priceRanges", out var prices))
            {
                Console.WriteLine($"\n  PRICE RANGES:");
                foreach (var p in prices.EnumerateArray())
                {
                    var min = p.TryGetProperty("min", out var minP) ? minP.ToString() : "?";
                    var max = p.TryGetProperty("max", out var maxP) ? maxP.ToString() : "?";
                    var currency = GetString(p, "currency");
                    Console.WriteLine($"    ${min} - ${max} {currency}");
                }
            }

            Console.WriteLine();
    }

    private static string GetString(JsonElement el, string prop)
    {
        return el.TryGetProperty(prop, out var val) ? val.ToString() : "(missing)";
    }

    private static string GetNestedName(JsonElement el, string prop)
    {
        if (el.TryGetProperty(prop, out var nested) && nested.TryGetProperty("name", out var name))
            return name.GetString() ?? "(null)";
        return "(missing)";
    }
}
