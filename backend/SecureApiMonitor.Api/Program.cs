// Sets up the application, configures the database connection, authentication and registers required services
using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SecureApiMonitor.Api.Auth;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using System.Reflection;


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

// Enable automatic model validation with FluentValidation
builder.Services.AddFluentValidationAutoValidation();

// Register all validators that exist in this API project
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow the Angular frontend on localhost:4200 to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddRateLimiter(options =>
{
    // Return 429 when a client is rate limited
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global limiter: applies to all endpoints, per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>

    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            // Allow 100 requests
            PermitLimit = 100,

            // Per 5 minutes
            Window = TimeSpan.FromMinutes(5),

            // Do not queue extra requests
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

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

// Enable CORS so the Angular app can reach this API from another origin
app.UseCors("AllowFrontend");

// Apply rate limiting to all incoming requests
app.UseRateLimiter();

// Enable authentication and authorization.
app.UseAuthentication();
app.UseAuthorization();

// Log all requests
app.UseMiddleware<RequestLoggingMiddleware>();

// Map attribute-routed controllers like AuthController
app.MapControllers();

app.Run();
