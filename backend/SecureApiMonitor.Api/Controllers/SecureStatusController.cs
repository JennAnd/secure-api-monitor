using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SecureApiMonitor.Api.Controllers;

// Protected endpoint to verify that JWT auth works
[ApiController]
[Route("api/secure")]
[Authorize]
public class SecureStatusController : ControllerBase
{
    // GET /api/secure/status
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var username = User.Identity?.Name ?? "unknown";

        return Ok(new
        {
            message = "You are authenticated.",
            user = username
        });
    }
}
