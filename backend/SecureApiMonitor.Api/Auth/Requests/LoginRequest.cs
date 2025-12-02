// Data sent by the client when logging in.
namespace SecureApiMonitor.Api.Auth.Requests;

/// <summary>
/// The data a user sends when logging in
/// </summary>

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
