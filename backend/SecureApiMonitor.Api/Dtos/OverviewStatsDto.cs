namespace SecureApiMonitor.Api.Dtos;

public class OverviewStatsDto
{
    public int TotalRequests { get; set; }
    public int ErrorRequests { get; set; }
    public double ErrorRatePercent { get; set; }
    public double AverageResponseTimeMs { get; set; }
}
