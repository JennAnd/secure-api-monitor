// Sets up the application, configures the database connection, authentication and registers required services
using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SecureApiMonitor.Api.Auth;


// Load application configuration and build the service container
var builder = WebApplication.CreateBuilder(args);

// Load JWT settings from configuration.
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSettings = jwtSection.Get<JwtSettings>();

// Simple safety check so the app fails early if configuration is missing.
if (jwtSettings is null)
{
    throw new InvalidOperationException("JWT settings are missing in configuration.");
}

builder.Services.Configure<JwtSettings>(jwtSection);


// Get the connection string from appsettings.Development.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register the EF Core DbContext with PostgreSQL provider
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));


// Add services to the container
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT-based authentication.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
    };
});

// Makes PasswordHasher available to controllers
builder.Services.AddSingleton<PasswordHasher>();

// Add authorization services.
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable authentication and authorization.
app.UseAuthentication();
app.UseAuthorization();

// Map attribute-routed controllers like AuthController
app.MapControllers();

app.Run();
