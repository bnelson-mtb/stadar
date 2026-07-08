namespace Api.Models;

/// <summary>A parsed event that survived the hard rules, before verdict application.</summary>
public record ParsedEvent(SportEvent Draft, ClassificationInput Input, string StatusCode);
