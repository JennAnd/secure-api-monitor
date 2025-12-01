// Represents an application user and stores basic login data.
namespace SecureApiMonitor.Api.Models;

public class User
{
    public int Id { get; set; }

    // Username chosen by the user (must be unique)
    public string Username { get; set; } = string.Empty;

    // Hashed password (we never store plain text)
    public string PasswordHash { get; set; } = string.Empty;
}
