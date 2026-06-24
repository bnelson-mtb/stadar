namespace Api.Models;

public record SportEvent(
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
    string LocalDate = "",
    string? LocalTime = null
);
