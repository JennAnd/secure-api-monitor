using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Data;
using SecureApiMonitor.Api.Models;
using SecureApiMonitor.Api.Auth;
using SecureApiMonitor.Api.Auth.Requests;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace SecureApiMonitor.Api.Controllers;

// Handles user registration and login
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly PasswordHasher _hasher;
    private readonly JwtSettings _jwtSettings;

    public AuthController(
        ApplicationDbContext db,
        PasswordHasher hasher,
        IOptions<JwtSettings> jwtOptions)
    {
        _db = db;
        _hasher = hasher;
        _jwtSettings = jwtOptions.Value;
    }

    // Registers a new user
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // Check if username is taken
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest("Username already exists.");
        }

        // Create user
        var user = new User
        {
            Username = request.Username,
            PasswordHash = _hasher.Hash(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Return JWT token
        var token = CreateToken(user);
        return Ok(new { token });
    }

    // Authenticates and returns a token
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        if (!_hasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid username or password.");
        }

        var token = CreateToken(user);
        return Ok(new { token });
    }

    // Generates a JWT token for the user
    private string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("userId", user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
