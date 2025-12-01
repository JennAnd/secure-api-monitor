namespace SecureApiMonitor.Api.Auth;

// Holds the JWT settings (issuer, audience and secret key) 
// so the app can read them from appsettings.json
public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string Key { get; set; } = string.Empty;
}
