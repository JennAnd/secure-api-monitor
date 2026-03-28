using Microsoft.AspNetCore.Http;
using SecureApiMonitor.Api.Data;
using SecureApiMonitor.Api.Models;
using System.Diagnostics;


// Middleware that logs selected API requests and saves them to the database
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
    {
            // Read the request path
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // Ignore browser preflight & automatic framework requests
            if (context.Request.Method == "OPTIONS" ||
                    context.Request.Method == "HEAD")
            {
                await _next(context);
                return;
            }

            // Mark known endpoints we want to monitor
            var isMonitoredEndpoint =
                path.StartsWith("/api/secure") ||
                path == "/api/auth/login" ||
                path == "/api/auth/register";

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

            // Save the request if it is a monitored endpoint
            // or if it returned 404 (unknown endpoint)
            if (isMonitoredEndpoint || statusCode == 404)
            {
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
    }

