// Integration tests for authentication and protected API endpoints

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace SecureApiMonitor.Api.Tests;

public class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    // Test that a new user can register and receive a token
    [Fact]
    public async Task Register_ReturnsToken_WhenUserIsCreated()
    {
        var request = new
        {
            Username = $"user_{Guid.NewGuid():N}",
            Password = "Test123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("token", body);
    }

    // Test that register fails when the username already exists
    [Fact]
    public async Task Register_ReturnsBadRequest_WhenUsernameAlreadyExists()
    {
        var username = $"user_{Guid.NewGuid():N}";
        var password = "Test123!";

        var request = new
        {
            Username = username,
            Password = password
        };

        var firstResponse = await _client.PostAsJsonAsync("/api/auth/register", request);
        firstResponse.EnsureSuccessStatusCode();

        var secondResponse = await _client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);

        var body = await secondResponse.Content.ReadAsStringAsync();
        Assert.Contains("Username already exists", body);
    }

    // Test that a user can log in with correct credentials
    [Fact]
    public async Task Login_ReturnsToken_WhenCredentialsAreCorrect()
    {
        var username = $"user_{Guid.NewGuid():N}";
        var password = "Test123!";

        var registerRequest = new
        {
            Username = username,
            Password = password
        };

        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new
        {
            Username = username,
            Password = password
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("token", body);
    }

    // Test that login fails when the password is wrong
    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordIsWrong()
    {
        var username = $"user_{Guid.NewGuid():N}";
        var password = "Test123!";

        var registerRequest = new
        {
            Username = username,
            Password = password
        };

        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var wrongLoginRequest = new
        {
            Username = username,
            Password = "WrongPassword123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login", wrongLoginRequest);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Test that a protected endpoint returns unauthorized without a token
    [Fact]
    public async Task ProtectedEndpoint_ReturnsUnauthorized_WithoutToken()
    {
        var response = await _client.GetAsync("/api/secure/status");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Test that a protected endpoint works with a valid token
    [Fact]
    public async Task ProtectedEndpoint_ReturnsSuccess_WithValidToken()
    {
        var username = $"user_{Guid.NewGuid():N}";
        var password = "Test123!";

        var registerRequest = new
        {
            Username = username,
            Password = password
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        var authResponse = await registerResponse.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(authResponse);
        Assert.False(string.IsNullOrWhiteSpace(authResponse!.Token));

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", authResponse.Token);

        var response = await _client.GetAsync("/api/secure/status");

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("You are authenticated.", body);
        Assert.Contains(username, body);
    }

    private class TokenResponse
    {
        public string Token { get; set; } = string.Empty;
    }
}