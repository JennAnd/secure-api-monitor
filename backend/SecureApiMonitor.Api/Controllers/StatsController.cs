using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Data;
using SecureApiMonitor.Api.Dtos;

namespace SecureApiMonitor.Api.Controllers;

// Handles aggregated statistics for dashboard charts
[ApiController]
[Route("api/stats")]
[Authorize] // Only logged-in users may read statistics
public class StatsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public StatsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/stats/overview
    // Returns high-level stats (total requests, error rate, average response time)
    [HttpGet("overview")]
    public async Task<ActionResult<OverviewStatsDto>> GetOverviewStats()
    {
        var totalRequests = await _db.ApiRequestLogs.CountAsync();

        if (totalRequests == 0)
        {
            return new OverviewStatsDto
            {
                TotalRequests = 0,
                ErrorRequests = 0,
                ErrorRatePercent = 0,
                AverageResponseTimeMs = 0
            };
        }

        // Count 4xx and 5xx as errors
        var errorRequests = await _db.ApiRequestLogs
            .CountAsync(l => l.StatusCode >= 400);

        var avgResponse = await _db.ApiRequestLogs
            .AverageAsync(l => (double)l.ResponseTimeMs);

        return new OverviewStatsDto
        {
            TotalRequests = totalRequests,
            ErrorRequests = errorRequests,
            ErrorRatePercent = Math.Round((double)errorRequests / totalRequests * 100, 2),
            AverageResponseTimeMs = Math.Round(avgResponse, 2)
        };
    }

    // GET /api/stats/endpoints
    // Returns per-endpoint statistics (used for bar chart)
    [HttpGet("endpoints")]
    public async Task<ActionResult<IEnumerable<EndpointStatsDto>>> GetEndpointStats()
    {
        var list = await _db.ApiRequestLogs
            .GroupBy(l => l.Endpoint)
            .Select(g => new EndpointStatsDto
            {
                Endpoint = g.Key,
                RequestCount = g.Count(),
                ErrorCount = g.Count(x => x.StatusCode >= 400),
                AverageResponseTimeMs = g.Average(x => (double)x.ResponseTimeMs)
            })
            .OrderByDescending(x => x.RequestCount)
            .Take(10)
            .ToListAsync();

        foreach (var item in list)
        {
            item.AverageResponseTimeMs = Math.Round(item.AverageResponseTimeMs, 2);
        }

        return list;
    }
}
