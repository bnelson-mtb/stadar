using System;
using System.Linq;
using Api.Models;

namespace Api.Services;

/// <summary>
/// Quality gate for spectator events. Filters out cancelled/postponed events,
/// past events, fan experiences, non-sporting events, and placeholder teams.
/// </summary>
public static class EventFilter
{
    private static readonly string[] NameDenylist =
    [
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
        "tour:",
    ];

    /// <summary>
    /// Determines if an event qualifies as a spectator event after normalization.
    /// Applies strict rules to filter out low-quality events.
    /// </summary>
    /// <param name="evt">The normalized SportEvent from the API</param>
    /// <param name="statusCode">The raw status code from Ticketmaster (e.g., "onsale", "cancelled")</param>
    /// <returns>true if the event is a valid spectator event; false if it should be dropped</returns>
    public static bool IsSpectatorEvent(SportEvent evt, string statusCode)
    {
        // Rule 1: Check status code for cancelled/postponed
        if (IsCancelledOrPostponed(statusCode))
            return false;

        // Rule 2: Check if event is in the past
        if (evt.DateTime < DateTime.UtcNow)
            return false;

        // Rule 3: Check if event name is on the denylist
        if (IsOnDenylist(evt.Name))
            return false;

        // Rule 4: Check if sport is unrecognized (Misc or empty)
        if (string.IsNullOrWhiteSpace(evt.Sport) || evt.Sport == "Misc")
            return false;

        // Rule 5: Check if home team is a placeholder with no league
        if (IsPlaceholderTeam(evt.HomeTeam) && string.IsNullOrWhiteSpace(evt.League))
            return false;

        // Keep rule 1: Event has a recognized, non-empty League
        if (!string.IsNullOrWhiteSpace(evt.League))
            return true;

        // Keep rule 2: Clear club-vs-club matchup
        if (IsClearClubVsClubMatchup(evt))
            return true;

        // No keep conditions met — drop the event
        return false;
    }

    private static bool IsCancelledOrPostponed(string statusCode)
    {
        if (string.IsNullOrWhiteSpace(statusCode))
            return false;

        var lowerStatus = statusCode.ToLowerInvariant();
        return lowerStatus == "canceled" || lowerStatus == "cancelled" || lowerStatus == "postponed";
    }

    private static bool IsOnDenylist(string eventName)
    {
        if (string.IsNullOrWhiteSpace(eventName))
            return false;

        var lowerName = eventName.ToLowerInvariant();
        return NameDenylist.Any(item => lowerName.Contains(item));
    }

    private static bool IsPlaceholderTeam(string teamName)
    {
        if (string.IsNullOrWhiteSpace(teamName))
            return false;

        var lowerTeam = teamName.ToLowerInvariant();
        return lowerTeam.Contains("world cup")
            || lowerTeam.Contains("championship")
            || lowerTeam.Contains("tournament")
            || lowerTeam.Contains("series")
            || lowerTeam.Contains("playoff")
            || lowerTeam.Contains("all-star")
            || lowerTeam.Contains("all star");
    }

    private static bool IsClearClubVsClubMatchup(SportEvent evt)
    {
        // Both teams must be non-empty and non-placeholder
        if (string.IsNullOrWhiteSpace(evt.HomeTeam) || string.IsNullOrWhiteSpace(evt.AwayTeam))
            return false;

        if (IsPlaceholderTeam(evt.HomeTeam) || IsPlaceholderTeam(evt.AwayTeam))
            return false;

        // Event name must contain "vs" or "@"
        if (string.IsNullOrWhiteSpace(evt.Name))
            return false;

        var lowerName = evt.Name.ToLowerInvariant();
        return lowerName.Contains("vs") || lowerName.Contains("@");
    }
}
