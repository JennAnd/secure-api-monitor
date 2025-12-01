// Data sent by the client when registering a new user.
namespace SecureApiMonitor.Api.Auth.Requests;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
