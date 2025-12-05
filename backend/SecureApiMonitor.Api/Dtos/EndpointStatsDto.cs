namespace SecureApiMonitor.Api.Dtos;

public class EndpointStatsDto
{
    public string Endpoint { get; set; } = string.Empty;
    public int RequestCount { get; set; }
    public int ErrorCount { get; set; }
    public double AverageResponseTimeMs { get; set; }
}
