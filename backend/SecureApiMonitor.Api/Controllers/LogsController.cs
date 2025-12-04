using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureApiMonitor.Api.Data;

namespace SecureApiMonitor.Api.Controllers;

// Handles reading API request logs
[ApiController]
[Route("api/logs")]
[Authorize] // Only logged-in users may read logs
public class LogsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public LogsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/logs
    // Returns all logged API requests (later we add filtering)
    [HttpGet]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _db.ApiRequestLogs
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }
}
