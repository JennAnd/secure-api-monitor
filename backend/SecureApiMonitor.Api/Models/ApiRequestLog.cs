namespace SecureApiMonitor.Api.Models;

// Represents a logged API request and its metadata
public class ApiRequestLog
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; }

    public string IpAddress { get; set; } = string.Empty;

    public string Method { get; set; } = string.Empty;

    public string Endpoint { get; set; } = string.Empty;

    public int StatusCode { get; set; }

    public int ResponseTimeMs { get; set; }

    public string? ErrorMessage { get; set; }
}
