// Helper class for hashing and verifying passwords using SHA256
using System.Security.Cryptography;
using System.Text;

namespace SecureApiMonitor.Api.Auth;

public class PasswordHasher
{
    // Hashes a plain text password into a SHA256 string
    public string Hash(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash); // returns uppercase hex string
    }

    // Checks if a given plain text password matches a stored hash.
    public bool Verify(string password, string storedHash)
    {
        return Hash(password) == storedHash;
    }
}
