using Microsoft.AspNetCore.Http;
using SecureApiMonitor.Api.Data;
using SecureApiMonitor.Api.Models;
using System.Diagnostics;

// Middleware that logs every incoming request and saves it to the database
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
    {
            // Only log real monitored API endpoints
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // Skip internal monitoring endpoints (dashboard polling)
                if (path.StartsWith("/api/logs") ||
                    path.StartsWith("/api/stats") ||
                    path.StartsWith("/swagger") ||
                    path.StartsWith("/favicon"))
                {
                    await _next(context);
                    return;
                }


        // Track how long the request takes
        var stopwatch = new Stopwatch();
        stopwatch.Start();

        string ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string method = context.Request.Method;
        string endpoint = context.Request.Path.Value ?? "";

        int statusCode = 200;
        string? error = null;

        try
        {
            // Pass request forward in the pipeline
            await _next(context);
            statusCode = context.Response.StatusCode;
        }
        catch (Exception ex)
        {
            // Capture exceptions
            statusCode = 500;
            error = ex.Message;
            throw;
        }
        finally
        {
            stopwatch.Stop();

            var log = new ApiRequestLog
            {
                Timestamp = DateTime.UtcNow,
                IpAddress = ip,
                Method = method,
                Endpoint = endpoint,
                StatusCode = statusCode,
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
                ErrorMessage = error
            };

            // Save log entry
            db.ApiRequestLogs.Add(log);
            await db.SaveChangesAsync();
        }
    }
}

