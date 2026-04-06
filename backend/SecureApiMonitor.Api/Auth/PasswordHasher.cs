// Helper class for securely hashing and verifying passwords using ASP.NET Identity

using Microsoft.AspNetCore.Identity;

namespace SecureApiMonitor.Api.Auth;

public class PasswordHasher
{
    // Built-in password hasher from ASP.NET Identity
    private readonly Microsoft.AspNetCore.Identity.PasswordHasher<object> _hasher
        = new Microsoft.AspNetCore.Identity.PasswordHasher<object>();

    // Hashes a plain text password before saving it to the database
    public string Hash(string password)
    {
        return _hasher.HashPassword(null, password);
    }

    // Verifies if the entered password matches the stored hashed password
    public bool Verify(string password, string storedHash)
    {
        var result = _hasher.VerifyHashedPassword(null, storedHash, password);
        return result == PasswordVerificationResult.Success;
    }
}